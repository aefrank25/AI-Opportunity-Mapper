import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  checkIsAdmin,
  getWaitlistStats,
  listWaitlistEntries,
} from "@/lib/admin-waitlist.functions";
import {
  getScanBonusStats,
  listScanBonusEmails,
} from "@/lib/admin-scan-bonus.functions";
import { getScanEventStats } from "@/lib/admin-scan-stats.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, LogOut, RefreshCcw } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Waitlist" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type AuthState = "loading" | "no-session" | "not-admin" | "ok";

function AdminPage() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [email, setEmail] = useState<string | null>(null);

  const checkAdminFn = useServerFn(checkIsAdmin);
  const statsFn = useServerFn(getWaitlistStats);
  const listFn = useServerFn(listWaitlistEntries);

  // Filters
  const [search, setSearch] = useState("");
  const [isDemo, setIsDemo] = useState<"all" | "demo" | "real">("all");
  const [range, setRange] = useState<"all" | "7d" | "30d" | "90d">("all");

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        navigate({ to: "/login" });
      }
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) setAuthState("no-session");
        navigate({ to: "/login" });
        return;
      }
      setEmail(session.user.email ?? null);
      try {
        const res = await checkAdminFn();
        if (!mounted) return;
        setAuthState(res.isAdmin ? "ok" : "not-admin");
      } catch {
        if (mounted) setAuthState("not-admin");
      }
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, checkAdminFn]);

  const stats = useQuery({
    queryKey: ["admin-waitlist-stats"],
    queryFn: () => statsFn(),
    enabled: authState === "ok",
  });

  const entries = useQuery({
    queryKey: ["admin-waitlist", search, isDemo, range],
    queryFn: () => listFn({ data: { search, isDemo, range } }),
    enabled: authState === "ok",
  });

  const rows = entries.data?.rows ?? [];

  const handleExport = () => {
    const headers = ["created_at", "email", "is_demo", "source_url", "top_opportunity"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.created_at, r.email, r.is_demo, r.source_url ?? "", r.top_opportunity ?? ""]
          .map(csvEscape)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (authState === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authState === "not-admin") {
    return (
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-md py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({email}) does not have admin access.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Button onClick={handleSignOut} variant="outline">Sign out</Button>
            <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              ← Back to site
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-8 space-y-6 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Admin
            </div>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Implementation Brief — Waitlist
            </h1>
            {email && <p className="mt-1 text-xs text-muted-foreground">Signed in as {email}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/feedback">View feedback →</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => { stats.refetch(); entries.refetch(); }}>
              <RefreshCcw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsBlock stats={stats.data} loading={stats.isLoading} />

        {/* Filters + Export */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_180px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="email, URL, or opportunity"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={isDemo} onValueChange={(v) => setIsDemo(v as typeof isDemo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="real">Real URLs</SelectItem>
                  <SelectItem value="demo">Demo only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time range</Label>
              <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} disabled={!rows.length} className="sm:h-10">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-medium text-foreground">
              {entries.isLoading ? "Loading…" : `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Source URL</th>
                  <th className="px-4 py-2.5">Top opportunity</th>
                  <th className="px-4 py-2.5">Demo</th>
                </tr>
              </thead>
              <tbody>
                {entries.isLoading && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {!entries.isLoading && rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No entries match these filters.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[260px] truncate" title={r.source_url ?? ""}>
                      {r.source_url || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.top_opportunity || "—"}</td>
                    <td className="px-4 py-2.5">
                      {r.is_demo ? (
                        <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">Demo</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Real</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scan counts */}
        <ScanEventStats enabled={authState === "ok"} />

        {/* Scan bonus emails */}
        <ScanBonusSection enabled={authState === "ok"} />
      </div>
    </section>
  );
}

function ScanEventStats({ enabled }: { enabled: boolean }) {
  const statsFn = useServerFn(getScanEventStats);
  const stats = useQuery({
    queryKey: ["admin-scan-event-stats"],
    queryFn: () => statsFn(),
    enabled,
  });

  const LABELS: Record<string, string> = {
    live_scan_started: "Live scans started",
    live_scan_completed: "Live scans completed",
    live_scan_failed: "Live scans failed",
    prototype_scan_started: "Prototype runs",
  };
  const KEYS = Object.keys(LABELS);

  const cell = (n: number | undefined) => (stats.isLoading ? "…" : (n ?? 0));

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Usage
          </div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Scan counts
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            How many people kicked off a scan. Only counts visitors who accepted analytics cookies.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => stats.refetch()}>
          <RefreshCcw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Event</th>
                <th className="px-4 py-2.5 text-right">Last 24h</th>
                <th className="px-4 py-2.5 text-right">Last 7d</th>
                <th className="px-4 py-2.5 text-right">Last 30d</th>
                <th className="px-4 py-2.5 text-right">All-time</th>
              </tr>
            </thead>
            <tbody>
              {KEYS.map((k) => (
                <tr key={k} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-foreground">{LABELS[k]}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{cell(stats.data?.last24h[k])}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{cell(stats.data?.last7d[k])}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{cell(stats.data?.last30d[k])}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">{cell(stats.data?.total[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScanBonusSection({ enabled }: { enabled: boolean }) {
  const statsFn = useServerFn(getScanBonusStats);
  const listFn = useServerFn(listScanBonusEmails);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<"all" | "7d" | "30d" | "90d">("all");

  const stats = useQuery({
    queryKey: ["admin-scan-bonus-stats"],
    queryFn: () => statsFn(),
    enabled,
  });
  const entries = useQuery({
    queryKey: ["admin-scan-bonus", search, range],
    queryFn: () => listFn({ data: { search, range } }),
    enabled,
  });
  const rows = entries.data?.rows ?? [];

  const handleExport = () => {
    const headers = ["created_at", "email", "source_url"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.created_at, r.email, r.source_url ?? ""].map(csvEscape).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-bonus-emails-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles = [
    { label: "Total captures", value: stats.data?.total ?? 0 },
    { label: "Unique emails", value: stats.data?.uniqueEmails ?? 0 },
    { label: "Duplicate attempts", value: stats.data?.duplicates ?? 0 },
    { label: "Last 7 days", value: stats.data?.last7d ?? 0 },
    { label: "Last 30 days", value: stats.data?.last30d ?? 0 },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Free scan limit
          </div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Scan-bonus emails
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Emails captured when visitors hit the daily Live Scan limit and unlocked 2 more scans. Not on the waitlist.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { stats.refetch(); entries.refetch(); }}
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.label}
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {stats.isLoading ? "…" : t.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="sb-search">Search</Label>
            <Input
              id="sb-search"
              placeholder="email or URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Time range</Label>
            <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} disabled={!rows.length} className="sm:h-10">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium text-foreground">
            {entries.isLoading ? "Loading…" : `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Source URL</th>
              </tr>
            </thead>
            <tbody>
              {entries.isLoading && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!entries.isLoading && rows.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No scan-bonus emails captured yet.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-[260px] truncate" title={r.source_url ?? ""}>
                    {r.source_url || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function StatsBlock({
  stats,
  loading,
}: {
  stats: Awaited<ReturnType<typeof getWaitlistStats>> | undefined;
  loading: boolean;
}) {
  const tiles = useMemo(
    () => [
      { label: "Total signups", value: stats?.total ?? 0 },
      { label: "Unique emails", value: stats?.uniqueEmails ?? 0 },
      { label: "Duplicate attempts", value: stats?.duplicates ?? 0 },
      { label: "Last 7 days", value: stats?.last7d ?? 0 },
      { label: "Last 30 days", value: stats?.last30d ?? 0 },
      { label: "Real / Demo", value: `${stats?.realCount ?? 0} / ${stats?.demoCount ?? 0}` },
    ],
    [stats],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.label}
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {loading ? "…" : t.value}
            </div>
          </div>
        ))}
      </div>

      <GrowthChart data={stats?.dailySignups ?? []} loading={loading} />

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Top opportunities requested
        </div>
        {loading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : !stats?.topOpportunities.length ? (
          <p className="mt-2 text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.topOpportunities.map((o) => {
              const max = stats.topOpportunities[0].count;
              const pct = Math.max(4, Math.round((o.count / max) * 100));
              return (
                <li key={o.name} className="flex items-center gap-3">
                  <div className="w-48 truncate text-sm text-foreground" title={o.name}>{o.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground tabular-nums">{o.count}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function GrowthChart({
  data,
  loading,
}: {
  data: { date: string; count: number; cumulative: number }[];
  loading: boolean;
}) {
  const formatted = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })),
    [data],
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Signups — last 30 days
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Per day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-foreground/60" /> Cumulative
          </span>
        </div>
      </div>
      <div className="mt-4 h-64 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : !formatted.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatted} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
                minTickGap={24}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Per day"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#gSignups)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="var(--foreground)"
                strokeOpacity={0.6}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
