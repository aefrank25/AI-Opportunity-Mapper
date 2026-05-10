import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AnalysisChecklist } from "@/components/analysis-checklist";
import { Button } from "@/components/ui/button";
import { displayHost } from "@/lib/url";
import { DEMO_META, type DemoId } from "@/lib/demos";
import { liveScan } from "@/lib/live-scan.functions";
import { Loader2, AlertCircle } from "lucide-react";

interface AnalyzingSearch {
  url?: string;
  priority?: string;
  demo?: DemoId;
  live?: 1;
}

const searchSchema = z
  .object({
    url: z.string().optional(),
    priority: z.string().optional(),
    demo: z.enum(["clinic", "agency", "boutique"]).optional(),
    live: z.literal(1).optional(),
  })
  .refine((v) => v.url || v.demo, { message: "url or demo required" }) as unknown as z.ZodType<AnalyzingSearch>;

export const Route = createFileRoute("/analyzing")({
  head: () => ({
    meta: [
      { title: "Analyzing — AI Opportunity Mapper" },
      { name: "description", content: "Interpreting business context and mapping AI opportunities." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: Analyzing,
});

function liveCacheKey(url: string, priority: string) {
  return `aiom:live:${url}:${priority}`;
}

function Analyzing() {
  const search = Route.useSearch() as AnalyzingSearch;
  const navigate = useNavigate();
  const isLive = !!search.live && !!search.url;

  if (isLive) {
    return <LiveAnalyzing url={search.url!} priority={search.priority ?? "not_sure"} />;
  }

  const subject = search.demo
    ? `${DEMO_META[search.demo].label} — ${DEMO_META[search.demo].url}`
    : displayHost(search.url ?? "");

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-2xl pt-16 pb-20 sm:pt-24">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card-lg sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Generating opportunity map for
          </div>
          <div className="mt-1 truncate text-lg font-semibold text-foreground">{subject}</div>

          <div className="mt-6">
            <AnalysisChecklist
              onDone={() =>
                navigate({
                  to: "/results",
                  search: search.demo
                    ? { demo: search.demo }
                    : { url: search.url!, priority: (search.priority ?? "not_sure") as never },
                })
              }
            />
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Prototype mode: results are generated from the URL, selected priority, and business-type
            patterns.
          </p>
        </div>
      </div>
    </section>
  );
}

const LIVE_STEPS = [
  "Mapping site pages",
  "Reading homepage, services & FAQ",
  "Extracting operational signals",
  "Generating opportunity map",
];

function LiveAnalyzing({ url, priority }: { url: string; priority: string }) {
  const navigate = useNavigate();
  const callLiveScan = useServerFn(liveScan);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Visual cadence — increment step every ~1.4s up to second-to-last while request runs.
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, LIVE_STEPS.length - 1));
    }, 1400);

    (async () => {
      try {
        const res = await callLiveScan({
          data: { url, priority: priority as never },
        });
        clearInterval(interval);
        if (!res.ok) {
          setError(
            "We couldn't complete a live scan for this site. You can try another URL or run a prototype recommendation based on business-type patterns.",
          );
          return;
        }
        setStep(LIVE_STEPS.length);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(liveCacheKey(url, priority), JSON.stringify(res.result));
        }
        setTimeout(() => {
          navigate({
            to: "/results",
            search: { url, priority: priority as never, live: 1 },
          });
        }, 250);
      } catch (e) {
        clearInterval(interval);
        console.error(e);
        setError(
          "We couldn't complete a live scan for this site. You can try another URL or run a prototype recommendation based on business-type patterns.",
        );
      }
    })();

    return () => clearInterval(interval);
  }, [callLiveScan, navigate, url, priority]);

  const subject = displayHost(url);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-2xl pt-16 pb-20 sm:pt-24">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card-lg sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Live scan (beta) for
              </div>
              <div className="mt-1 truncate text-lg font-semibold text-foreground">{subject}</div>
            </div>
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Live scan beta
            </span>
          </div>

          {error ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    navigate({
                      to: "/analyzing",
                      search: { url, priority: priority as never },
                    })
                  }
                >
                  Run prototype instead
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                  Try another URL
                </Button>
              </div>
            </div>
          ) : (
            <ol className="mt-6 space-y-3">
              {LIVE_STEPS.map((label, i) => {
                const state = i < step ? "done" : i === step ? "active" : "pending";
                return (
                  <li
                    key={label}
                    className={
                      "flex items-start gap-3 rounded-xl border p-3.5 transition-colors " +
                      (state === "done"
                        ? "border-border bg-surface"
                        : state === "active"
                          ? "border-primary/30 bg-accent"
                          : "border-border bg-card")
                    }
                  >
                    <span
                      className={
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                        (state === "done"
                          ? "bg-primary text-primary-foreground"
                          : state === "active"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground")
                      }
                    >
                      {state === "active" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span
                      className={
                        "text-sm " +
                        (state === "pending"
                          ? "text-muted-foreground"
                          : state === "active"
                            ? "font-medium text-foreground"
                            : "text-foreground")
                      }
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {!error && (
            <p className="mt-6 text-xs text-muted-foreground">
              Live scan reads a small number of public pages (homepage, about, services, FAQ,
              contact) and grounds recommendations in what was actually found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
