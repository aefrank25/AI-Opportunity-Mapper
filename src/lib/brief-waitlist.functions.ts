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

    return { ok: true as const };
  });
