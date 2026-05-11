import type { RoadmapKey } from "@/lib/types";
import { roadmapFor } from "@/lib/roadmaps";
import { Lock } from "lucide-react";
import { focusUnlockEmail } from "@/lib/focus-unlock-email";

function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export function Roadmap({ roadmapKey }: { roadmapKey?: RoadmapKey }) {
  const weeks = roadmapFor(roadmapKey);

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">30-day starter roadmap</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A simple cadence to take the top opportunity from idea to validated prototype.
      </p>

      <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {weeks.map((w, i) => {
          const locked = i > 0;
          return (
            <li
              key={w.week}
              className={`relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 ${
                locked ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                    locked
                      ? "bg-surface-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {w.week}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-foreground">{w.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locked ? truncate(w.desc) : w.desc}
              </div>

              {locked && (
                <div className="mt-4 space-y-2 border-t border-dashed border-border pt-3">
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    <span>Expanded roadmap details</span>
                  </div>
                  {i === 1 && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                      Request expanded roadmap →
                    </span>
                  )}
                </div>
              )}

              {locked && (
                <button
                  type="button"
                  onClick={focusUnlockEmail}
                  aria-label="Request expanded roadmap details"
                  className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
