import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ScoreLevel } from "@/lib/types";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className="whitespace-nowrap">{label}</span>
        {explanation && (
          <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${label} explanation`}
                aria-expanded={open}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (e.pointerType === "touch" || e.pointerType === "pen") {
                    e.preventDefault();
                    setOpen((v) => !v);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                style={{ touchAction: "manipulation" }}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/70 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Info className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={6}
              collisionPadding={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              onEscapeKeyDown={() => setOpen(false)}
              className="w-auto max-w-[14rem] rounded-md p-2.5 text-xs leading-snug normal-case tracking-normal"
            >
              {explanation}
            </PopoverContent>
          </Popover>
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
