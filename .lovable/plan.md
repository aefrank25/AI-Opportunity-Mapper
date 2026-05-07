# Refine free vs paid experience on /results

Goal: keep the results page feeling polished and genuinely useful for free users, while creating a clear pull toward a paid/full version through soft gating on opportunities 2+ and the later weeks of the roadmap. No popups, no big blurs, no hype copy.

## What stays fully free (unchanged)

- Header strip, safety note, snapshot card
- `TopOpportunityCard` (the "Start Here" recommendation)
- `OpportunityHeatmap` (full)
- "All opportunities" section heading + intro
- `Opportunity 1` card — fully expanded, all sections visible (proof of intelligence)
- `QuickWins` section
- Roadmap title, structure, and **all 4 weeks visible** with Week 1 fully expanded
- Total opportunity count and strategic framing
- Existing `FeedbackWidget`

## What changes

### 1. `OpportunityCard` — soft gating for index ≥ 1

Add a `locked?: boolean` prop. When true, the card still shows:
- Opportunity number + title
- Short description (1 line)
- The 4 priority chips (Impact / Effort / Confidence / Automation Risk)
- A 1-sentence summary line (reuse `o.painPoint` truncated, or `o.improvement`)

Then, in place of the Signal/Pain point/Improvement rows, the expandable "Why we surfaced this" panel, and the "First step" block, render a calm locked section:

```text
┌──────────────────────────────────────────┐
│ 🔒 Full operational analysis             │
│ 🔒 Prioritization reasoning              │
│ 🔒 Recommended implementation path       │
└──────────────────────────────────────────┘
```

Styling: a subtle `border-dashed` block on `bg-surface-muted/40` with small lock icons (`Lock` from lucide-react), muted text, no CTA inside the card itself. Above the locked block, add a short fade (`bg-gradient-to-b from-transparent to-card`, ~40px) so the truncation feels natural, not abrupt. No full-card blur.

`results.tsx` passes `locked={i > 0}` when mapping opportunities.

### 2. `Roadmap` — keep all weeks, gate weeks 2–4

Update `Roadmap` to render Week 1 unchanged (full title + desc), and Weeks 2–4 with:
- Week number + week label (visible)
- Title (visible)
- One short preview line (truncated `desc`, e.g. first ~70 chars + "…")
- A small locked footer row inside the card: muted "🔒 Full implementation steps"

Keep the 4-column grid so the structure still reads as a real 30-day plan. No blur — just truncation and the small lock row.

### 3. New `UnlockSection` component (inline conversion point)

A new component `src/components/unlock-section.tsx`, rendered in `results.tsx` **between `Roadmap` and `NextStepCta`** (i.e. after the user has already seen value + the roadmap preview). Calm, product-styled card consistent with existing `bg-card` + `border-border` + `shadow-card` patterns (NOT the bold primary color used by `NextStepCta`).

Layout:

```text
┌────────────────────────────────────────────────────────┐
│  Unlock the Full Opportunity Map                       │
│  See all identified operational opportunities,         │
│  implementation priorities, expanded workflow          │
│  analysis, and strategic recommendations.              │
│                                                        │
│  What you'll unlock                                    │
│   • All identified operational opportunities           │
│   • Full prioritization roadmap                        │
│   • Expanded workflow signal analysis                  │
│   • Detailed operational reasoning                     │
│   • Exportable PDF report                              │
│   • Complete 30-day implementation roadmap             │
│                                                        │
│  [ email@company.com           ] [ Unlock Full         │
│                                    Opportunity Map ]   │
│  We'll notify you when expanded analysis access is     │
│  available.                                            │
└────────────────────────────────────────────────────────┘
```

Copy specifics (calm, productized tone):
- CTA button label: **"Unlock Full Opportunity Map"**
- Helper text under the form: **"We'll notify you when expanded analysis access is available."**
- Success state copy: **"You're on the list — we'll reach out when expanded analysis access is available."**
- No phrases like "No spam", "Get Full Analysis", "Notify me", or newsletter-style language.

Behavior:
- Email field + submit button reuses `joinBriefWaitlist` (same backend the implementation-brief dialog already uses), passing `sourceUrl`, `topOpportunity`, and `isDemo` props from `results.tsx`.
- Success state replaces the form with the calm confirmation above — no modal, no redirect.
- Validation + error messaging mirrors the dialog's existing pattern.

### 4. `NextStepCta` — light copy adjustment

Keep the existing primary-colored CTA but soften the framing so it doesn't compete with the new `UnlockSection`. Change heading to something like "Want this turned into a working prototype?" and keep the "Create Implementation Brief" button. This keeps the existing brief flow intact while the new section handles broader email capture.

## File changes

```text
src/components/opportunity-card.tsx   # add `locked` prop + locked-state render
src/components/roadmap.tsx            # render Week 1 full, weeks 2-4 truncated + locked row
src/components/unlock-section.tsx     # NEW: inline conversion card with email capture
src/components/next-step-cta.tsx      # minor copy refinement
src/routes/results.tsx                # pass locked prop, insert <UnlockSection/> after <Roadmap/>
```

No new dependencies. No backend changes — reuse `joinBriefWaitlist`.

## Visual / UX guardrails

- No full-card blur, no overlay modals, no urgency copy ("Limited time", "Only X left").
- Lock icons used sparingly — one row per locked block, not per bullet.
- Spacing, radius, and shadow tokens match existing cards (`rounded-2xl`, `shadow-card`, `border-border`, `bg-surface-muted` for muted blocks).
- Locked text uses `text-muted-foreground` at the same size as existing meta text — calm, not loud.
- Conversion section is visually quieter than the existing primary-colored `NextStepCta` so the page still ends on a confident product note rather than an upsell.
