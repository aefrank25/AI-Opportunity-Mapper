export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 text-xs text-muted-foreground space-y-2">
        <p>
          <span className="font-medium text-foreground">Prototype mode:</span> results are generated
          from the URL, selected priority, and business-type patterns. Real website analysis is
          planned for a future version.
        </p>
        <p>© AI Opportunity Mapper — a diagnostic prototype.</p>
      </div>
    </footer>
  );
}
