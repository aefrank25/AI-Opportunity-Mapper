import { ScoreChip } from "./score-chip";
import type { Opportunity } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function OpportunityCard({ opportunity, index }: { opportunity: Opportunity; index: number }) {
  const o = opportunity;
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Opportunity {index + 1}
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{o.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Signal" value={o.signal} />
        <Row label="Pain point" value={o.painPoint} />
        <Row label="Improvement" value={o.improvement} />
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <ScoreChip label="Impact" level={o.impact} />
        <ScoreChip label="Effort" level={o.effort} />
        <ScoreChip label="Confidence" level={o.confidence} />
        <ScoreChip label="Automation Risk" level={o.automationRisk} inverted />
      </div>

      <dl className="mt-3 space-y-1 text-[11px] leading-snug text-muted-foreground">
        <div>
          <dt className="inline font-semibold text-foreground">Confidence:</dt>{" "}
          <dd className="inline">how sure we are this opportunity fits the business.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-foreground">Automation Risk:</dt>{" "}
          <dd className="inline">how risky to fully automate without human review — lower is better.</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl bg-surface-muted p-3">
        <div className="flex items-start gap-2 text-sm">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              First step
            </div>
            <div className="text-foreground">{o.firstStep}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
