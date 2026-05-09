## Goal

Make the results page *feel* adaptive to whether a priority was selected, sharpen the AI/automation framing in opportunity language (without "Use AI to…" repetition), tie reasoning copy more visibly to inferred signals, and make locked roadmap cards feel intentionally interactive — while preserving the calm, grounded operational tone.

No layout changes. No new sections. No visual redesign. Copy + light logic only.

---

## 1. Priority-aware section framing (`src/routes/results.tsx`)

Today the "All opportunities" heading and subcopy are static. Make them adapt:

- **No priority (`not_sure`)**:
  - Heading: "Top inferred operational opportunities"
  - Sub: "Balanced across impact, effort, and implementation readiness — the most likely areas for operational leverage."
- **Priority selected**:
  - Heading: "Prioritized opportunities"
  - Sub: `Gently weighted toward your selected goal: ${PRIORITY_LABELS[priority]}. Ranked by inferred impact, effort, and implementation readiness.`

Apply the same adaptive treatment to the page-level intro chip area only via copy (no new UI):
- Keep the existing "Priority: …" chip when set.
- When `not_sure`, render a softer chip "Exploratory scan" instead of "Priority: Not sure".

Also rename the **TopOpportunityCard** badge label conditionally:
- No priority → "Top inferred opportunity"
- Priority set → "Top recommendation for your goal"

(Pass an optional `priorityLabel?: string` to `TopOpportunityCard`.)

---

## 2. Sharper AI/automation framing in opportunity templates (`src/lib/analyzer.ts`)

Rewrite the `description` and `improvement` strings in `TEMPLATES` so AI/automation leverage is explicit and operationally specific — but **vary the phrasing** instead of leading nearly every line with "Use AI to…". Keep `signal`, `painPoint`, `firstStep`, `whyItMatters` mostly intact — only edit where they read as generic productivity advice.

Phrasing patterns to rotate through (verb-led, operationally grounded):
- *Generate…*
- *Create structured…*
- *Convert…*
- *Draft…*
- *Surface…*
- *Route…*
- *Assemble…*
- *Adapt…*
- *Standardize…*

Examples of the tone shift (not exhaustive):

- **lead_intake.improvement**: "Create a structured intake that captures answers to 3–5 qualifying questions and generates a clean lead summary the team can act on — making downstream follow-up automation-ready."
- **customer_followup.description**: "Generate personalized follow-up drafts from existing conversation context, reviewed by a human before sending."
- **customer_followup.improvement**: "Draft tailored follow-up messages tied to the original conversation, ready for a quick human review."
- **faq_support.improvement**: "Stand up an internal AI-assisted answer layer grounded in your real responses — staff edit and send instead of rewriting from scratch."
- **proposal_estimate.improvement**: "Assemble a structured proposal draft from intake answers and approved past proposals, ready for senior review."
- **order_management.improvement**: "Route routine items automatically and surface only the requests that genuinely need a human."
- **reporting_kpi.improvement**: "Draft narrative explanation around your existing numbers, with humans owning the analytical judgment."
- **content_repurposing.improvement**: "Adapt one approved source into channel-specific drafts so distribution becomes a repeatable operational system."
- **internal_admin.improvement**: "Convert meeting recordings and notes into structured updates that flow into the tools the team already uses."
- **client_onboarding.improvement**: "Generate a tailored onboarding plan from a short kickoff form, so the first 14 days follow a repeatable system."
- **appointment_prep.improvement**: "Auto-generate a one-page brief from intake answers and prior notes — pre-meeting prep becomes structured and consistent."

Vocabulary cues to thread through: *AI-assisted*, *structured*, *repeatable operational system*, *automation-ready*, *human review*, *grounded in real answers*. Avoid: *transform your business*, *AI-powered revolution*, *seamless AI automation*, *agents*, *revolutionize*, and starting most lines with "Use AI to…".

Inference language stays grounded — keep `appears`, `likely`, `suggests` in `signal` strings. Audit and add hedging where any signal currently asserts a fact.

---

## 3. "Why we surfaced this" — priority-tied reasoning (`src/components/opportunity-card.tsx`)

Currently the expandable section lists signals plus a static "Weighted toward your priority: X" footer. Make the framing feel more adaptive but **probabilistic, not deterministic**:

- When priority is set, lead the section with one short reasoning line above the signals:
  - For top-ranked card: `"Ranked slightly higher because this likely affects ${priorityLabel.toLowerCase()}."`
  - For other cards: `"Surfaced partly because this connects to ${priorityLabel.toLowerCase()}-related workflow signals."`
- When `not_sure`: lead with `"Surfaced based on visible website patterns and the likely shape of this business's workflows."` and drop the "Weighted toward your priority" footer entirely.
- Keep the existing signals list and the trailing disclaimer ("Signals are inferred from publicly visible website patterns…") unchanged.

This requires passing `priority` (raw key) from `results.tsx` into `OpportunityCard`. The component owns the wording.

---

## 4. Personalized Quick Wins (`src/lib/analyzer.ts` + `src/components/quick-wins.tsx`)

Today wins are picked randomly from a pool. Make them feel connected to the surfaced top opportunity and the selected priority — without overclaiming personalization.

