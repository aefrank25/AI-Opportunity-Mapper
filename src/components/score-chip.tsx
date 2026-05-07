import { cn } from "@/lib/utils";
import type { ScoreLevel } from "@/lib/types";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreChipProps {
  label: string;
  level: ScoreLevel;
  /** When true, High = warning (rose), Low = good (slate). Used for Automation Risk. */
  inverted?: boolean;
  /** Optional plain-English explanation of what this score means. */
  hint?: string;
}

const DEFAULT_HINTS: Record<string, string> = {
  Confidence:
    "How sure we are this opportunity fits the business, based on signals from the URL and selected priority.",
  "Automation Risk":
    "How risky it would be to fully automate this without human review. Lower is better — High means a person should stay in the loop.",
};

export function ScoreChip({ label, level, inverted = false, hint }: ScoreChipProps) {
  const styles = getStyles(level, inverted);
  const explanation = hint ?? DEFAULT_HINTS[label];
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
        <span className="truncate">{label}</span>
        {explanation && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label} explanation`}
                  className="-m-1.5 inline-flex shrink-0 items-center justify-center p-1.5 text-muted-foreground/70 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                {explanation}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
          styles,
        )}
      >
        {level}
      </span>
    </div>
  );
}

function getStyles(level: ScoreLevel, inverted: boolean): string {
  if (inverted) {
    if (level === "High") return "bg-risk-high text-risk-high-foreground";
    if (level === "Medium") return "bg-score-medium text-score-medium-foreground";
    return "bg-score-low text-score-low-foreground";
  }
  if (level === "High") return "bg-score-high text-score-high-foreground";
  if (level === "Medium") return "bg-score-medium text-score-medium-foreground";
  return "bg-score-low text-score-low-foreground";
}
