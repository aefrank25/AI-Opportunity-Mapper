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
              A practical AI opportunity tool for consultants, founders, and operators.
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
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:SonoranDataStrategy@gmail.com"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-border/60 pt-4 space-y-2">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Insights are generated from publicly visible website patterns
            and inferred workflow signals. Recommendations should be validated before
            implementation.
          </p>
          <p className="text-[11px] text-muted-foreground">
            © 2026 AI Opportunity Mapper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
