# Footer + Trust Copy Refinement

Tighten the footer and a few supporting lines so the product reads as a polished, real tool — not a prototype demo.

## 1. Rebuild `src/components/site-footer.tsx`

Replace the current two-line prototype footer with a clean two-column layout:

- **Left**: "AI Opportunity Mapper" (small, semibold) + subtitle "Practical operational and AI opportunity insights for SMBs."
- **Right**: muted text links — How it works, Example analysis, Privacy, Feedback, Contact.
- **Below, separated by a thin divider**: a single muted disclaimer line — "Recommendations are generated from publicly visible website patterns and inferred workflow signals. Insights should be validated before implementation."

Styling: keep `text-muted-foreground`, `text-xs` / `text-[11px]`, `border-border/60`, lightweight padding (`py-8`). No oversized type, no boxed sections, no corporate feel. Hover state shifts links to `text-foreground`.

Link targets:
- How it works → home anchor `#how-it-works`
- Example analysis → `/analyzing?demo=agency`
- Privacy / Feedback / Contact → `mailto:` links (subject prefilled where useful) so they work today without new pages

Removed lines:
- "Prototype mode: pattern-based recommendations. Real website analysis planned."
- "AI Opportunity Mapper — a diagnostic prototype."

## 2. Anchor + copy update in `src/routes/index.tsx`

- Add `id="how-it-works"` and `scroll-mt-20` to the existing How it works card so the footer link scrolls to it.
- Replace the second step's `desc`:
  - From: "The prototype maps URL patterns and selected priority to common business workflows."
  - To: "The system interprets website structure, business context, and customer workflow signals to identify likely operational opportunities."

No other section copy is changed in this pass.

## Out of scope

- No new routes (Privacy / Feedback / Contact remain mailto links for now). If you want dedicated pages later, that's a follow-up.
- No header changes.
