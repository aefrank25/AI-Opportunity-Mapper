import { createFileRoute } from "@tanstack/react-router";
import { sendWaitlistDigest } from "@/lib/brief-waitlist.functions";

export const Route = createFileRoute("/api/public/hooks/waitlist-digest")({
  server: {
    handlers: {
      POST: async () => {
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
