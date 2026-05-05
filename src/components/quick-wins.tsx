import type { QuickWin } from "@/lib/types";
import { Zap } from "lucide-react";

export function QuickWins({ wins }: { wins: QuickWin[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Quick wins</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Small, low-risk moves you can make this week to set up the bigger opportunities.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {wins.map((w) => (
          <div
            key={w.title}
            className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">{w.title}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{w.action}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
