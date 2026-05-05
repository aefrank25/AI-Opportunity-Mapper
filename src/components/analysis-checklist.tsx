import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Interpreting business context",
  "Mapping likely workflow patterns",
  "Identifying practical AI use cases",
  "Ranking opportunities by impact, effort, confidence, and automation risk",
];

const STEP_MS = 1100;

export function AnalysisChecklist({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= STEPS.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive((a) => a + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [active, onDone]);

  const progress = Math.min(100, ((active) / STEPS.length) * 100);

  return (
    <div>
      <Progress value={progress} className="h-1" />
      <ol className="mt-6 space-y-3">
        {STEPS.map((s, i) => {
          const state = i < active ? "done" : i === active ? "active" : "pending";
          return (
            <li
              key={s}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
                state === "done" && "border-border bg-surface",
                state === "active" && "border-primary/30 bg-accent",
                state === "pending" && "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  state === "done" && "bg-primary text-primary-foreground",
                  state === "active" && "bg-primary/15 text-primary",
                  state === "pending" && "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <Check className="h-3 w-3" />
                ) : state === "active" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm",
                  state === "pending" ? "text-muted-foreground" : "text-foreground",
                  state === "active" && "font-medium",
                )}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
