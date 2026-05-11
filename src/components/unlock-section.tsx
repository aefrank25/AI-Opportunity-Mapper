import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinBriefWaitlist } from "@/lib/brief-waitlist.functions";

interface Props {
  isDemo: boolean;
  sourceUrl?: string;
  topOpportunity?: string;
}

const UNLOCKS = [
  "Deeper prioritization across all opportunities",
  "Supporting evidence and signals behind each recommendation",
  "Suggested sequencing for the highest-leverage areas",
  "Expanded roadmap with more detail per phase",
  "Exportable report (coming soon)",
];

const FREE_INCLUDES = [
  "Business snapshot",
  "Top recommendation",
  "Prioritized opportunities",
  "Quick wins",
  "Basic roadmap",
];

export function UnlockSection({ isDemo, sourceUrl, topOpportunity }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const join = useServerFn(joinBriefWaitlist);

  const mutation = useMutation({
    mutationFn: (vars: { email: string }) =>
      join({
        data: {
          email: vars.email,
          sourceUrl: sourceUrl ?? null,
          topOpportunity: topOpportunity ?? null,
          isDemo,
        },
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    mutation.mutate(
      { email: trimmed },
      {
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Something went wrong."),
      },
    );
  };

  return (
    <div id="unlock-section" className="scroll-mt-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
      <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Continue deeper
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Want the expanded opportunity map?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get notified when expanded analysis is available, including deeper prioritization, supporting signals, suggested sequencing, and exportable reports.
          </p>

          <div className="mt-5 rounded-lg border border-border bg-surface-muted/40 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              This free scan includes
            </div>
            <p className="mt-1 text-sm text-foreground">
              {FREE_INCLUDES.join(" · ")}
            </p>
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              The Expanded Opportunity Map adds
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {UNLOCKS.map((u) => (
                <li key={u} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                  />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted/60 p-4 sm:p-5">
          {mutation.isSuccess ? (
            <div className="flex flex-col items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium text-foreground">
                You're on the list.
              </div>
              <p className="text-sm text-muted-foreground">
                We'll reach out when expanded analysis access is available.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="unlock-email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="unlock-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Notify me when available"
                )}
              </Button>
              <p className="text-[12px] leading-snug text-muted-foreground">
                No spam. Just updates when expanded analysis is available.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
