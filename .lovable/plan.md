## Goal

Every time someone submits the "Notify me when available" form, add their email to a Resend Audience so you can broadcast to the list later from Resend. Keep the existing database save as a backup record.

## How it will work

1. You'll connect Resend (one-click via the Connectors picker) and pick which Audience new signups should land in.
2. The signup form's existing server function will:
   - Save the lead to the database (unchanged).
   - Also call Resend's Audiences API to add the contact (email + a couple of metadata fields).
3. If Resend is unreachable or the contact already exists, the signup still succeeds — the user never sees a Resend error.

## What you need to do once

- Approve the Resend connection prompt and paste your Resend API key (from resend.com → API Keys).
- Tell me the Audience ID you want signups added to (Resend → Audiences → click the audience → copy the ID from the URL). If you don't have one yet, create it in Resend first.

## Technical details

- Add Resend via `standard_connectors--connect` so `RESEND_API_KEY` and `LOVABLE_API_KEY` are available server-side.
- Store the chosen Audience ID as a runtime secret (`RESEND_AUDIENCE_ID`) so it's easy to change without a code edit.
- Extend `src/lib/brief-waitlist.functions.ts` (`joinBriefWaitlist`):
  - After the Supabase insert succeeds (or hits the existing 23505 duplicate path), `POST` to `https://connector-gateway.lovable.dev/resend/audiences/{audienceId}/contacts` with `{ email, unsubscribed: false }`.
  - Wrap the Resend call in try/catch. Log failures via `console.error` but do not throw — the user-facing success state must not depend on Resend.
  - Treat Resend "already exists" responses as success.
- No frontend changes; the existing success UI and analytics events stay as-is.

## Out of scope

- Confirmation email to signups (you opted out).
- Building an in-app broadcast tool (you'll send from Resend directly).
- Backfilling existing rows in `implementation_brief_waitlist` into the Audience — can be added later as a one-off script if you want.
