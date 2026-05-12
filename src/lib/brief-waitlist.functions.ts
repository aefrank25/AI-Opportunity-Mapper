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
    const { error } = await supabaseAdmin
      .from("implementation_brief_waitlist")
      .insert({
        email: data.email,
        source_url: data.sourceUrl ?? null,
        top_opportunity: data.topOpportunity ?? null,
        is_demo: data.isDemo ?? false,
      });

    // Treat unique-violation as success (already on the list).
    if (error && error.code !== "23505") {
      console.error("[brief-waitlist] insert failed:", error);
      throw new Error("Could not join the waitlist. Please try again.");
    }

    // Best-effort: also add to Resend Audience. Never fail the user-facing
    // submission if Resend is unreachable or returns an error.
    try {
      const lovableApiKey = process.env.LOVABLE_API_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      if (lovableApiKey && resendApiKey && audienceId) {
        const res = await fetch(
          `https://connector-gateway.lovable.dev/resend/audiences/${audienceId}/contacts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": resendApiKey,
            },
            body: JSON.stringify({
              email: data.email,
              unsubscribed: false,
            }),
          },
        );

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          // Resend returns 409-ish for duplicates; treat any "already exists" as success.
          if (!/already|exists|duplicate/i.test(body)) {
            console.error(
              `[brief-waitlist] resend audience add failed [${res.status}]: ${body}`,
            );
          }
        }
      } else {
        console.warn(
          "[brief-waitlist] Resend audience sync skipped: missing LOVABLE_API_KEY, RESEND_API_KEY, or RESEND_AUDIENCE_ID",
        );
      }
    } catch (err) {
      console.error("[brief-waitlist] resend audience add threw:", err);
    }

    return { ok: true as const };
  });
