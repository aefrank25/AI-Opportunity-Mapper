import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function NextStepCta({ isDemo }: { isDemo: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-primary p-6 shadow-card-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl">
            Ready to turn one opportunity into a real workflow?
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Pick the highest-impact opportunity and turn it into a concrete plan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              toast("Implementation Brief is planned for the next version.", {
                description: "It will turn the chosen opportunity into a concrete brief you can share.",
              })
            }
          >
            Create Implementation Brief
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/">Start over</Link>
          </Button>
        </div>
      </div>
      {isDemo && (
        <div className="mt-5 border-t border-primary-foreground/15 pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground underline-offset-4 hover:underline"
          >
            Try it on your own website →
          </Link>
        </div>
      )}
    </div>
  );
}
