import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";
import { urlSchema } from "@/lib/url";
import { DEMO_META, type DemoId } from "@/lib/demos";
import {
  checkLiveScanGate,
  unlockEmailBonus,
  liveScansRemaining,
  type LiveScanUsage,
} from "@/lib/live-scan-usage";
import { claimScanBonusEmail } from "@/lib/scan-bonus.functions";
import { Sparkles, Info, ArrowRight } from "lucide-react";

const PRIORITY_ORDER: Priority[] = [
  "save_time",
  "more_leads",
  "follow_up",
  "reduce_admin",
  "customer_experience",
  "reporting",
  "not_sure",
];

const LIVE_SCAN_KEY = "aiom:live-scan";

type GateState =
  | { kind: "ok" }
  | { kind: "needs_email"; usage: LiveScanUsage }
  | { kind: "limit_reached"; usage: LiveScanUsage };

export function UrlInputCard() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [error, setError] = useState<string | null>(null);
  const [liveScan, setLiveScan] = useState<boolean>(true);
  const [gate, setGate] = useState<GateState>({ kind: "ok" });
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LIVE_SCAN_KEY) : null;
    if (stored === "0") setLiveScan(false);
    setRemaining(liveScansRemaining());

    const refresh = () => setRemaining(liveScansRemaining());
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "aiom:live-scan-usage") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);


  function toggleLive(v: boolean) {
    setLiveScan(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(LIVE_SCAN_KEY, v ? "1" : "0");
    }
  }

  function startLive(validUrl: string, p: Priority) {
    navigate({ to: "/analyzing", search: { url: validUrl, priority: p, live: 1 } });
  }

  function startPrototype(validUrl: string, p: Priority) {
    navigate({ to: "/analyzing", search: { url: validUrl, priority: p } });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid URL.");
      return;
    }
    setError(null);

    if (!liveScan) {
      startPrototype(result.data, priority || "not_sure");
      return;
    }

    const g = checkLiveScanGate();
    if (g.allowed) {
      startLive(result.data, priority || "not_sure");
    } else if (g.reason === "needs_email") {
      setGate({ kind: "needs_email", usage: g.usage });
    } else {
      setGate({ kind: "limit_reached", usage: g.usage });
    }
  }

  function handleEmailUnlock(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    unlockEmailBonus(trimmed);
    // Fire-and-forget: persist email + sync to Resend. UI stays snappy either way.
    const parsedUrl = urlSchema.safeParse(url);
    claimScanBonusEmail({
      data: {
        email: trimmed,
        sourceUrl: parsedUrl.success ? parsedUrl.data : null,
      },
    }).catch((err) => {
      console.error("[scan-bonus] claim failed:", err);
    });
    toast("You're on the beta list. 2 more Live Scans are available today.");
    setGate({ kind: "ok" });
    setRemaining(liveScansRemaining());

    if (parsedUrl.success) startLive(parsedUrl.data, priority || "not_sure");
  }

  function handleFullReport() {
    // No checkout implemented yet — surface placeholder, same pattern as expanded map CTA.
    toast("Full Report checkout is planned for the next version.");
  }

  function runDemo(id: DemoId) {
    navigate({ to: "/analyzing", search: { demo: id } });
  }

  function runPrototypeFromGate() {
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid URL.");
      setGate({ kind: "ok" });
      return;
    }
    setGate({ kind: "ok" });
    startPrototype(parsed.data, priority || "not_sure");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card-lg sm:p-8">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-sm font-medium text-foreground">
              Business website
            </Label>
            <Input
              id="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority" className="text-sm font-medium text-foreground">
              Main priority{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger id="priority" className="h-11 w-full">
                <SelectValue placeholder="Choose a priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
          <Switch
            id="live-scan"
            checked={liveScan}
            onCheckedChange={toggleLive}
            className="mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor="live-scan" className="text-sm font-medium text-foreground cursor-pointer">
              Live Scan{" "}
              <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Beta
              </span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Reads a small number of public pages to ground recommendations in actual website content. Does not access private data, accounts, analytics, or internal systems.
            </p>
            {liveScan && (
              <div className="mt-2 border-t border-border/60 pt-2 space-y-1">
                <p className="text-[11px] leading-relaxed text-muted-foreground/90">
                  Free beta: 1 Live Scan per day. Enter your email after your first scan to get 2 more. Demo scans are unlimited.
                </p>
                {remaining !== null && (
                  <p className="text-[11px] font-medium text-foreground">
                    {remaining} {remaining === 1 ? "scan" : "scans"} left today.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        <Button type="submit" size="lg" className="h-11 w-full">
          <Sparkles className="h-4 w-4" />
          {liveScan ? "Run Live Scan" : "Map opportunities"}
        </Button>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {liveScan ? (
            <span>
              If the site can't be reached, AI Opportunity Mapper falls back to prototype mode.
              <br />
              Recommendations should be validated before implementation.
            </span>


          ) : (
            "Prototype mode uses business-type patterns and inferred workflow signals. Recommendations should be validated before implementation."
          )}
        </p>
      </form>

      {gate.kind === "needs_email" && (
        <div className="mt-5 rounded-xl border border-primary/30 bg-accent p-4 sm:p-5">
          <div className="text-sm font-semibold text-foreground">
            You've used today's free Live Scan
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to get 2 more beta scans today, or run a prototype recommendation instead.
          </p>
          <form onSubmit={handleEmailUnlock} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              required
            />
            <Button type="submit" className="h-10 sm:w-auto">
              Get 2 more scans
            </Button>
          </form>
          {emailError && (
            <p className="mt-2 text-xs text-destructive">{emailError}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={runPrototypeFromGate}>
              Run prototype instead
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runDemo("clinic")}
            >
              Try a demo
            </Button>
          </div>
        </div>
      )}

      {gate.kind === "limit_reached" && (
        <div className="mt-5 rounded-xl border border-primary/30 bg-accent p-4 sm:p-5">
          <div className="text-sm font-semibold text-foreground">
            You've used all 3 free Live Scans available today
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            You can run a prototype recommendation, try a demo, or get the full report for one of your scanned websites.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Full Report: get the expanded opportunity map with deeper prioritization, supporting signals, suggested sequencing, expanded next steps, and exportable report access. One-time upgrade per website.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handleFullReport}>Get Full Report</Button>
            <Button variant="outline" onClick={runPrototypeFromGate}>
              Run prototype instead
            </Button>
            <Button variant="ghost" onClick={() => runDemo("clinic")}>
              Try a demo
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <div className="text-sm font-medium text-foreground">
          Want to see how it works? Try a sample business:
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(Object.keys(DEMO_META) as DemoId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => runDemo(id)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{DEMO_META[id].label}</div>
                <div className="text-xs text-muted-foreground">
                  {DEMO_META[id].tagline}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
