import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { analyze } from "@/lib/analyzer";
import { DEMOS, type DemoId } from "@/lib/demos";
import { PRIORITY_LABELS, type Priority, type AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SnapshotCard } from "@/components/snapshot-card";
import { TopOpportunityCard } from "@/components/top-opportunity-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { QuickWins } from "@/components/quick-wins";
import { Roadmap } from "@/components/roadmap";
import { OpportunityHeatmap } from "@/components/opportunity-heatmap";
import { NextStepCta } from "@/components/next-step-cta";
import { UnlockSection } from "@/components/unlock-section";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Globe, RotateCcw } from "lucide-react";

const PRIORITY_VALUES: Priority[] = [
  "save_time",
  "more_leads",
  "follow_up",
  "reduce_admin",
  "customer_experience",
  "reporting",
  "not_sure",
];

interface ResultsSearch {
  url?: string;
  priority?: Priority;
  demo?: DemoId;
  live?: 1;
}

const searchSchema = z
  .object({
    url: z.string().optional(),
    priority: z.enum(PRIORITY_VALUES as [Priority, ...Priority[]]).optional(),
    demo: z.enum(["clinic", "agency", "boutique"]).optional(),
    live: z.literal(1).optional(),
  })
  .refine((v) => v.url || v.demo, { message: "url or demo required" }) as unknown as z.ZodType<ResultsSearch>;

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Opportunity map — AI Opportunity Mapper" },
      {
        name: "description",
        content: "Your prioritized AI opportunity map: top recommendation, quick wins, and a 30-day roadmap.",
      },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: Results,
});

function liveCacheKey(url: string, priority: string) {
  return `aiom:live:${url}:${priority}`;
}

function Results() {
  const search = Route.useSearch() as ResultsSearch;

  // Hydrate live result from sessionStorage on the client.
  const [liveResult, setLiveResult] = useState<AnalysisResult | null>(null);
  const wantLive = !!search.live && !!search.url;

  useEffect(() => {
    if (!wantLive) return;
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(
      liveCacheKey(search.url!, search.priority ?? "not_sure"),
    );
    if (raw) {
      try {
        setLiveResult(JSON.parse(raw) as AnalysisResult);
      } catch {
        setLiveResult(null);
      }
    }
  }, [wantLive, search.url, search.priority]);

  const result: AnalysisResult = search.demo
    ? { ...DEMOS[search.demo], mode: "demo" }
    : wantLive && liveResult
      ? liveResult
      : { ...analyze(search.url!, search.priority ?? "not_sure"), mode: "prototype" };

  const mode = result.mode ?? (result.isDemo ? "demo" : "prototype");
  const modeBadge =
    mode === "demo" ? "Demo result" : mode === "live" ? "Live scan beta" : "Prototype result";

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-5 space-y-5 sm:py-12 sm:space-y-8">
        {/* Header strip */}
        <div className="flex items-start gap-3 sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="hidden text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:block">
              Opportunity map
            </div>
            <div className="mt-0 flex items-center gap-1.5 sm:mt-1 sm:gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-base font-semibold text-foreground sm:text-lg">
                {result.displayUrl}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                  (mode === "demo"
                    ? "bg-accent text-accent-foreground"
                    : mode === "live"
                      ? "bg-primary/10 text-primary"
                      : "border border-border bg-surface text-muted-foreground")
                }
              >
                {modeBadge}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {result.priority === "not_sure"
                  ? "Exploratory scan"
                  : `Priority: ${PRIORITY_LABELS[result.priority]}`}
              </span>
            </div>
            {mode === "live" && result.scannedPages && result.scannedPages.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Pages scanned: {result.pageCount ?? result.scannedPages.length}
              </p>
            )}
            {wantLive && !liveResult && (
              <p className="mt-2 text-xs text-muted-foreground">
                Live scan result not found — showing prototype recommendation instead.
              </p>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to="/" aria-label="Start over">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Start over</span>
            </Link>
          </Button>
        </div>

        {result.safetyNote && (
          <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm text-foreground sm:p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Safety note
            </div>
            <p className="mt-1">{result.safetyNote}</p>
          </div>
        )}

        <SnapshotCard snapshot={result.snapshot} />

        <TopOpportunityCard
          opportunity={result.topOpportunity}
          priorityLabel={result.priority === "not_sure" ? undefined : PRIORITY_LABELS[result.priority]}
        />

        <OpportunityHeatmap opportunities={result.opportunities} />

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {result.priority === "not_sure" ? "Top inferred operational opportunities" : "Prioritized opportunities"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.priority === "not_sure"
              ? "Balanced across impact, effort, and implementation readiness — the most likely areas for operational leverage."
              : `Gently weighted toward your selected goal: ${PRIORITY_LABELS[result.priority]}. Ranked by inferred impact, effort, and implementation readiness.`}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.opportunities.map((o, i) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                index={i}
                contextSignals={result.snapshot.signals}
                priorityLabel={result.priority === "not_sure" ? undefined : PRIORITY_LABELS[result.priority]}
                priority={result.priority}
                locked={i > 0}
              />
            ))}
          </div>
        </div>

        <QuickWins
          wins={result.quickWins}
          priorityLabel={result.priority === "not_sure" ? undefined : PRIORITY_LABELS[result.priority]}
        />

        <Roadmap roadmapKey={result.roadmapKey} />

        <UnlockSection
          isDemo={result.isDemo}
          sourceUrl={result.displayUrl}
          topOpportunity={result.topOpportunity?.name}
        />

        <NextStepCta isDemo={result.isDemo} />

        <FeedbackWidget
          isDemo={result.isDemo}
          sourceUrl={result.displayUrl}
          topOpportunity={result.topOpportunity?.name}
        />
      </div>
    </section>
  );
}
