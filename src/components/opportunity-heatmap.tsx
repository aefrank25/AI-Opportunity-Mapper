import { useMemo, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Opportunity, ScoreLevel } from "@/lib/types";
import { Sparkles, Rocket, Compass, Clock, PauseCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ---- helpers -------------------------------------------------------------

const LEVEL_NUM: Record<ScoreLevel, number> = { Low: 1, Medium: 2, High: 3 };

type Bucket =
  | "start_here"
  | "quick_wins"
  | "high_impact_next"
  | "longer_term"
  | "not_yet";

interface Scored {
  op: Opportunity;
  impact: number;
  effort: number;
  confidence: number;
  risk: number;
  // Derived inferred dimensions (1-3 scale)
  opImpact: ScoreLevel;
  ease: ScoreLevel;
  timeToValue: ScoreLevel; // High = fast
  bucket: Bucket;
  // 0-100 plotting positions (effort = x, impact = y)
  x: number;
  y: number;
}

function easeFromEffort(effort: number): ScoreLevel {
  // Low effort = High ease
  return effort === 1 ? "High" : effort === 2 ? "Medium" : "Low";
}

function timeToValue(effort: number, confidence: number): ScoreLevel {
  const score = (4 - effort) + (confidence - 1); // 1..5
  if (score >= 4) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

function bucketFor(s: {
  impact: number;
  effort: number;
  confidence: number;
  risk: number;
}): Bucket {
  // Not yet: low confidence + high risk OR low impact + high effort
  if (s.confidence === 1 && s.risk === 3) return "not_yet";
  if (s.impact === 1 && s.effort === 3) return "not_yet";

  if (s.impact >= 2 && s.effort === 1) return "quick_wins";
  if (s.impact === 3 && s.effort === 2 && s.confidence >= 2) return "high_impact_next";
  if (s.impact === 3 && s.effort >= 2) return "longer_term";
  if (s.impact === 2 && s.effort >= 2) return "longer_term";
  return "quick_wins";
}

function scoreOpportunity(op: Opportunity): Scored {
  const impact = LEVEL_NUM[op.impact];
  const effort = LEVEL_NUM[op.effort];
  const confidence = LEVEL_NUM[op.confidence];
  const risk = LEVEL_NUM[op.automationRisk];
  const ease = easeFromEffort(effort);
  // Plot: x = effort (low effort -> left), y = impact (high -> top)
  // jitter slightly using id hash for visual separation
  let h = 0;
  for (let i = 0; i < op.id.length; i++) h = (h * 31 + op.id.charCodeAt(i)) >>> 0;
  const jx = ((h % 17) - 8) / 2; // -4..+4
  const jy = (((h >> 5) % 17) - 8) / 2;
  const x = Math.min(92, Math.max(8, (effort - 1) * 42 + 12 + jx));
  const y = Math.min(92, Math.max(8, (3 - impact) * 42 + 12 + jy));
  return {
    op,
    impact,
    effort,
    confidence,
    risk,
    opImpact: op.impact,
    ease,
    timeToValue: timeToValue(effort, confidence),
    bucket: bucketFor({ impact, effort, confidence, risk }),
    x,
    y,
  };
}

// "Start here" is a recommendation surfaced from the highest-scoring quick win
function pickStartHere(scored: Scored[]): string | null {
  const candidates = scored
    .filter((s) => s.bucket === "quick_wins" || s.bucket === "high_impact_next")
    .sort((a, b) => {
      const aScore = a.impact * 2 + a.confidence - a.effort - (a.risk - 1);
      const bScore = b.impact * 2 + b.confidence - b.effort - (b.risk - 1);
      return bScore - aScore;
    });
  return candidates[0]?.op.id ?? null;
}

// ---- bucket meta ---------------------------------------------------------

const BUCKET_META: Record<
  Bucket,
  { label: string; blurb: string; Icon: typeof Sparkles; tone: string }
> = {
  start_here: {
    label: "Start here",
    blurb: "The opportunity that likely offers the best balance of impact, ease, and confidence based on the website signals.",
    Icon: Compass,
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  quick_wins: {
    label: "Likely quick wins",
    blurb: "Lower-effort moves that may deliver visible operational relief within a few weeks.",
    Icon: Sparkles,
    tone: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
  high_impact_next: {
    label: "High-impact next steps",
    blurb: "Higher-effort opportunities that likely create meaningful operational lift once the quick wins are in place.",
    Icon: Rocket,
    tone: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
  },
  longer_term: {
    label: "Longer-term opportunities",
    blurb: "Strategic improvements that may pay off but typically need staff time, process design, or sequencing first.",
    Icon: Clock,
    tone: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
  },
  not_yet: {
    label: "Probably not worth prioritizing yet",
    blurb: "Based on the website signals alone, the case for these is weaker — revisit once foundational workflows are in place.",
    Icon: PauseCircle,
    tone: "bg-muted text-muted-foreground border-border",
  },
};

const BUCKET_ORDER: Bucket[] = [
  "start_here",
  "quick_wins",
  "high_impact_next",
  "longer_term",
  "not_yet",
];

// ---- component -----------------------------------------------------------

export function OpportunityHeatmap({ opportunities }: { opportunities: Opportunity[] }) {
  const { scored, startHereId, grouped } = useMemo(() => {
    const scored = opportunities.map(scoreOpportunity);
    const startHereId = pickStartHere(scored);
    const grouped: Record<Bucket, Scored[]> = {
      start_here: [],
      quick_wins: [],
      high_impact_next: [],
      longer_term: [],
      not_yet: [],
    };
    for (const s of scored) {
      if (s.op.id === startHereId) grouped.start_here.push(s);
      else grouped[s.bucket].push(s);
    }
    return { scored, startHereId, grouped };
  }, [opportunities]);

  return (
    <section aria-labelledby="heatmap-heading" className="space-y-5">
      <div>
        <h2 id="heatmap-heading" className="text-lg font-semibold tracking-tight text-foreground">
          AI Opportunity Heatmap
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A visual read on what likely matters most based on the website experience. Inferred from
          public signals — internal data may shift these positions.
        </p>
      </div>

      {/* Matrix */}
      <TooltipProvider delayDuration={150}>
      <div role="group" aria-label="Impact vs. ease of implementation matrix" className="rounded-2xl border border-border bg-card p-3 shadow-card sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            Impact vs. ease of implementation
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="How impact and ease are inferred" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover text-popover-foreground border border-border">
                <p className="text-xs leading-relaxed">
                  <span className="font-semibold">Impact</span> is inferred from website signals like the visibility of a service, repeated calls-to-action, or how central a workflow appears to the business.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed">
                  <span className="font-semibold">Ease</span> is inferred from how standardized the task looks on the site — clear forms, repeating patterns, and templated copy suggest it's easier to automate.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Internal tools, staffing, and budget aren't visible — these are starting estimates.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-emerald-500" /> Quick win</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-blue-500" /> High-impact</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-amber-500" /> Longer-term</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-muted-foreground/60" /> Not yet</span>
          </div>
        </div>

        {/* Mobile-only collapsible legend */}
        <details className="group mt-2 sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            <span>Color legend</span>
            <span className="text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
          </summary>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-emerald-500" /> Quick win</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-blue-500" /> High-impact</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-amber-500" /> Longer-term</span>
            <span className="inline-flex items-center gap-1"><LegendDot className="bg-muted-foreground/60" /> Not yet</span>
          </div>
        </details>

        <div className="mt-4 grid grid-cols-[14px_1fr] gap-1.5 sm:grid-cols-[auto_1fr] sm:gap-2">
          {/* Y axis label */}
          <div className="flex items-center">
            <div className="rotate-180 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl] sm:text-[10px]">
              Higher impact →
            </div>
          </div>

          {/* Plot area */}
          <div
            role="figure"
            aria-label={`Scatter plot of ${scored.length} opportunities. Horizontal axis: easier to harder to implement. Vertical axis: lower to higher impact.`}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-muted sm:aspect-[5/4]"
          >
            {/* Quadrant grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2" aria-hidden="true">
              <QuadrantLabel label="Quick wins" sub="High impact · Low effort" align="tl" />
              <QuadrantLabel label="High-impact next" sub="High impact · Higher effort" align="tr" />
              <QuadrantLabel label="Easy extras" sub="Lower impact · Low effort" align="bl" />
              <QuadrantLabel label="Lower priority" sub="Lower impact · Higher effort" align="br" />
            </div>
            <div className="absolute inset-0 border-l border-t border-border/60" aria-hidden="true" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" aria-hidden="true" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-border/60" aria-hidden="true" />

            {/* Dots */}
            {scored.map((s, i) => (
              <Dot key={s.op.id} s={s} index={i + 1} highlighted={s.op.id === startHereId} />
            ))}
          </div>
        </div>

        {/* X axis label */}
        <div className="mt-2 grid grid-cols-[14px_1fr] gap-1.5 sm:grid-cols-[auto_1fr] sm:gap-2">
          <div />
          <div className="text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
            Easier → harder to implement
          </div>
        </div>

        {/* Numbered key under the matrix */}
        <ol
          aria-label="Numbered key of opportunities plotted on the matrix. Use arrow keys to move between items, Enter to jump to the matching opportunity card."
          className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3"
          onKeyDown={(e) => handleListArrowKeys(e)}
        >
          {scored.map((s, i) => (
            <li key={s.op.id}>
              <button
                type="button"
                data-heatmap-key-item
                onClick={() => focusOpportunity(s.op.id)}
                aria-label={`Opportunity ${i + 1} of ${scored.length}: ${s.op.name}. ${BUCKET_META[s.bucket].label}. Press Enter to jump to its card.`}
                className="flex w-full items-start gap-2 rounded-md px-1 py-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[10px] font-semibold text-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 break-words text-foreground">{s.op.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      </TooltipProvider>

      {/* Buckets */}
      <div className="space-y-4" role="region" aria-labelledby="heatmap-sequencing-heading">
        <div id="heatmap-sequencing-heading" className="text-sm font-semibold text-foreground">Suggested sequencing</div>
        {BUCKET_ORDER.map((b) => {
          const items = grouped[b];
          if (items.length === 0 && b !== "start_here") return null;
          if (b === "start_here" && items.length === 0) return null;
          const meta = BUCKET_META[b];
          const { Icon } = meta;
          const headingId = `bucket-${b}-heading`;
          const blurbId = `bucket-${b}-blurb`;
          return (
            <section
              key={b}
              aria-labelledby={headingId}
              aria-describedby={blurbId}
              className="rounded-2xl border border-border bg-card shadow-card"
            >
              {/* Mobile: collapsible */}
              <details className="group sm:hidden" open={b === "start_here"}>
                <summary className="flex cursor-pointer list-none items-center gap-2.5 p-3">
                  <span aria-hidden="true" className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 id={`${headingId}-m`} className="text-sm font-semibold text-foreground">
                      {meta.label}
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">({items.length})</span>
                    </h3>
                  </div>
                  <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="px-3 pb-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>
                  <ul
                    aria-label={`${meta.label}: ${items.length} ${items.length === 1 ? "opportunity" : "opportunities"}`}
                    onKeyDown={(e) => handleListArrowKeys(e)}
                    className="mt-3 grid grid-cols-1 gap-2"
                  >
                    {items.map((s) => (
                      <BucketItem key={s.op.id} s={s} />
                    ))}
                  </ul>
                </div>
              </details>

              {/* Desktop: always expanded */}
              <div className="hidden p-5 sm:block">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 id={headingId} className="text-sm font-semibold text-foreground">{meta.label}</h3>
                    <p id={blurbId} className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{meta.blurb}</p>
                  </div>
                </div>
                <ul
                  aria-label={`${meta.label}: ${items.length} ${items.length === 1 ? "opportunity" : "opportunities"}`}
                  onKeyDown={(e) => handleListArrowKeys(e)}
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {items.map((s) => (
                    <BucketItem key={s.op.id} s={s} />
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Heatmap positions are inferred from website signals only. They do not account for internal
        operations, staffing, tools, or budget. Treat sequencing as a starting point for
        conversation, not a fixed plan.
      </p>
    </section>
  );
}

// ---- subcomponents -------------------------------------------------------

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function QuadrantLabel({
  label,
  sub,
  align,
}: {
  label: string;
  sub: string;
  align: "tl" | "tr" | "bl" | "br";
}) {
  const pos = {
    tl: "items-start justify-start text-left p-1.5 sm:p-2",
    tr: "items-start justify-end text-right p-1.5 sm:p-2",
    bl: "items-end justify-start text-left p-1.5 sm:p-2",
    br: "items-end justify-end text-right p-1.5 sm:p-2",
  }[align];
  return (
    <div className={`flex ${pos}`}>
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
          {label}
        </div>
        <div className="hidden text-[10px] text-muted-foreground/80 sm:block">{sub}</div>
      </div>
    </div>
  );
}

function dotColor(bucket: Bucket): string {
  switch (bucket) {
    case "quick_wins":
      return "bg-emerald-500";
    case "high_impact_next":
      return "bg-blue-500";
    case "longer_term":
      return "bg-amber-500";
    case "not_yet":
      return "bg-muted-foreground/60";
    default:
      return "bg-primary";
  }
}

function focusOpportunity(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("opportunity:focus", { detail: id }));
}

// Roving keyboard navigation across focusable buttons within a list.
function handleListArrowKeys(e: ReactKeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const container = e.currentTarget;
  const focusables = Array.from(
    container.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
  );
  if (focusables.length === 0) return;
  const active = document.activeElement as HTMLElement | null;
  const idx = active ? focusables.indexOf(active as HTMLButtonElement) : -1;
  let next = idx;
  if (e.key === "ArrowDown" || e.key === "ArrowRight") next = idx < 0 ? 0 : (idx + 1) % focusables.length;
  else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = idx <= 0 ? focusables.length - 1 : idx - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = focusables.length - 1;
  e.preventDefault();
  focusables[next]?.focus();
}

function bucketLabel(b: Bucket) {
  return BUCKET_META[b].label;
}

function Dot({ s, index, highlighted }: { s: Scored; index: number; highlighted: boolean }) {
  const color = dotColor(s.bucket);
  const aria = `Opportunity ${index}: ${s.op.name}. ${bucketLabel(s.bucket)}. Impact ${s.opImpact}, ease ${s.ease}, confidence ${s.op.confidence}.${
    highlighted ? " Recommended starting point." : ""
  } Press Enter to jump to its card.`;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${s.x}%`, top: `${s.y}%` }}
    >
      <button
        type="button"
        onClick={() => focusOpportunity(s.op.id)}
        aria-label={aria}
        aria-describedby={highlighted ? undefined : undefined}
        className={`relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-sm ring-2 ring-background transition-transform hover:scale-110 focus:outline-none focus-visible:ring-primary sm:h-7 sm:w-7 sm:text-[11px] ${color} ${
          highlighted ? "outline outline-2 outline-offset-2 outline-primary" : ""
        }`}
        title={s.op.name}
      >
        <span aria-hidden="true">{index}</span>
      </button>
    </div>
  );
}

function BucketItem({ s }: { s: Scored }) {
  const aria = `${s.op.name}. ${s.op.whyItMatters} Operational impact ${s.opImpact}, ease ${s.ease}, time to value ${s.timeToValue}, confidence ${s.op.confidence}. Press Enter to jump to its card.`;
  return (
    <li>
      <button
        type="button"
        onClick={() => focusOpportunity(s.op.id)}
        aria-label={aria}
        className="flex w-full flex-col items-start rounded-xl border border-border bg-surface-muted p-3 text-left transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="text-sm font-semibold text-foreground">{s.op.name}</div>
        <p className="mt-1 text-xs text-muted-foreground">{s.op.whyItMatters}</p>
        <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden="true">
          <Chip label="Op. impact" value={s.opImpact} />
          <Chip label="Ease" value={s.ease} />
          <Chip label="Time to value" value={s.timeToValue} fastIsGood />
          <Chip label="Confidence" value={s.op.confidence} />
        </div>
      </button>
    </li>
  );
}

function Chip({
  label,
  value,
  fastIsGood,
}: {
  label: string;
  value: ScoreLevel;
  fastIsGood?: boolean;
}) {
  // For most chips, High is good. For chips where High = good (impact, ease, confidence, time-to-value), tone the same.
  const tone =
    value === "High"
      ? fastIsGood
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : value === "Medium"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
