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

      <ol className="mt-5 grid gap-3 md:grid-cols-4">
        {weeks.map((w, i) => (
          <li
            key={w.week}
            className="relative rounded-2xl border border-border bg-card p-5 shadow-card"
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
