import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------------------------------------------------------------------------
// Best-effort, in-memory abuse protection for /api/public/analytics.
//
// IMPORTANT: This is process-local (per Worker/SSR instance), NOT a shared/
// distributed rate limiter. Multiple instances each have their own bucket,
// so an attacker hitting different instances can exceed the nominal limit.
// This is intentional MVP-level protection — not a substitute for a real
// distributed limiter (e.g. Redis/Upstash/Cloudflare KV).
// ---------------------------------------------------------------------------

// Token bucket: ~30 events/minute per IP, burst of 10.
const RATE_CAPACITY = 10; // burst allowance
const RATE_REFILL_PER_SEC = 30 / 60; // 0.5 tokens/sec → 30/min sustained
const BUCKET_TTL_MS = 10 * 60 * 1000; // forget IPs idle >10 min
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Payload caps
const MAX_BODY_BYTES = 2048; // tightened from 8 KB
const MAX_PROPS_KEYS = 20;
const MAX_PROP_KEY_LEN = 64;
const MAX_PROP_VALUE_LEN = 500;

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();
let lastCleanup = 0;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, b] of buckets) {
    if (now - b.updatedAt > BUCKET_TTL_MS) buckets.delete(ip);
  }
}

function takeToken(ip: string, now: number): { ok: boolean; retryAfter: number } {
  const existing = buckets.get(ip);
  const b: Bucket = existing ?? { tokens: RATE_CAPACITY, updatedAt: now };
  if (existing) {
    const elapsedSec = (now - b.updatedAt) / 1000;
    b.tokens = Math.min(RATE_CAPACITY, b.tokens + elapsedSec * RATE_REFILL_PER_SEC);
    b.updatedAt = now;
  }
  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(ip, b);
    return { ok: true, retryAfter: 0 };
  }
  buckets.set(ip, b);
  const retryAfter = Math.max(1, Math.ceil((1 - b.tokens) / RATE_REFILL_PER_SEC));
  return { ok: false, retryAfter };
}

function getClientIp(request: Request): string {
  const h = request.headers;
  // Prefer Cloudflare-set headers — they cannot be spoofed by the client.
  // Only fall back to x-forwarded-for if neither is present.
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function validateProps(props: Record<string, unknown> | undefined): boolean {
  if (!props) return true;
  const keys = Object.keys(props);
  if (keys.length > MAX_PROPS_KEYS) return false;
  for (const k of keys) {
    if (k.length > MAX_PROP_KEY_LEN) return false;
    const v = props[k];
    if (v == null) continue;
    if (typeof v === "string" && v.length > MAX_PROP_VALUE_LEN) return false;
    if (typeof v === "object") {
      // Reject nested objects/arrays larger than the per-value cap when serialized
      try {
        if (JSON.stringify(v).length > MAX_PROP_VALUE_LEN) return false;
      } catch {
        return false;
      }
    }
  }
  return true;
}

const PayloadSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  props: z.record(z.string(), z.unknown()).optional(),
  path: z.string().max(2048).optional(),
  ts: z.string().max(64).optional(),
});

export const Route = createFileRoute("/api/public/analytics")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({ ok: true, endpoint: "analytics", method: "POST" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
      POST: async ({ request }) => {
        try {
          const now = Date.now();
          cleanup(now);

          // Per-IP token bucket (in-memory, per-instance — see file header).
          const ip = getClientIp(request);
          const rl = takeToken(ip, now);
          if (!rl.ok) {
            return new Response("Too Many Requests", {
              status: 429,
              headers: {
                "Retry-After": String(rl.retryAfter),
                "Content-Type": "text/plain",
              },
            });
          }

          const raw = await request.text();
          if (!raw || raw.length > MAX_BODY_BYTES) {
            return new Response("Bad request", { status: 400 });
          }

          let json: unknown;
          try {
            json = JSON.parse(raw);
          } catch {
            return new Response("Invalid JSON", { status: 400 });
          }

          const parsed = PayloadSchema.safeParse(json);
          if (!parsed.success) {
            return new Response("Invalid payload", { status: 400 });
          }
          const { name, props, path } = parsed.data;

          if (!validateProps(props)) {
            return new Response("Invalid props", { status: 400 });
          }

          await supabaseAdmin.from("analytics_events").insert({
            name,
            props: (props ?? {}) as never,
            path: path ?? null,
          });
          return new Response("ok", { status: 204 });
        } catch {
          return new Response("Error", { status: 500 });
        }
      },
    },
  },
});
