## Goal

Make `/results` feel calm and scannable at 391px wide. Cut vertical scroll, fix awkward wrapping, and make tap targets comfortable — without changing the desktop look.

## Changes

### 1. Page shell (`src/routes/results.tsx`)
- Reduce outer vertical rhythm on mobile: `py-8 sm:py-12 space-y-8` → `py-5 sm:py-12 space-y-5 sm:space-y-8`.
- Header strip: shrink the URL line so long domains don't overflow (`text-base sm:text-lg`, allow truncation), and drop the redundant "Opportunity map" eyebrow on mobile (`hidden sm:block`).
- Move "Start over" into a compact icon-only button on mobile (full button at `sm`+).
- Wrap the priority/demo pills so they stack cleanly under the URL instead of pushing it.

### 2. Snapshot card (`src/components/snapshot-card.tsx`)
- Mobile padding `p-4 sm:p-8`, internal grid gap `gap-4 sm:gap-6`.
- Wrap "Likely audience" + "Inferred business signals" + "Main inferred workflow areas" in a collapsible: summary shows the inferred summary paragraph + a "View details" toggle; lists open below. Stays expanded on `sm`+.

### 3. Top opportunity card (`src/components/top-opportunity-card.tsx`)
- Reduce padding: `p-4 sm:p-8 pl-5 sm:pl-9`.
- Headline: `text-xl sm:text-3xl` (currently `text-2xl` is heavy at 391px).
- Inner 2-col block grid: switch from `gap-5` to `gap-4 sm:gap-5` and force single column on mobile so labels don't get clipped.
- "Recommended first step" callout: `p-3 sm:p-4`.

### 4. Opportunity cards (`src/components/opportunity-card.tsx`)
- Card padding: `p-4 sm:p-6`.
- Score chip grid stays 2-col, but reduce gap to `gap-1.5 sm:gap-2` so chips don't squish their values onto a second line at 391px.
- Hide the inline Confidence/Automation-Risk explanation block on mobile (`hidden sm:block`) — the chips already have ⓘ tooltips. Saves ~70px per card × 3 cards.
- "First step" panel: `p-2.5 sm:p-3`.

### 5. Quick wins (`src/components/quick-wins.tsx`)
- Tighter card padding `p-3 sm:p-4`, gap `gap-2 sm:gap-3`.
- Title row: keep single-column on mobile (already does) but make whole card a `min-h` consistent block so the ragged right edge calms down.

### 6. Roadmap (`src/components/roadmap.tsx`)
- On mobile, render as a horizontal snap carousel instead of stacking 4 full-height cards (saves ~600px of scroll). Use `flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-3 md:grid md:grid-cols-4 md:mx-0 md:px-0`. Each week card gets `min-w-[78%] snap-start md:min-w-0`.
- Card padding `p-4 sm:p-5`.

### 7. Next-step CTA (`src/components/next-step-cta.tsx`)
- Padding `p-4 sm:p-8`.
- Buttons: `size="default"` on mobile, `size="lg"` on `sm`+; stack full-width on mobile (`w-full sm:w-auto`) so they're easy to tap and don't wrap their labels.
- Headline `text-lg sm:text-2xl`.

### 8. Score chip (`src/components/score-chip.tsx`)
- Bump the ⓘ tooltip trigger to a real 24×24 hit area (`p-1 -m-1`) without changing visual size — current 12px target is below the 24px mobile-tap minimum.

## Out of scope

- Heatmap component (already mobile-tuned in the prior turns).
- Landing page, analyzing screen, header/footer.
- Color/typography token changes.

## Technical notes

- All changes are Tailwind class edits in 7 files; no new dependencies, no logic changes.
- Roadmap carousel uses native CSS scroll-snap; no JS, no new component.
- Collapsible in snapshot card uses native `<details>` (matches the pattern already used in the heatmap on mobile).
- Verify at 391×844 (current preview) and confirm desktop (≥640px) is visually unchanged.
