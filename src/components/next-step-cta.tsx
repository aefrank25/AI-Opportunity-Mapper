import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function NextStepCta({ isDemo }: { isDemo: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-primary p-4 shadow-card-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-primary-foreground sm:text-2xl">
            Ready to turn one opportunity into a real workflow?
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Pick the highest-impact opportunity and turn it into a concrete plan.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            variant="secondary"
            size="default"
            className="w-full sm:w-auto sm:h-11 sm:rounded-md sm:px-8"
            onClick={() =>
              toast("Implementation Brief is planned for the next version.", {
                description: "It will turn the chosen opportunity into a concrete brief you can share.",
              })
            }
          >
            Create Implementation Brief
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
    </div>
  );
}
