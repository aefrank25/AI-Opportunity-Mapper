import { cn } from "@/lib/utils";
import type { ScoreLevel } from "@/lib/types";

interface ScoreChipProps {
  label: string;
  level: ScoreLevel;
  /** When true, High = warning (rose), Low = good (slate). Used for Automation Risk. */
  inverted?: boolean;
}

export function ScoreChip({ label, level, inverted = false }: ScoreChipProps) {
  const styles = getStyles(level, inverted);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
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
