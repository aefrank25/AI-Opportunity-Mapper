import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  sourceUrl: z.string().trim().max(2048).optional().nullable(),
  topOpportunity: z.string().trim().max(200).optional().nullable(),
  isDemo: z.boolean().optional().default(false),
});

export const joinBriefWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    // 1. Check if this email has previously opted out (unsubscribe / bounce / complaint).
    //    If so, we still acknowledge the form silently but do NOT add them back to the
    //    Resend audience and do NOT record a fresh waitlist row — respect their opt-out.
    const { data: suppression, error: suppLookupError } = await supabaseAdmin
      .from("email_suppressions")
      .select("reason")
      .eq("email", data.email)
      .limit(1)
      .maybeSingle();

    if (suppLookupError) {
      console.error("[brief-waitlist] suppression lookup failed:", suppLookupError);
      // Fail closed-ish: continue, but we'd rather over-suppress than under-suppress
      // if Resend webhook data is unreachable. Here we choose to continue.
    }

    if (suppression) {
      console.info(
        `[brief-waitlist] suppressed signup for ${data.email} (${suppression.reason})`,
      );
      return { ok: true as const, suppressed: true as const };
    }

    // 2. Insert into the waitlist DB (unique-violation = already on the list).
    const { error } = await supabaseAdmin
      .from("implementation_brief_waitlist")
      .insert({
        email: data.email,
        source_url: data.sourceUrl ?? null,
        top_opportunity: data.topOpportunity ?? null,
        is_demo: data.isDemo ?? false,
      });

    const isDuplicate = error?.code === "23505";
    if (error && !isDuplicate) {
      console.error("[brief-waitlist] insert failed:", error);
      throw new Error("Could not join the waitlist. Please try again.");
    }

    // 2b. Fire-and-forget owner notification for genuinely new signups (skip duplicates / demo).
    if (!isDuplicate && !data.isDemo) {
      void notifyOwnerOfSignup({
        email: data.email,
        sourceUrl: data.sourceUrl ?? null,
        topOpportunity: data.topOpportunity ?? null,
      }).catch((err: unknown) => console.error("[brief-waitlist] owner notify failed:", err));
    }

    // 3. Best-effort sync to Resend Audience. Before adding, we also re-check Resend's
    //    own state for this contact — if they exist there with `unsubscribed: true`,
    //    we mirror the suppression locally and skip re-subscribing them.
    try {
      const lovableApiKey = process.env.LOVABLE_API_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      if (!lovableApiKey || !resendApiKey || !audienceId) {
        console.warn(
          "[brief-waitlist] Resend audience sync skipped: missing LOVABLE_API_KEY, RESEND_API_KEY, or RESEND_AUDIENCE_ID",
        );
        return { ok: true as const, suppressed: false as const };
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": resendApiKey,
      };

      // Check existing contact state in Resend (handles unsubscribes that haven't
      // come through the webhook yet, or cases where the webhook secret was rotated).
      const lookupRes = await fetch(
        `https://connector-gateway.lovable.dev/resend/audiences/${audienceId}/contacts/${encodeURIComponent(
          data.email,
        )}`,
        { method: "GET", headers },
      );

      if (lookupRes.ok) {
        const existing = (await lookupRes.json().catch(() => null)) as
          | { data?: { unsubscribed?: boolean } }
          | { unsubscribed?: boolean }
          | null;
        const unsubscribed =
          (existing && "data" in existing && existing.data?.unsubscribed === true) ||
          (existing && "unsubscribed" in existing && existing.unsubscribed === true);

        if (unsubscribed) {
          // Mirror Resend's opt-out into our suppression list and stop here.
          await supabaseAdmin
            .from("email_suppressions")
            .upsert(
              {
                email: data.email,
                reason: "unsubscribed",
                source: "resend",
                metadata: { discovered_via: "signup_lookup" },
              },
              { onConflict: "email,reason" },
            );
          return { ok: true as const, suppressed: true as const };
        }
      }

      // Not unsubscribed (or contact does not yet exist) — upsert as subscribed.
      const addRes = await fetch(
        `https://connector-gateway.lovable.dev/resend/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ email: data.email, unsubscribed: false }),
        },
      );

      if (!addRes.ok) {
        const body = await addRes.text().catch(() => "");
        if (!/already|exists|duplicate/i.test(body)) {
          console.error(
            `[brief-waitlist] resend audience add failed [${addRes.status}]: ${body}`,
          );
        }
      }
    } catch (err) {
      console.error("[brief-waitlist] resend audience sync threw:", err);
    }

    return { ok: true as const, suppressed: false as const };
  });

// ============================================================================
// Owner notifications (instant + used by daily digest route)
// ============================================================================

const OWNER_EMAIL = "sonorandatastrategy@gmail.com";
const FROM_ADDRESS = "AI Opportunity Mapper <onboarding@resend.dev>";

async function sendOwnerEmail(subject: string, html: string): Promise<void> {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!lovableApiKey || !resendApiKey) {
    console.warn("[brief-waitlist] owner email skipped: missing LOVABLE_API_KEY or RESEND_API_KEY");
    return;
  }
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": resendApiKey,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [OWNER_EMAIL],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[brief-waitlist] owner email send failed [${res.status}]: ${body}`);
  }
}

async function notifyOwnerOfSignup(input: {
  email: string;
  sourceUrl: string | null;
  topOpportunity: string | null;
}): Promise<void> {
  const rows: string[] = [
    `<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>`,
  ];
  if (input.sourceUrl) {
    rows.push(`<p><strong>Source URL:</strong> ${escapeHtml(input.sourceUrl)}</p>`);
  }
  if (input.topOpportunity) {
    rows.push(`<p><strong>Top opportunity:</strong> ${escapeHtml(input.topOpportunity)}</p>`);
  }
  await sendOwnerEmail(
    `New waitlist signup: ${input.email}`,
    `<h2>New waitlist signup</h2>${rows.join("")}<p style="color:#666;font-size:12px">AI Opportunity Mapper</p>`,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const sendWaitlistDigest = createServerFn({ method: "POST" })
  .handler(async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: signups, error } = await supabaseAdmin
      .from("implementation_brief_waitlist")
      .select("email, source_url, top_opportunity, created_at")
      .gte("created_at", since)
      .eq("is_demo", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[waitlist-digest] query failed:", error);
      throw new Error("Digest query failed");
    }

    const count = signups?.length ?? 0;
    if (count === 0) {
      return { ok: true as const, sent: false as const, count: 0 };
    }

    const rows = signups!
      .map((s) => {
        const parts = [`<strong>${escapeHtml(s.email)}</strong>`];
        if (s.top_opportunity) parts.push(escapeHtml(s.top_opportunity));
        if (s.source_url) parts.push(`<a href="${escapeHtml(s.source_url)}">${escapeHtml(s.source_url)}</a>`);
        parts.push(`<span style="color:#666">${new Date(s.created_at).toUTCString()}</span>`);
        return `<li style="margin-bottom:8px">${parts.join(" — ")}</li>`;
      })
      .join("");

    await sendOwnerEmail(
      `Daily waitlist digest: ${count} new signup${count === 1 ? "" : "s"}`,
      `<h2>${count} new waitlist signup${count === 1 ? "" : "s"} in the last 24h</h2><ul>${rows}</ul>`,
    );

    return { ok: true as const, sent: true as const, count };
  });
