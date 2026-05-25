import { createFileRoute } from "@tanstack/react-router";
import { sendWaitlistDigest } from "@/lib/brief-waitlist-digest.server";

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export const Route = createFileRoute("/api/public/hooks/waitlist-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.DIGEST_WEBHOOK_SECRET;
        if (!expected) {
          console.error("[waitlist-digest] DIGEST_WEBHOOK_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const provided = request.headers.get("x-webhook-secret") ?? bearer;

        if (!provided || !timingSafeEqualStr(provided, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const result = await sendWaitlistDigest();
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("[waitlist-digest route] failed:", err);
          return new Response(
            JSON.stringify({ ok: false, error: String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
