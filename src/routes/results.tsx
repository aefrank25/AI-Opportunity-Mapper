import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { analyze } from "@/lib/analyzer";
import { DEMOS } from "@/lib/demos";
import { PRIORITY_LABELS, type Priority, type AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SnapshotCard } from "@/components/snapshot-card";
import { TopOpportunityCard } from "@/components/top-opportunity-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { QuickWins } from "@/components/quick-wins";
import { Roadmap } from "@/components/roadmap";
import { NextStepCta } from "@/components/next-step-cta";
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

const searchSchema = z
  .object({
    url: z.string().optional(),
    priority: z.enum(PRIORITY_VALUES as [Priority, ...Priority[]]).optional(),
    demo: z.enum(["clinic", "agency", "boutique"]).optional(),
  })
  .refine((v) => v.url || v.demo, { message: "url or demo required" });

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
  const search = Route.useSearch();

  const result: AnalysisResult = search.demo
    ? DEMOS[search.demo]
    : analyze(search.url!, search.priority ?? "not_sure");

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-8 sm:py-12 space-y-8">
        {/* Header strip */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Opportunity map
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold text-foreground truncate">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {result.displayUrl}
              </span>
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
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </Link>
          </Button>
        </div>

        <SnapshotCard snapshot={result.snapshot} />

        <TopOpportunityCard opportunity={result.topOpportunity} />

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">All opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three opportunities ranked by impact, effort, confidence, and automation risk.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.opportunities.map((o, i) => (
              <OpportunityCard key={o.id} opportunity={o} index={i} />
            ))}
          </div>
        </div>

        <QuickWins wins={result.quickWins} />

        <Roadmap />

        <NextStepCta isDemo={result.isDemo} />
      </div>
    </section>
  );
}
