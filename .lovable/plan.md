## 1. Fix the "No QueryClient set" error on /admin

The router context is currently empty (`context: {}`) and `__root.tsx` never mounts a `QueryClientProvider`. Any route using `useQuery` (e.g. `/admin`, `/admin/feedback`) crashes.

Changes:
- `src/router.tsx`: create a fresh `QueryClient` per request inside `getRouter`, pass it as `context: { queryClient }`, and update the router type via `createRootRouteWithContext`.
- `src/routes/__root.tsx`: switch from `createRootRoute` to `createRootRouteWithContext<{ queryClient: QueryClient }>()`, and wrap the app shell in `<QueryClientProvider client={queryClient}>` (read `queryClient` via `Route.useRouteContext()`).

This is the canonical TanStack Start + Query setup and resolves the admin crash plus any future `useQuery` usage.

## 2. Gate analytics on cookie consent

Today there is no analytics tool wired up — the cookie banner stores a preference but nothing reads it. Add a small consent-aware analytics layer so events only fire when the user accepts.

New file `src/lib/analytics.ts`:
- `getConsent()` — reads `aiom.cookieConsent.v1` from `localStorage`, returns `{ analytics: boolean }` (SSR-safe; defaults to `false`).
- `setConsent(analytics: boolean)` — writes the same key and dispatches a `aiom:consent-changed` window event.
- `trackEvent(name, props?)` — no-op unless `analytics === true`. When enabled, sends a `navigator.sendBeacon` / `fetch` POST to a lightweight first-party endpoint (`/api/public/analytics`) with `{ name, props, path, ts }`. Also pushes to `window.dataLayer` if present so it's ready for any future GA/GTM hookup.
- `useAnalytics()` hook — subscribes to the consent event so components re-render when the user changes preferences.
- Auto page-view tracking: a `usePageviewTracking()` hook called once in `RootComponent` that listens to `useRouterState({ select: s => s.location.pathname })` and calls `trackEvent("pageview", { path })` on change — still gated by consent.

New server route `src/routes/api/public/analytics.ts`:
- `POST` handler that validates the payload with Zod and inserts into a new `analytics_events` table (id, name, props jsonb, path, created_at). RLS: insert allowed for anon, no select for anon; admins can select via `has_role`.
- Migration adds the table + policies.

Wire-up in `src/components/cookie-banner.tsx`:
- Replace the inline `savePrefs` write with `setConsent(...)` from `analytics.ts` (keeps the same storage key/shape) so toggling preferences immediately enables/disables tracking without a reload.

Wire-up in `src/routes/__root.tsx`:
- Call `usePageviewTracking()` inside `RootComponent`.

## 3. Notes / non-goals

- No third-party analytics SDK is added — we keep it first-party so nothing loads before consent. If you later want GA4/Plausible/PostHog, the `trackEvent` function is the single place to add the SDK call (still gated by `getConsent().analytics`).
- The existing localStorage key (`aiom.cookieConsent.v1`) and shape are preserved, so users who already chose preferences are unaffected.
