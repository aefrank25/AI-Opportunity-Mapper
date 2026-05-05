import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Compass className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              AI Opportunity Mapper
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Practical AI opportunities for your business
            </span>
          </span>
        </Link>
        <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Prototype
        </span>
      </div>
    </header>
  );
}
