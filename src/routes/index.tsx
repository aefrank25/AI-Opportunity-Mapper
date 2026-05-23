import { createFileRoute, Link } from "@tanstack/react-router";
import { UrlInputCard } from "@/components/url-input-card";
import { NotifySection } from "@/components/notify-section";
import { Compass, Layers, ListChecks } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DEMO_META, type DemoId } from "@/lib/demos";

const CANONICAL = "https://ai-opp-mapper.lovable.app/";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b608a2a-83dd-48ce-81af-7f7c33f82451";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is an AI opportunity map?",
    a: "An AI opportunity map identifies practical places where AI or automation may help a business reduce manual work, improve follow-up, support customers, or make workflows more consistent.",
  },
  {
    q: "What does the free scan include?",
    a: "The free scan includes a business snapshot, top recommendation, prioritized opportunities, quick wins, and a basic roadmap.",
  },
  {
    q: "Does AI Opportunity Mapper analyze my website?",
    a: "Live Scan beta reads a small number of public website pages when available. If the site cannot be reached, the app can fall back to prototype recommendations based on business-type patterns.",
  },
  {
    q: "What is expanded analysis?",
    a: "Expanded analysis is a planned deeper version with more prioritization, supporting signals, suggested sequencing, expanded roadmap detail, and exportable reports.",
  },
  {
    q: "Is this an AI readiness assessment?",
    a: "No. The app focuses on finding and prioritizing practical AI and automation opportunities, not grading overall AI readiness.",
  },
  {
    q: "Who is this for?",
    a: "It is designed for founders, operators, consultants, and small teams who want practical ideas for where AI could help first.",
  },
  {
    q: "Do I need technical knowledge to use it?",
    a: "No. The output is written in plain language and focuses on business workflows, quick wins, and next steps.",
  },
];

const EXAMPLES: { id: DemoId; description: string }[] = [
  {
    id: "clinic",
    description:
      "Patient recall, appointment prep, and front-desk FAQ opportunities for a multi-provider dental practice.",
  },
  {
    id: "agency",
    description:
      "Proposal drafting, client reporting, and onboarding kit opportunities for a small full-service marketing agency.",
  },
  {
    id: "boutique",
    description:
      "Support reply drafts, order triage, and product content repurposing for a curated online boutique.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Opportunity Mapper | Practical AI Ideas for Business" },
      {
        name: "description",
        content:
          "Scan a business website for a prioritized map of practical AI and automation opportunities, with quick wins and suggested next steps.",
      },
      {
        property: "og:title",
        content: "AI Opportunity Mapper | Practical AI Ideas for Business",
      },
      {
        property: "og:description",
        content:
          "Get a prioritized map of practical AI and automation opportunities for a business website.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "AI Opportunity Mapper",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: CANONICAL,
          description:
            "Scan a business website and get a prioritized map of practical AI and automation opportunities, including quick wins, workflow signals, and suggested next steps.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative px-4 sm:px-6 overflow-hidden">
        {/* Subtle hero background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-5xl"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-3xl pt-6 pb-8 text-center sm:pt-16 lg:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Practical AI Discovery
          </span>
          <h1 className="mt-4 text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl lg:text-5xl">
            Find practical AI and automation opportunities for your business
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-5 sm:text-lg">
            Enter a business website and get a prioritized map of opportunities to explore first.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground/90 sm:mt-5">
            Built for consultants, agencies, and operators exploring practical AI use cases.
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              { icon: Compass, label: "Public website scan" },
              { icon: ListChecks, label: "Prioritized opportunities" },
              { icon: Layers, label: "Validation-ready next steps" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1 text-xs font-medium text-foreground/80"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto max-w-3xl pb-10">
          <div className="rounded-[1.25rem] bg-gradient-to-b from-primary/10 to-transparent p-px shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
            <div className="rounded-[1.2rem] bg-background">
              <UrlInputCard />
            </div>
          </div>
        </div>
      </section>


      <section className="px-4 sm:px-6">
        <div id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              How It Works
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
              desc="The system interprets website structure, business context, and customer workflow signals to identify likely operational opportunities."
            />
            <Step
              icon={<ListChecks className="h-4 w-4" />}
              title="Get a prioritized map"
              desc="Three ranked opportunities, quick wins, and a 30-day starter roadmap."
            />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 mt-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            What the free scan includes
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Business snapshot summarizing audience and workflow areas</li>
            <li>Top AI opportunity recommendation with rationale</li>
            <li>Prioritized list of practical AI and automation opportunities</li>
            <li>Quick wins you can act on this week</li>
            <li>Plain-language next steps for non-technical teams</li>
          </ul>
        </div>
      </section>

      <section className="px-4 sm:px-6 mt-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            What expanded analysis adds
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Expanded analysis is a planned deeper version of the opportunity map. It is not
            yet available.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Deeper prioritization across more opportunities</li>
            <li>Supporting signals behind each recommendation</li>
            <li>Suggested sequencing for what to tackle first</li>
            <li>Expanded roadmap detail beyond 30 days</li>
            <li>Exportable reports to share with your team</li>
          </ul>
        </div>
      </section>

      <section className="px-4 sm:px-6 mt-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Example AI opportunity maps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse sample opportunity maps to see how the analysis reads for different kinds
            of small businesses.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {EXAMPLES.map((ex) => {
              const meta = DEMO_META[ex.id];
              return (
                <Link
                  key={ex.id}
                  to="/analyzing"
                  search={{ demo: ex.id }}
                  className="block rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-foreground">{meta.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{meta.tagline}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{ex.description}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-primary">
                    View example →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <NotifySection />

      <section className="px-4 sm:px-6 mt-10 mb-6">

        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-2">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
