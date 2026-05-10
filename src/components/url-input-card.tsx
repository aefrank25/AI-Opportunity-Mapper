import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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

export function UrlInputCard() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState<Priority>("not_sure");
  const [error, setError] = useState<string | null>(null);
  const [liveScan, setLiveScan] = useState<boolean>(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LIVE_SCAN_KEY) : null;
    if (stored === "0") setLiveScan(false);
  }, []);

  function toggleLive(v: boolean) {
    setLiveScan(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(LIVE_SCAN_KEY, v ? "1" : "0");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid URL.");
      return;
    }
    setError(null);
    navigate({
      to: "/analyzing",
      search: liveScan
        ? { url: result.data, priority, live: 1 }
        : { url: result.data, priority },
    });
  }

  function runDemo(id: DemoId) {
    navigate({ to: "/analyzing", search: { demo: id } });
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
                <SelectValue />
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

        <Button type="submit" size="lg" className="h-11 w-full">
          <Sparkles className="h-4 w-4" />
          Map opportunities
        </Button>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          This prototype uses publicly visible website patterns, business context, and inferred
          workflow signals to suggest operational and AI opportunities for exploration.
          Recommendations should be validated before implementation.
        </p>
      </form>

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
