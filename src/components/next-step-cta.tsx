import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ImplementationBriefDialog } from "@/components/implementation-brief-dialog";

interface Props {
  isDemo: boolean;
  sourceUrl?: string;
  topOpportunity?: string;
}

// Toggle when the Expanded Opportunity Map is actually available.
const EXPANDED_MAP_AVAILABLE = false;

export function NextStepCta({ isDemo, sourceUrl, topOpportunity }: Props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (EXPANDED_MAP_AVAILABLE) {
      setOpen(true);
    } else {
      toast("Expanded Opportunity Map is planned for the next version.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-primary p-4 shadow-card-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-primary-foreground sm:text-2xl">
            Want the expanded opportunity map?
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            See the deeper prioritization, supporting signals, sequencing, and expanded next steps behind this scan.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            variant="secondary"
            size="default"
            className="w-full sm:w-auto sm:h-11 sm:rounded-md sm:px-8"
            onClick={handleClick}
          >
            Get Expanded Map
          </Button>
          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto sm:h-11 sm:rounded-md sm:px-8"
          >
            <Link to="/">Start over</Link>
          </Button>
        </div>
      </div>
      {isDemo && (
        <div className="mt-4 border-t border-primary-foreground/15 pt-3 sm:mt-5 sm:pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground underline-offset-4 hover:underline"
          >
            Try it on your own website →
          </Link>
        </div>
      )}

      {EXPANDED_MAP_AVAILABLE && (
        <ImplementationBriefDialog
          open={open}
          onOpenChange={setOpen}
          sourceUrl={sourceUrl}
          topOpportunity={topOpportunity}
          isDemo={isDemo}
        />
      )}
    </div>
  );
}
