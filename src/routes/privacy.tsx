import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — AI Opportunity Mapper" },
      {
        name: "description",
        content:
          "How AI Opportunity Mapper handles the website URLs, priorities, and feedback you share when generating recommendations.",
      },
      { property: "og:title", content: "Privacy — AI Opportunity Mapper" },
      {
        property: "og:description",
        content:
          "How AI Opportunity Mapper handles the website URLs, priorities, and feedback you share when generating recommendations.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-3xl py-10 sm:py-16">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Privacy
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          How we handle your data
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: May 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <Section title="What we collect">
            <p>
              AI Opportunity Mapper is designed to be lightweight. We only
              collect what's necessary to generate and improve recommendations:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                The website URL and priority you submit when running an
                analysis.
              </li>
              <li>
                The email address you provide if you join the Implementation
                Brief waitlist.
              </li>
              <li>
                Any rating or notes you submit through the feedback widget on
                the results page.
              </li>
              <li>
                Standard request metadata (timestamp, anonymized usage
                signals) used to keep the service running reliably.
              </li>
            </ul>
          </Section>

          <Section title="What we don't collect">
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                We do not crawl private pages, log you into anything, or
                access content behind authentication.
              </li>
              <li>
                We do not collect personal information about your customers,
                staff, or internal systems.
              </li>
              <li>
                We do not sell your data or share it with advertisers.
              </li>
            </ul>
          </Section>

          <Section title="How recommendations are generated">
            <p>
              Insights are inferred from publicly visible website patterns
              (URL structure, business context, common workflow signals) plus
              the priority you select. Recommendations are guidance, not
              advice — they should be validated before implementation.
            </p>
          </Section>

          <Section title="How your data is stored">
            <p>
              Submissions (waitlist signups and feedback) are stored in a
              managed database with row-level access controls. Only
              authorized administrators can read aggregated submissions, and
              admin access is gated by authentication.
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                You can request deletion of your waitlist email or feedback at
                any time.
              </li>
              <li>
                You don't need an account to run an analysis — most of the
                product works without sign-in.
              </li>
            </ul>
          </Section>

          <Section title="Contact">
            <p>
              Questions, deletion requests, or concerns? Email{" "}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="mailto:SonoranDataStrategy@gmail.com?subject=Privacy%20question"
              >
                SonoranDataStrategy@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link
            to="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
