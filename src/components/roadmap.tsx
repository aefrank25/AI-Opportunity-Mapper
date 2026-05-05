const WEEKS = [
  { week: "Week 1", title: "Clarify the workflow", desc: "Pick one opportunity and gather concrete examples of how the work gets done today." },
  { week: "Week 2", title: "Define the process", desc: "Write down the inputs, decisions, and outputs the workflow needs to function reliably." },
  { week: "Week 3", title: "Test a prototype", desc: "Build a lightweight AI or automation prototype and try it on real (low-stakes) examples." },
  { week: "Week 4", title: "Review & decide", desc: "Evaluate the results, capture what worked, and decide whether to expand or pivot." },
];

export function Roadmap() {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">30-day starter roadmap</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A simple cadence to take one opportunity from idea to validated prototype.
      </p>

      <ol className="mt-5 grid gap-3 md:grid-cols-4">
        {WEEKS.map((w, i) => (
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
