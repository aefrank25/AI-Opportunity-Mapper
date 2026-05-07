import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachSupabaseAuth } from "@/integrations/supabase/attach-auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  // Use admin client to read role (bypasses RLS recursion concerns).
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Failed to verify admin role");
  if (!data) throw new Response("Forbidden", { status: 403 });
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

const filtersSchema = z.object({
  search: z.string().trim().max(200).optional().default(""),
  isDemo: z.enum(["all", "demo", "real"]).optional().default("all"),
  range: z.enum(["all", "7d", "30d", "90d"]).optional().default("all"),
});

function rangeStart(range: "all" | "7d" | "30d" | "90d"): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const listWaitlistEntries = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((input) => filtersSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    let q = supabaseAdmin
      .from("implementation_brief_waitlist")
      .select("id,email,source_url,top_opportunity,is_demo,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data.search) {
      const s = `%${data.search.replace(/[%_]/g, (m) => `\\${m}`)}%`;
      q = q.or(`email.ilike.${s},source_url.ilike.${s},top_opportunity.ilike.${s}`);
    }
    if (data.isDemo === "demo") q = q.eq("is_demo", true);
    if (data.isDemo === "real") q = q.eq("is_demo", false);
    const start = rangeStart(data.range);
    if (start) q = q.gte("created_at", start);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getWaitlistStats = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: rows, error } = await supabaseAdmin
      .from("implementation_brief_waitlist")
      .select("email,is_demo,top_opportunity,created_at")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) throw new Error(error.message);

    const all = rows ?? [];
    const now = Date.now();
    const within = (days: number) =>
      all.filter((r) => now - new Date(r.created_at).getTime() <= days * 86400000).length;

    const uniqueEmails = new Set(all.map((r) => r.email.toLowerCase())).size;
    const demoCount = all.filter((r) => r.is_demo).length;
    const realCount = all.length - demoCount;

    const oppCounts = new Map<string, number>();
    for (const r of all) {
      const k = (r.top_opportunity ?? "(unspecified)").trim() || "(unspecified)";
      oppCounts.set(k, (oppCounts.get(k) ?? 0) + 1);
    }
    const topOpportunities = [...oppCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return {
      total: all.length,
      uniqueEmails,
      duplicates: all.length - uniqueEmails,
      last7d: within(7),
      last30d: within(30),
      demoCount,
      realCount,
      topOpportunities,
    };
  });
