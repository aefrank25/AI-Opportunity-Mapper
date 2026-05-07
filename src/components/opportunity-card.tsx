import { useEffect, useRef, useState } from "react";
import { ScoreChip } from "./score-chip";
import type { Opportunity } from "@/lib/types";
import { ArrowRight, ChevronDown, Lock, Radar } from "lucide-react";

const LOCKED_SECTIONS = [
  "Full operational analysis",
  "Prioritization reasoning",
  "Recommended implementation path",
];

export function OpportunityCard({
  opportunity,
  index,
  contextSignals = [],
  priorityLabel,
  locked = false,
}: {
  opportunity: Opportunity;
  index: number;
  contextSignals?: string[];
  priorityLabel?: string;
  locked?: boolean;
}) {
  const o = opportunity;
  const ref = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState(false);
  const [signalsOpen, setSignalsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id !== o.id) return;
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(true);
      window.setTimeout(() => setHighlighted(false), 2000);
    };
    window.addEventListener("opportunity:focus", handler as EventListener);
    return () => window.removeEventListener("opportunity:focus", handler as EventListener);
  }, [o.id]);

  // De-duplicate signals: opportunity signal first, then context signals.
  const signalList = Array.from(
    new Set([o.signal, ...contextSignals].map((s) => s.trim()).filter(Boolean)),
  );

  return (
    <div
      ref={ref}
      id={`opportunity-${o.id}`}
      className={`flex h-full flex-col rounded-2xl border bg-card p-4 shadow-card transition-all duration-500 sm:p-6 ${
        highlighted ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
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

      <div className="mt-5 grid grid-cols-2 gap-1.5 sm:gap-2">
        <ScoreChip label="Impact" level={o.impact} />
        <ScoreChip label="Effort" level={o.effort} />
        <ScoreChip label="Confidence" level={o.confidence} />
        <ScoreChip label="Automation Risk" level={o.automationRisk} inverted />
      </div>

      {locked ? (
        <>
          <div className="relative mt-5">
            {/* short fade above the locked block for soft truncation */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-card"
            />
            <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-3 sm:p-4">
              <ul className="space-y-2 text-[12px] leading-snug text-muted-foreground">
                {LOCKED_SECTIONS.map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-auto" />
        </>
      ) : (
        <>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Signal" value={o.signal} />
            <Row label="Pain point" value={o.painPoint} />
            <Row label="Improvement" value={o.improvement} />
          </dl>

          <dl className="mt-3 hidden space-y-1 text-[11px] leading-snug text-muted-foreground sm:block">
            <div>
              <dt className="inline font-semibold text-foreground">Confidence:</dt>{" "}
              <dd className="inline">how sure we are this opportunity fits the business.</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-foreground">Automation Risk:</dt>{" "}
              <dd className="inline">how risky to fully automate without human review — lower is better.</dd>
            </div>
          </dl>

          {/* Expandable signals section */}
          <div className="mt-4 rounded-xl border border-border bg-surface-muted/60">
            <button
              type="button"
              onClick={() => setSignalsOpen((v) => !v)}
              aria-expanded={signalsOpen}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] font-medium text-foreground hover:bg-surface-muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <Radar className="h-3.5 w-3.5 text-muted-foreground" />
                Why we surfaced this
                <span className="text-muted-foreground">· {signalList.length} signal{signalList.length === 1 ? "" : "s"}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${signalsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {signalsOpen && (
              <div className="border-t border-border px-3 pb-3 pt-2">
                <ul className="space-y-1.5 text-[12px] leading-snug text-foreground">
                  {signalList.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                {priorityLabel && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Weighted toward your priority:{" "}
                    <span className="font-medium text-foreground">{priorityLabel}</span>.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Signals are inferred from publicly visible website patterns and business context — validate before acting.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-surface-muted p-2.5 sm:p-3">
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
        </>
      )}
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

