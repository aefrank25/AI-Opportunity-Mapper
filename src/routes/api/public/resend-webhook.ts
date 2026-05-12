import { createFileRoute } from "@tanstack/react-router";
import { Webhook } from "svix";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SUPPRESSION_REASONS: Record<string, "unsubscribed" | "bounced" | "complained"> = {
  "contact.unsubscribed": "unsubscribed",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

function extractEmail(eventType: string, data: Record<string, unknown>): string | null {
  // contact.* events use { email }
  if (typeof data.email === "string") return data.email.toLowerCase();
  // email.* events use { to: string[] | string }
  const to = (data as { to?: unknown }).to;
  if (Array.isArray(to) && typeof to[0] === "string") return (to[0] as string).toLowerCase();
  if (typeof to === "string") return to.toLowerCase();
  return null;
}

export const Route = createFileRoute("/api/public/resend-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RESEND_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }

        const body = await request.text();
        const headers = {
          "svix-id": request.headers.get("svix-id") ?? "",
          "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
          "svix-signature": request.headers.get("svix-signature") ?? "",
        };

        let event: { type: string; data: Record<string, unknown>; created_at?: string };
        try {
          event = new Webhook(secret).verify(body, headers) as typeof event;
        } catch (err) {
          console.warn("[resend-webhook] signature verification failed:", err);
          return new Response("Invalid signature", { status: 401 });
        }

        const eventType = event.type;
        const email = extractEmail(eventType, event.data ?? {});
        const resendEventId = headers["svix-id"] || null;

        // Idempotent log of the raw event.
        const { error: logError } = await supabaseAdmin
          .from("resend_webhook_events")
          .insert({
            event_type: eventType,
            email,
            payload: event as unknown as Record<string, unknown>,
            resend_event_id: resendEventId,
          });

        // 23505 = duplicate svix-id, treat as already-processed.
        if (logError && logError.code !== "23505") {
          console.error("[resend-webhook] failed to log event:", logError);
          return new Response("Database error", { status: 500 });
        }

        // If this is a suppression-worthy event, upsert into the suppression list.
        const reason = SUPPRESSION_REASONS[eventType];
        if (reason && email) {
          const { error: suppError } = await supabaseAdmin
            .from("email_suppressions")
            .upsert(
              {
                email,
                reason,
                source: "resend",
                metadata: { event_type: eventType, resend_event_id: resendEventId },
              },
              { onConflict: "email,reason" },
            );
          if (suppError) {
            console.error("[resend-webhook] failed to upsert suppression:", suppError);
            // Don't 500 — event is logged; Resend won't retry forever for transient DB issues.
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
