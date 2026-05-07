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
}

const searchSchema = z
  .object({
    url: z.string().optional(),
    priority: z.enum(PRIORITY_VALUES as [Priority, ...Priority[]]).optional(),
    demo: z.enum(["clinic", "agency", "boutique"]).optional(),
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

function Results() {
  const search = Route.useSearch() as ResultsSearch;

  const result: AnalysisResult = search.demo
    ? DEMOS[search.demo]
    : analyze(search.url!, search.priority ?? "not_sure");

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
              {result.isDemo && (
                <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  Demo result
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Priority: {PRIORITY_LABELS[result.priority]}
              </span>
            </div>
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

        <TopOpportunityCard opportunity={result.topOpportunity} />

        <OpportunityHeatmap opportunities={result.opportunities} />

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">All opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three opportunities ranked by impact, effort, confidence, and automation risk.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.opportunities.map((o, i) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                index={i}
                contextSignals={result.snapshot.signals}
                priorityLabel={PRIORITY_LABELS[result.priority]}
              />
            ))}
          </div>
        </div>

        <QuickWins wins={result.quickWins} />

        <Roadmap roadmapKey={result.roadmapKey} />

        <NextStepCta
          isDemo={result.isDemo}
          sourceUrl={result.displayUrl}
          topOpportunity={result.topOpportunity?.name}
        />

        <FeedbackWidget
          isDemo={result.isDemo}
          sourceUrl={result.displayUrl}
          topOpportunity={result.topOpportunity?.name}
        />
      </div>
    </section>
  );
}
