import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinBriefWaitlist } from "@/lib/brief-waitlist.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceUrl?: string;
  topOpportunity?: string;
  isDemo: boolean;
}

export function ImplementationBriefDialog({
  open,
  onOpenChange,
  sourceUrl,
  topOpportunity,
  isDemo,
}: Props) {
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
        onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong."),
      },
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // reset on close
      setTimeout(() => {
        setEmail("");
        setError(null);
        mutation.reset();
      }, 150);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mutation.isSuccess ? (
          <div className="flex flex-col items-center text-center py-2">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <DialogHeader className="mt-3">
              <DialogTitle>You're on the list</DialogTitle>
              <DialogDescription>
                We'll email you the moment Implementation Briefs go live — no spam, ever.
              </DialogDescription>
            </DialogHeader>
            <Button className="mt-5 w-full" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get the Implementation Brief</DialogTitle>
              <DialogDescription>
                We're building this. Drop your email and we'll send it as soon as it's ready.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="brief-waitlist-email">Email</Label>
                <Input
                  id="brief-waitlist-email"
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
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining…
                  </>
                ) : (
                  "Notify me when it's ready"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
