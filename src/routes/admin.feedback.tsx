import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin-waitlist.functions";
import {
  getFeedbackStats,
  listRecommendationFeedback,
} from "@/lib/admin-feedback.functions";
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
import { Loader2, Download, LogOut, RefreshCcw, Star, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({
    meta: [
      { title: "Admin — Feedback" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFeedbackPage,
});

type AuthState = "loading" | "no-session" | "not-admin" | "ok";

function AdminFeedbackPage() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [email, setEmail] = useState<string | null>(null);

  const checkAdminFn = useServerFn(checkIsAdmin);
  const statsFn = useServerFn(getFeedbackStats);
  const listFn = useServerFn(listRecommendationFeedback);

  const [sourceUrl, setSourceUrl] = useState("");
  const [rating, setRating] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
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
    queryKey: ["admin-feedback-stats"],
    queryFn: () => statsFn(),
    enabled: authState === "ok",
  });

  const entries = useQuery({
    queryKey: ["admin-feedback", sourceUrl, rating],
    queryFn: () => listFn({ data: { sourceUrl, rating } }),
    enabled: authState === "ok",
  });

  const rows = entries.data?.rows ?? [];

  const handleExport = () => {
    const headers = ["created_at", "rating", "source_url", "top_opportunity", "is_demo", "notes"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.created_at, r.rating, r.source_url ?? "", r.top_opportunity ?? "", r.is_demo, r.notes ?? ""]
          .map(csvEscape)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
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

  const s = stats.data;

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-8 space-y-6 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Waitlist admin
            </Link>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Admin
            </div>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Recommendation Feedback
            </h1>
            {email && <p className="mt-1 text-xs text-muted-foreground">Signed in as {email}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { stats.refetch(); entries.refetch(); }}>
              <RefreshCcw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatTile label="Total submissions" value={stats.isLoading ? "…" : s?.total ?? 0} />
          <StatTile label="Average rating" value={stats.isLoading ? "…" : (s?.avg ?? 0).toString()} />
          <StatTile label="With notes" value={stats.isLoading ? "…" : s?.withNotes ?? 0} />
          <StatTile
            label="Most common"
            value={
              stats.isLoading || !s
                ? "…"
                : (() => {
                    const top = [...s.distribution].sort((a, b) => b.count - a.count)[0];
                    return top && top.count > 0 ? `${top.rating}★` : "—";
                  })()
            }
          />
        </div>

        {/* Distribution */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Rating distribution
          </div>
          {stats.isLoading || !s ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...s.distribution].reverse().map((d) => {
                const max = Math.max(1, ...s.distribution.map((x) => x.count));
                const pct = Math.round((d.count / max) * 100);
                return (
                  <li key={d.rating} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-foreground tabular-nums">{d.rating}★</div>
                    <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-10 text-right text-sm text-muted-foreground tabular-nums">{d.count}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="source-url">Source URL</Label>
              <Input
                id="source-url"
                placeholder="filter by URL"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <Select value={rating} onValueChange={(v) => setRating(v as typeof rating)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
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
                  <th className="px-4 py-2.5">Rating</th>
                  <th className="px-4 py-2.5">Source URL</th>
                  <th className="px-4 py-2.5">Top opportunity</th>
                  <th className="px-4 py-2.5">Notes</th>
                  <th className="px-4 py-2.5">Demo</th>
                </tr>
              </thead>
              <tbody>
                {entries.isLoading && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {!entries.isLoading && rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No feedback matches these filters.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <Stars n={r.rating} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[220px] truncate" title={r.source_url ?? ""}>
                      {r.source_url || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.top_opportunity || "—"}</td>
                    <td className="px-4 py-2.5 text-foreground max-w-[360px]">
                      {r.notes ? <p className="whitespace-pre-wrap">{r.notes}</p> : <span className="text-muted-foreground">—</span>}
                    </td>
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
      </div>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= n ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{n}</span>
    </div>
  );
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
