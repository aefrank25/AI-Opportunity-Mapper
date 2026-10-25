import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachSupabaseAuth } from "@/integrations/supabase/attach-auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Failed to verify admin role");
  if (!data) throw new Response("Forbidden", { status: 403 });
}

const filtersSchema = z.object({
  sourceUrl: z.string().trim().max(200).optional().default(""),
  rating: z.enum(["all", "1", "2", "3", "4", "5"]).optional().default("all"),
});

export const listRecommendationFeedback = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((input) => filtersSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    let q = supabaseAdmin
      .from("recommendation_feedback")
      .select("id,rating,notes,source_url,top_opportunity,is_demo,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data.sourceUrl) {
      const s = `%${data.sourceUrl.replace(/[%_]/g, (m) => `\\${m}`)}%`;
      q = q.ilike("source_url", s);
    }
    if (data.rating !== "all") {
      q = q.eq("rating", Number(data.rating));
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getFeedbackStats = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: rows, error } = await supabaseAdmin
      .from("recommendation_feedback")
      .select("rating,notes,created_at")
      .limit(10000);
    if (error) throw new Error(error.message);

    const all = rows ?? [];
    const total = all.length;
    const avg = total ? all.reduce((s, r) => s + r.rating, 0) / total : 0;
    const withNotes = all.filter((r) => r.notes && r.notes.trim().length > 0).length;
    const distribution = [1, 2, 3, 4, 5].map((n) => ({
      rating: n,
      count: all.filter((r) => r.rating === n).length,
    }));

    return {
      total,
      avg: Math.round(avg * 10) / 10,
      withNotes,
      distribution,
    };
  });
