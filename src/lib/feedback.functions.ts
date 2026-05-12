import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  notes: z.string().trim().max(2000).optional().default(""),
  sourceUrl: z.string().trim().max(2048).optional().default(""),
  topOpportunity: z.string().trim().max(200).optional().default(""),
  isDemo: z.boolean().optional().default(false),
});

export const submitRecommendationFeedback = createServerFn({ method: "POST" })
  .inputValidator((input) => feedbackSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("recommendation_feedback").insert({
      rating: data.rating,
      notes: data.notes || null,
      source_url: data.sourceUrl || null,
      top_opportunity: data.topOpportunity || null,
      is_demo: data.isDemo,
    });
    if (error) {
      console.error("[feedback] insert failed:", error);
      throw new Error("Could not save feedback. Please try again.");
    }
    return { ok: true };
  });
