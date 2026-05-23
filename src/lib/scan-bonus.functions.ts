import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  sourceUrl: z.string().trim().max(2048).optional().nullable(),
});

export const claimScanBonusEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    // 1. Respect prior opt-outs.
    const { data: suppression, error: suppLookupError } = await supabaseAdmin
      .from("email_suppressions")
      .select("reason")
      .eq("email", data.email)
      .limit(1)
      .maybeSingle();

    if (suppLookupError) {
      console.error("[scan-bonus] suppression lookup failed:", suppLookupError);
    }

    if (suppression) {
      console.info(
        `[scan-bonus] suppressed claim for ${data.email} (${suppression.reason})`,
      );
      return { ok: true as const, suppressed: true as const };
    }

    // 2. Insert (unique-violation = already captured, treat as success).
    const { error } = await supabaseAdmin.from("scan_bonus_emails").insert({
      email: data.email,
      source_url: data.sourceUrl ?? null,
    });

    if (error && error.code !== "23505") {
      console.error("[scan-bonus] insert failed:", error);
      throw new Error("Could not save your email. Please try again.");
    }

    // 3. Best-effort sync to Resend Audience (same shape as brief-waitlist).
    try {
      const lovableApiKey = process.env.LOVABLE_API_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      if (!lovableApiKey || !resendApiKey || !audienceId) {
        console.warn(
          "[scan-bonus] Resend audience sync skipped: missing LOVABLE_API_KEY, RESEND_API_KEY, or RESEND_AUDIENCE_ID",
        );
        return { ok: true as const, suppressed: false as const };
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": resendApiKey,
      };

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
          await supabaseAdmin.from("email_suppressions").upsert(
            {
              email: data.email,
              reason: "unsubscribed",
              source: "resend",
              metadata: { discovered_via: "scan_bonus_lookup" },
            },
            { onConflict: "email,reason" },
          );
          return { ok: true as const, suppressed: true as const };
        }
      }

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
            `[scan-bonus] resend audience add failed [${addRes.status}]: ${body}`,
          );
        }
      }
    } catch (err) {
      console.error("[scan-bonus] resend audience sync threw:", err);
    }

    return { ok: true as const, suppressed: false as const };
  });
