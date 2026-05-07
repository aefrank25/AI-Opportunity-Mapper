import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">
              AI Opportunity Mapper
            </div>
            <p className="text-xs text-muted-foreground">
              Practical operational and AI opportunity insights for SMBs.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Link
              to="/"
              hash="how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              to="/analyzing"
              search={{ demo: "agency" }}
              className="hover:text-foreground transition-colors"
            >
              Example analysis
            </Link>
            <a
              href="mailto:hello@aiopportunitymapper.com?subject=Privacy%20question"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="mailto:hello@aiopportunitymapper.com?subject=Product%20feedback"
              className="hover:text-foreground transition-colors"
            >
              Feedback
            </a>
            <a
              href="mailto:hello@aiopportunitymapper.com"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        <p className="mt-6 border-t border-border/60 pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Recommendations are generated from publicly visible website patterns
          and inferred workflow signals. Insights should be validated before
          implementation.
        </p>
      </div>
    </footer>
  );
}
