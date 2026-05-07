import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AI Opportunity Mapper" },
      {
        name: "description",
        content:
          "Acceptable use, service terms, and disclaimers for AI Opportunity Mapper.",
      },
      { property: "og:title", content: "Terms of Service — AI Opportunity Mapper" },
      {
        property: "og:description",
        content:
          "Acceptable use, service terms, and disclaimers for AI Opportunity Mapper.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-3xl py-10 sm:py-16">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Legal
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <Section title="Overview">
            <p>
              AI Opportunity Mapper ("the Service") generates non-binding
              recommendations from publicly visible website patterns and
              business context. By using the Service you agree to these terms.
            </p>
          </Section>

          <Section title="Acceptable use">
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Submit only websites you own or have permission to analyze, or
                publicly accessible business websites.
              </li>
              <li>
                Don't use the Service to harass, defame, or compete unfairly
                against another business.
              </li>
              <li>
                Don't attempt to reverse-engineer, scrape, overload, or abuse
                the Service or its underlying APIs.
              </li>
              <li>
                Don't submit private, sensitive, or personally identifying
                information through any input field.
              </li>
            </ul>
          </Section>

          <Section title="Recommendations are not advice">
            <p>
              Insights produced by the Service are inferred from limited
              public signals. They are guidance for exploration only and are{" "}
              <span className="font-medium text-foreground">
                not professional, legal, financial, medical, or operational
                advice
              </span>
              . Validate recommendations with qualified humans before acting.
            </p>
          </Section>

          <Section title="Accounts and access">
            <p>
              Most of the Service works without an account. Where accounts
              exist (e.g. admin tooling), you are responsible for keeping your
              credentials secure and for all activity under your account.
            </p>
          </Section>

          <Section title="Intellectual property">
            <p>
              The Service, including its design, code, and recommendation
              templates, is owned by its creators. Outputs you generate may be
              used for your own internal business purposes without restriction.
            </p>
          </Section>

          <Section title="Service availability">
            <p>
              The Service is provided "as is" and may change, be paused, or be
              discontinued at any time. We don't guarantee specific uptime or
              that any particular feature will remain available.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, the Service and its
              creators are not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service or
              from decisions you make based on its output.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms as the product evolves. Material
              changes will be reflected by updating the "Last updated" date
              above.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms? Email{" "}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="mailto:SonoranDataStrategy@gmail.com?subject=Terms%20of%20Service%20question"
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
