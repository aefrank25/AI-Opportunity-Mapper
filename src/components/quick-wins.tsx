import type { QuickWin } from "@/lib/types";
import { Zap } from "lucide-react";

export function QuickWins({ wins }: { wins: QuickWin[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Quick wins</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Small, low-risk moves you can make this week to set up the bigger opportunities.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {wins.map((w) => (
          <div
            key={w.title}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{w.title}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{w.action}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
