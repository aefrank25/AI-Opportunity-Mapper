import { createFileRoute, Link } from "@tanstack/react-router";
import { UrlInputCard } from "@/components/url-input-card";
import { Compass, Layers, ListChecks } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Opportunity Mapper — Find practical AI opportunities for your business" },
      {
        name: "description",
        content:
          "Paste a business website and get a prioritized map of practical AI and automation opportunities to explore first.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-3xl pt-12 pb-6 text-center sm:pt-20">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            For founders, operators & consultants
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Find the best AI opportunities hiding in your business website.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Paste a business website and get a prioritized map of practical AI and automation
            opportunities to explore first.
          </p>
        </div>

        <div className="mx-auto max-w-3xl pb-10">
          <UrlInputCard />
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              How it works
            </h2>
            <Link
              to="/analyzing"
              search={{ demo: "agency" }}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See an example result →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Step
              icon={<Compass className="h-4 w-4" />}
              title="Share a business URL"
              desc="Add a website and the priority that matters most right now."
            />
            <Step
              icon={<Layers className="h-4 w-4" />}
              title="We interpret the context"
              desc="The prototype maps URL patterns and selected priority to common business workflows."
            />
            <Step
              icon={<ListChecks className="h-4 w-4" />}
              title="Get a prioritized map"
              desc="Three ranked opportunities, quick wins, and a 30-day starter roadmap."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
