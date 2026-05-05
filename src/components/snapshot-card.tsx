import type { BusinessSnapshot } from "@/lib/types";

export function SnapshotCard({ snapshot }: { snapshot: BusinessSnapshot }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Business snapshot</h2>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Inferred
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground">{snapshot.summary}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <List title="Likely audience" items={snapshot.audience} />
        <List title="Inferred business signals" items={snapshot.signals} />
        <List
          title="Main inferred workflow areas"
          items={snapshot.workflowAreas}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}

function List({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
