import type { RoadmapKey } from "@/lib/types";
import { roadmapFor } from "@/lib/roadmaps";

export function Roadmap({ roadmapKey }: { roadmapKey?: RoadmapKey }) {
  const weeks = roadmapFor(roadmapKey);

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">30-day starter roadmap</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A simple cadence to take the top opportunity from idea to validated prototype.
      </p>

      <ol className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
        {weeks.map((w, i) => (
          <li
            key={w.week}
            className="relative min-w-[78%] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 md:min-w-0 md:shrink"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {w.week}
              </span>
            </div>
            <div className="mt-3 text-sm font-semibold text-foreground">{w.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{w.desc}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
