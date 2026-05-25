import { createServerFn } from "@tanstack/react-start";
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

const SCAN_EVENT_NAMES = [
  "live_scan_started",
  "live_scan_completed",
  "live_scan_failed",
  "prototype_scan_started",
] as const;

export const getScanEventStats = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data, error } = await supabaseAdmin
      .from("analytics_events")
      .select("name,created_at")
      .in("name", SCAN_EVENT_NAMES as unknown as string[])
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const now = Date.now();
    const within = (days: number) =>
      rows.filter((r) => now - new Date(r.created_at).getTime() <= days * 86400000);

    const countBy = (list: typeof rows) => {
      const out: Record<string, number> = {};
      for (const n of SCAN_EVENT_NAMES) out[n] = 0;
      for (const r of list) {
        out[r.name] = (out[r.name] ?? 0) + 1;
      }
      return out;
    };

    return {
      total: countBy(rows),
      last7d: countBy(within(7)),
      last30d: countBy(within(30)),
      last24h: countBy(within(1)),
    };
  });
