import type { Opportunity } from "@/lib/types";
import { Sparkles, ArrowRight } from "lucide-react";

export function TopOpportunityCard({
  opportunity,
  priorityLabel,
}: {
  opportunity: Opportunity;
  priorityLabel?: string;
}) {
  const o = opportunity;
  const badgeLabel = priorityLabel ? "Top recommendation for your goal" : "Top inferred opportunity";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card-lg">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
      <div className="p-4 pl-5 sm:p-8 sm:pl-9">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            {badgeLabel}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {o.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{o.description}</p>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Treat this as a starting hypothesis to validate against the business's actual workflow, tools, staffing, and customer context.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
          <Block label="Why this matters" value={o.whyItMatters} />
          <Block label="Public signal" value={o.signal} />
          <Block label="Likely pain point" value={o.painPoint} />
          <Block label="Suggested improvement" value={o.improvement} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-surface p-3 sm:mt-6 sm:p-4">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended first step
            </div>
            <div className="text-sm text-foreground">{o.firstStep}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
