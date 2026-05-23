import type { BusinessSnapshot } from "@/lib/types";

export function SnapshotCard({ snapshot }: { snapshot: BusinessSnapshot }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Business snapshot</h2>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Inferred
        </span>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Based on public website signals. Items below appear if mentioned or implied on the website and may not reflect the full business.
      </p>
      <p className="mt-3 text-sm text-foreground">{snapshot.summary}</p>

      {/* Mobile: collapsible details */}
      <details className="group mt-3 sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
          <span>View details</span>
          <span className="transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
        </summary>
        <div className="mt-3 grid gap-4">
          <List title="Likely audience" items={snapshot.audience} />
          <List title="Inferred business signals" items={snapshot.signals} />
          <List title="Main inferred workflow areas" items={snapshot.workflowAreas} />
        </div>
      </details>

      {/* Desktop: always visible */}
      <div className="mt-6 hidden gap-6 sm:grid md:grid-cols-2">
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
