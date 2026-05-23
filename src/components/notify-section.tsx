import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinBriefWaitlist } from "@/lib/brief-waitlist.functions";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter your email address." })
  .max(255)
  .email({ message: "That doesn't look like a valid email." });

export function NotifySection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const join = useServerFn(joinBriefWaitlist);

  const mutation = useMutation({
    mutationFn: (vars: { email: string }) =>
      join({ data: { email: vars.email, sourceUrl: null, topOpportunity: null, isDemo: false } }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email.");
      return;
    }
    if (!consent) {
      setError("Please confirm you'd like to receive these updates.");
      return;
    }
    mutation.mutate({ email: parsed.data });
  };

  return (
    <section className="px-4 sm:px-6 mt-10">
      <div
        id="notify"
        className="scroll-mt-20 mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          EXPANDED ANALYSIS
        </div>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Get notified when expanded analysis is available
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Includes deeper prioritization, supporting signals, sequencing, and exportable reports.
        </p>

        {mutation.isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  You're on the list.
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll email you when expanded analysis is available.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
                aria-invalid={!!error}
                className="h-10"
                disabled={mutation.isPending}
              />
              <Button type="submit" className="h-10 sm:w-auto" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Notify me when available"
                )}
              </Button>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="notify-consent"
                checked={consent}
                disabled={mutation.isPending}
                onChange={(e) => setConsent(e.currentTarget.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-primary accent-primary"
              />
              <Label
                htmlFor="notify-consent"
                className="text-xs font-normal leading-snug text-muted-foreground"
              >
                Yes, email me when expanded analysis is available. I can unsubscribe at any time.
              </Label>
            </div>
            {error && (
              <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{error}</span>
              </p>
            )}
            <p className="text-[12px] text-muted-foreground">
              No spam. Updates only. See our{" "}
              <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                Terms
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
