import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitRecommendationFeedback } from "@/lib/feedback.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star, Check, Loader2 } from "lucide-react";

interface Props {
  sourceUrl?: string;
  topOpportunity?: string;
  isDemo: boolean;
}

const NOTES_MAX = 2000;

export function FeedbackWidget({ sourceUrl, topOpportunity, isDemo }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitFn = useServerFn(submitRecommendationFeedback);
  const mutation = useMutation({
    mutationFn: (data: { rating: number; notes: string }) =>
      submitFn({
        data: {
          rating: data.rating,
          notes: data.notes,
          sourceUrl,
          topOpportunity,
          isDemo,
        },
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!rating) {
      setError("Please choose a rating first.");
      return;
    }
    if (notes.length > NOTES_MAX) {
      setError(`Notes must be under ${NOTES_MAX} characters.`);
      return;
    }
    mutation.mutate({ rating, notes: notes.trim() });
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Check className="h-4 w-4 text-primary" />
          Thanks — your feedback helps us sharpen the recommendations.
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Were these recommendations useful?
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Quick rating and an optional note — takes 15 seconds.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(true)}
            className="self-start sm:self-auto"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Give feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 space-y-4"
    >
      <div>
        <div className="text-sm font-semibold text-foreground">
          Rate these recommendations
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          1 = not useful, 5 = very useful
        </p>
        <div
          className="mt-3 flex items-center gap-1"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hoverRating ?? rating ?? 0) >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                className="rounded-md p-1 transition-colors hover:bg-surface-muted"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    active
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            );
          })}
          {rating && (
            <span className="ml-2 text-xs text-muted-foreground">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="feedback-notes" className="text-xs font-medium text-foreground">
          Notes (optional)
        </label>
        <Textarea
          id="feedback-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
          placeholder="What was on point? What missed the mark?"
          rows={3}
          maxLength={NOTES_MAX}
        />
        <div className="text-right text-[11px] text-muted-foreground">
          {notes.length}/{NOTES_MAX}
        </div>
      </div>

      {(error || mutation.isError) && (
        <p className="text-xs text-destructive">
          {error ?? "Couldn't submit feedback. Please try again."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit feedback
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setExpanded(false);
            setError(null);
          }}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