In `analyzer.ts`:

- Introduce a `QUICK_WINS_BY_CATEGORY: Partial<Record<OpportunityCategory, QuickWin[]>>` map (2–3 wins per category) so each top opportunity has at least one directly related win. Examples:
  - `lead_intake`: "Write your 'ideal lead' description", "List the 5 questions every new lead should answer"
  - `customer_followup`: "Draft 3 follow-up templates", "Pick one follow-up moment to standardize first"
  - `proposal_estimate`: "Find your 3 best past proposals", "List the sections every proposal repeats"
  - `faq_support`: "Capture your top 20 FAQs", "Tag the 5 questions that always need a human"
  - `reporting_kpi`: "Pick one report to standardize", "List which sections were truly bespoke last cycle"
  - `order_management`: "Define an order triage rule"
  - `client_onboarding`: "Define a kickoff form"
- Build the wins list as: 1 win tied to top opportunity's category + 1 win tied to second-ranked category + 1 win from the existing pool (fallback to existing pool when category-specific wins are exhausted). Deduplicate by title.
- Keep deterministic seeding so results are stable per `(url, priority)`.

In `quick-wins.tsx`:

- Subcopy adapts:
  - No priority: keep existing line.
  - Priority set: `"Small, low-risk moves to set up your highest-leverage opportunities, with a light bias toward ${priorityLabel.toLowerCase()}."`
- Pass `priorityLabel?: string` from `results.tsx`.

---

## 5. Snapshot signals — light hedging pass (`src/lib/analyzer.ts`)

Audit `ARCHETYPE_COPY[*].signals` and `ARCHETYPE_COPY[*].summary`: ensure every entry uses inference language (`Likely…`, `Appears to…`). Most already do — only edit ones that read as assertions (e.g. "Product catalog pages" → "Likely product catalog pages"). Minimal, surgical edits.

---

## 6. Soft priority weighting (`src/lib/analyzer.ts`)

Keep priority influence as a **soft ranking nudge**, not a hard filter:

- Reduce the `PRIORITY_BOOST` bonus from `+4` to `+2` in `rankScore` so high-impact, high-confidence opportunities outside the priority can still surface naturally when they're operationally stronger.
- Keep the `SENSITIVE_PRIORITIES` automation-risk penalty as-is — it's a safety adjustment, not a personalization weight.
- No changes to `selectTop3`'s category-diversity, content-cap, or low-effort guardrails.

This preserves the "adaptive but probabilistic" feel: priority tilts the ranking, it doesn't override the operational picture.

---

## 7. Interactive locked roadmap cards (`src/components/roadmap.tsx`)

Currently locked roadmap cards (Weeks 2–4) are static. Make them feel intentionally interactive without changing their appearance:

- Wrap the locked card body in an `<a href="#unlock-section">` (or a `button` that scrolls to `#unlock-section`) that covers the full card via `position: absolute inset-0` overlay or by making the whole `<li>` content a clickable anchor.
- Preserve current visuals exactly — no hover color shift, no border change, no new icons. Add only a subtle `cursor-pointer` and an accessible `aria-label` like "See complete 30-day roadmap".
- Keep the existing inline "See Complete Roadmap →" link on Week 2 (it now becomes redundant visually but acts as the visible affordance for users who don't realize the whole card is clickable). Optional: remove only the duplicate inline link if the whole-card click is in place — decide during implementation based on visual balance.
- No modal. No new section. The unlock CTA is reached via the same `#unlock-section` anchor used by opportunity cards.

---

## Out of scope

- No changes to scoring math beyond the single `+4 → +2` boost adjustment.
- No new components, no new routes, no design-token changes.
- No changes to the gating model, unlock section copy, or roadmap visual structure.
- No changes to demos in `src/lib/demos.ts` unless their copy collides with renamed labels (verify and only touch if needed).

---

## Files to change

- `src/routes/results.tsx` — adaptive headings/subcopy, pass priority/priorityLabel to children, exploratory chip when `not_sure`.
- `src/components/top-opportunity-card.tsx` — accept `priorityLabel?`, swap badge label.
- `src/components/opportunity-card.tsx` — accept `priority`, render priority-tied reasoning line, drop static footer when `not_sure`.
- `src/components/quick-wins.tsx` — accept `priorityLabel?`, adaptive subcopy.
- `src/components/roadmap.tsx` — make locked cards clickable to `#unlock-section`.
- `src/lib/analyzer.ts` — varied AI/automation phrasing in templates, per-category quick-win map + new selection logic, light hedging pass, soften `PRIORITY_BOOST` from `+4` to `+2`.

## Verification

- Run a demo (`/results?demo=clinic`, `/results?demo=agency`) and a real URL with each priority + `not_sure`; confirm headings, badges, reasoning lines, and quick-wins all change appropriately.
- Confirm locked roadmap cards scroll to the unlock section on click (mobile and desktop), and visuals are unchanged.
- Confirm no layout shifts on mobile (411px viewport) — copy edits only.
- Confirm deterministic output is preserved (same URL+priority → same wins).
- Spot-check `TEMPLATES`: no more than ~1 line begins with "Use AI to…".
