import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { notifyOwnerOfScanBonus } from "./scan-bonus.server";

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  sourceUrl: z.string().trim().max(2048).optional().nullable(),
});

export const claimScanBonusEmail = createServerFn({ method: "POST" })
  .validator((input) => inputSchema.parse(input))
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
      return { ok: true as const, suppressed: false as const };
    }

    // 2. Insert (unique-violation = already captured, treat as success).
    const { error } = await supabaseAdmin.from("scan_bonus_emails").insert({
      email: data.email,
      source_url: data.sourceUrl ?? null,
    });

    const isDuplicate = error?.code === "23505";
    if (error && !isDuplicate) {
      console.error("[scan-bonus] insert failed:", error);
      throw new Error("Could not save your email. Please try again.");
    }

    // 2b. Fire-and-forget owner notification for genuinely new captures.
    if (!isDuplicate) {
      void notifyOwnerOfScanBonus({
        email: data.email,
        sourceUrl: data.sourceUrl ?? null,
      }).catch((err: unknown) =>
        console.error("[scan-bonus] owner notify failed:", err),
      );
    }

    // Scan-bonus emails are not synced to the marketing audience: the
    // address is unverified, so adding it could subscribe a third party.

    return { ok: true as const, suppressed: false as const };
  });

