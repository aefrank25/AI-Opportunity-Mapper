import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AnalysisChecklist } from "@/components/analysis-checklist";
import { displayHost } from "@/lib/url";
import { DEMO_META } from "@/lib/demos";

const searchSchema = z
  .object({
    url: z.string().optional(),
    priority: z.string().optional(),
    demo: z.enum(["clinic", "agency", "boutique"]).optional(),
  })
  .refine((v) => v.url || v.demo, { message: "url or demo required" });

export const Route = createFileRoute("/analyzing")({
  head: () => ({
    meta: [
      { title: "Analyzing — AI Opportunity Mapper" },
      { name: "description", content: "Interpreting business context and mapping AI opportunities." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: Analyzing,
});

function Analyzing() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const subject = search.demo
    ? `${DEMO_META[search.demo].label} — ${DEMO_META[search.demo].url}`
    : displayHost(search.url ?? "");

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-2xl pt-16 pb-20 sm:pt-24">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card-lg sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Generating opportunity map for
          </div>
          <div className="mt-1 truncate text-lg font-semibold text-foreground">{subject}</div>

          <div className="mt-6">
            <AnalysisChecklist
              onDone={() =>
                navigate({
                  to: "/results",
                  search: search.demo
                    ? { demo: search.demo }
                    : { url: search.url!, priority: search.priority ?? "not_sure" },
                })
              }
            />
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Prototype mode: results are generated from the URL, selected priority, and business-type
            patterns. Real website analysis is planned for a future version.
          </p>
        </div>
      </div>
    </section>
  );
}
