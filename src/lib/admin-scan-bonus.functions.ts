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
  search: z.string().trim().max(200).optional().default(""),
  range: z.enum(["all", "7d", "30d", "90d"]).optional().default("all"),
});

function rangeStart(range: "all" | "7d" | "30d" | "90d"): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const listScanBonusEmails = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((input) => filtersSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    let q = supabaseAdmin
      .from("scan_bonus_emails")
      .select("id,email,source_url,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data.search) {
      const s = `%${data.search.replace(/[%_]/g, (m) => `\\${m}`)}%`;
      q = q.or(`email.ilike.${s},source_url.ilike.${s}`);
    }
    const start = rangeStart(data.range);
    if (start) q = q.gte("created_at", start);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getScanBonusStats = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: rows, error } = await supabaseAdmin
      .from("scan_bonus_emails")
      .select("email,created_at")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) throw new Error(error.message);

    const all = rows ?? [];
    const now = Date.now();
    const within = (days: number) =>
      all.filter((r) => now - new Date(r.created_at).getTime() <= days * 86400000).length;
    const uniqueEmails = new Set(all.map((r) => r.email.toLowerCase())).size;

    return {
      total: all.length,
      uniqueEmails,
      duplicates: all.length - uniqueEmails,
      last7d: within(7),
      last30d: within(30),
    };
  });
