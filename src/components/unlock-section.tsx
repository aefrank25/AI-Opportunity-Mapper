import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { joinBriefWaitlist } from "@/lib/brief-waitlist.functions";
import {
  trackExpandedMap,
  type ExpandedMapFunnelContext,
} from "@/lib/expanded-map-analytics";

function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}

interface Props {
  isDemo: boolean;
  sourceUrl?: string;
  topOpportunity?: string;
  funnelContext?: ExpandedMapFunnelContext;
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

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter your email address." })
  .max(255, { message: "Email is too long — please use under 255 characters." })
  .email({ message: "That doesn't look like a valid email. Try the format name@company.com." });

function friendlyServerError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already") || m.includes("duplicate") || m.includes("exists")) {
    return "This email is already on the list — you're all set.";
  }
  if (m.includes("rate") || m.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout")) {
    return "Network issue — check your connection and try again.";
  }
  return message || "Something went wrong. Please try again in a moment.";
}

export function UnlockSection({ isDemo, sourceUrl, topOpportunity, funnelContext }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [emailStartedFired, setEmailStartedFired] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewedFiredRef = useRef(false);
  const join = useServerFn(joinBriefWaitlist);

  const track = (
    event: Parameters<typeof trackExpandedMap>[0],
    extras: Record<string, unknown> = {},
  ) => {
    if (!funnelContext) return;
    trackExpandedMap(event, funnelContext, {
      source_section: "expanded_map_section",
      ...extras,
    });
  };

  // Fire expanded_map_viewed once when the section enters the viewport.
  useEffect(() => {
    if (!funnelContext) return;
    const node = sectionRef.current;
    if (!node || viewedFiredRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      viewedFiredRef.current = true;
      track("expanded_map_viewed");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewedFiredRef.current) {
            viewedFiredRef.current = true;
            track("expanded_map_viewed");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelContext]);

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

  const validate = (value: string): string | null => {
    const result = emailSchema.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message ?? "Invalid email.";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const trimmed = email.trim();
    const validationError = validate(email);
    if (validationError) {
      setError(validationError);
      track("expanded_map_submit_error", {
        error_type: "validation",
        reason: validationError,
        empty_field: trimmed.length === 0,
      });
      const input = document.getElementById("unlock-email") as HTMLInputElement | null;
      input?.focus();
      return;
    }
    if (!consent) {
      const msg = "Please confirm you'd like to receive these updates.";
      setConsentError(msg);
      track("expanded_map_submit_error", {
        error_type: "validation",
        reason: "consent_required",
      });
      return;
    }
    setError(null);
    setConsentError(null);
    mutation.mutate(
      { email: trimmed },
      {
        onSuccess: () => {
          track("expanded_map_submitted", {
            email_domain: emailDomain(trimmed),
            top_opportunity: topOpportunity ?? null,
          });
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "";
          setError(friendlyServerError(message));
          const lower = message.toLowerCase();
          const errorType =
            lower.includes("already") || lower.includes("duplicate") || lower.includes("exists")
              ? "duplicate"
              : lower.includes("rate") || lower.includes("too many")
                ? "rate_limited"
                : lower.includes("network") || lower.includes("fetch") || lower.includes("timeout")
                  ? "network"
                  : "server";
          track("expanded_map_submit_error", {
            error_type: errorType,
            reason: message || "unknown",
            email_domain: emailDomain(trimmed),
          });
        },
      },
    );
  };

  const hasError = !!error;
  const submittedEmail = mutation.variables?.email;

  return (
    <div ref={sectionRef} id="unlock-section" className="scroll-mt-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_1fr]">
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

          <div className="mt-5 rounded-lg border border-border bg-surface-muted/40 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              What to expect
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Expanded analysis is coming soon. Join the list to be notified when deeper prioritization, supporting signals, sequencing, and exportable reports become available. Your interest helps prioritize what gets built next. There is no charge to join the notification list.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted/60 p-4 sm:p-5">
          {mutation.isSuccess ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-foreground">
                    You're on the list — confirmation saved.
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {submittedEmail ? (
                      <>
                        We've added <span className="font-medium text-foreground">{submittedEmail}</span> to the early access list. We'll email you the moment expanded analysis is available — usually no more than once or twice a month.
                      </>
                    ) : (
                      <>We'll email you the moment expanded analysis is available — usually no more than once or twice a month.</>
                    )}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Don't see anything later? Check your spam folder, or{" "}
                    <button
                      type="button"
                      onClick={() => {
                        mutation.reset();
                        setEmail("");
                        setError(null);
                        setTouched(false);
                        setConsent(false);
                        setConsentError(null);
                      }}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      use a different email
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (!emailStartedFired && value.length > 0) {
                      setEmailStartedFired(true);
                      track("expanded_map_email_started");
                    }
                    if (touched) {
                      setError(validate(value));
                    }
                  }}
                  onBlur={() => {
                    setTouched(true);
                    setError(validate(email));
                  }}
                  maxLength={255}
                  required
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "unlock-email-error" : "unlock-email-hint"}
                  disabled={mutation.isPending}
                  className={hasError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {hasError ? (
                  <p
                    id="unlock-email-error"
                    role="alert"
                    className="flex items-start gap-1.5 text-sm text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </p>
                ) : (
                  <p id="unlock-email-hint" className="text-[12px] text-muted-foreground">
                    Use the email where you’d like to receive updates about expanded analysis.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="unlock-consent"
                    checked={consent}
                    disabled={mutation.isPending}
                    onCheckedChange={(checked) => {
                      const next = checked === true;
                      setConsent(next);
                      if (next) {
                        setConsentError(null);
                        track("expanded_map_consent_checked");
                      }
                    }}
                    aria-invalid={!!consentError}
                    aria-describedby={consentError ? "unlock-consent-error" : undefined}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="unlock-consent"
                    className="text-[12px] font-normal leading-snug text-muted-foreground"
                  >
                    Yes, email me when expanded analysis is available. I can unsubscribe at any time.
                  </Label>
                </div>
                {consentError && (
                  <p
                    id="unlock-consent-error"
                    role="alert"
                    className="flex items-start gap-1.5 text-sm text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{consentError}</span>
                  </p>
                )}
              </div>
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
                No spam. Just updates when expanded analysis is available. See our{" "}
                <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                  Terms
                </Link>{" "}
                for how your email is used.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
