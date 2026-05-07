## Goal
Replace the "Create Implementation Brief" toast with an email capture dialog so interested users are added to a waitlist for when the feature launches.

## Approach
Use a modal dialog (existing `@/components/ui/dialog`) triggered by the CTA. Form has one field (email) + submit. On submit, store the lead and show a success state.

## Storage — recommend Lovable Cloud
Stand up a tiny `implementation_brief_waitlist` table:
- `id` uuid PK
- `email` text not null
- `source_url` text (the analyzed URL from results, if present)
- `top_opportunity` text (name of opportunity #1, for context on what they wanted briefed)
- `is_demo` boolean
- `created_at` timestamptz default now()
- unique index on `email` (case-insensitive) so duplicates don't pile up

RLS: enable. Policy: allow `INSERT` for `anon` + `authenticated` (public waitlist). No `SELECT` policy — only the project owner reads via the dashboard.

A server function `joinBriefWaitlist({ email, sourceUrl, topOpportunity, isDemo })` validates with zod and inserts (idempotent on email — `onConflict: 'email'` do nothing).

## Files

**New: `src/lib/brief-waitlist.functions.ts`**
- `createServerFn({ method: "POST" })` with zod input validator
- Inserts into `implementation_brief_waitlist`, swallows duplicate-key as success
- Returns `{ ok: true }`

**New: `src/components/implementation-brief-dialog.tsx`**
- Controlled `Dialog` with `DialogContent`, `DialogHeader` ("Get the Implementation Brief"), short blurb ("We're building this. Drop your email and we'll send it as soon as it's ready — no spam."), an `Input type="email"`, submit `Button`.
- Uses `useServerFn` + `useMutation` (TanStack Query is already in the project via TanStack Start).
- Success state: replaces form with a check + "You're on the list. We'll email you the moment briefs go live." and a Close button.
- Props: `open`, `onOpenChange`, `sourceUrl?`, `topOpportunity?`, `isDemo`.

**Edit: `src/components/next-step-cta.tsx`**
- Accept new props: `sourceUrl?: string`, `topOpportunity?: string`.
- Local `useState` for dialog open.
- Replace the `toast(...)` `onClick` with `setOpen(true)`.
- Render `<ImplementationBriefDialog ... />` at the bottom.
- Remove the `toast` import if no longer used.

**Edit: `src/routes/results.tsx`**
- Pass `sourceUrl` (the analyzed URL displayed in the header) and `topOpportunity` (name of opportunity rank 1) into `<NextStepCta />`.

## Out of scope
- No auth required to join the waitlist.
- No admin UI to view leads (owner reads in Cloud dashboard).
- No actual email sending yet — that's for when the feature ships.

## If you'd rather skip a database
Alternative: post to a simple webhook (e.g. a form service) instead of Cloud. Less ideal — leads end up outside your project. Recommend the Cloud route above.
