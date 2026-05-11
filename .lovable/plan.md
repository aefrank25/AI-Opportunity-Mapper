## Problem

The Live Scan calls `https://connector-gateway.lovable.dev/firecrawl/v2/map`, but Firecrawl in Lovable is a **direct-API connector**, not a gateway-routed one. The gateway has no `firecrawl` route, so it returns `connector_not_found` (HTTP 404). Connection status check confirms:

- Firecrawl connection **is linked** to this project (`AI Opportunity Mapper`, connector_id `firecrawl`)
- `uses connector gateway: false` → must call Firecrawl's API directly

So nothing needs to be reconnected on the user side — only the server code is wrong.

## Fix

Update `src/lib/live-scan.server.ts` to call Firecrawl's public API directly:

1. **Remove gateway plumbing**
   - Delete the `GATEWAY` constant.
   - Drop `LOVABLE_API_KEY` and `X-Connection-Api-Key` from Firecrawl requests.
   - `getKeys()` only needs `FIRECRAWL_API_KEY` (still need `LOVABLE_API_KEY` separately for the AI Gateway call — keep that one).

2. **Switch endpoints to Firecrawl v2**
   - Map: `POST https://api.firecrawl.dev/v2/map`
   - Scrape: `POST https://api.firecrawl.dev/v2/scrape`
   - Header: `Authorization: Bearer ${FIRECRAWL_API_KEY}` + `Content-Type: application/json`
   - Bodies stay the same shape (`{ url, limit, includeSubdomains }` for map; `{ url, formats: ["markdown"], onlyMainContent: true }` for scrape).

3. **Keep response parsing tolerant**
   - v2 map returns `{ success, links: [...] }` (array of strings or `{url}` objects) — existing normalization already handles both.
   - v2 scrape returns `{ success, data: { markdown, metadata, ... } }` — existing fallback `data.markdown ?? data.data?.markdown` already handles it.

4. **Preserve everything else**
   - Page-discovery caps (MAX_PAGES=5, PER_PAGE_CHARS, etc.), classification, diagnostics, redaction, timeout, AI Gateway call (which still legitimately uses `connector-gateway`-style auth via `ai.gateway.lovable.dev` + `LOVABLE_API_KEY`) — all unchanged.
   - `LiveScanError` codes unchanged. `firecrawl_unavailable` vs `page_discovery_failed` mapping (5xx/429 vs 4xx) stays.

5. **Update one test expectation**
   - `src/lib/live-scan.server.test.ts` mocks fetch by URL substring. Change the mock matcher from `connector-gateway.lovable.dev/firecrawl/v2/map` and `/scrape` to `api.firecrawl.dev/v2/map` and `api.firecrawl.dev/v2/scrape`. AI Gateway mock (`ai.gateway.lovable.dev`) is unchanged.

## Verification

- Re-run `bunx vitest run src/lib/live-scan.server.test.ts` — all 8 failure-code tests should still pass after the URL update.
- Trigger Live Scan from the UI on `www.liminal-layers.com` with priority `more_leads`. Expected: server log shows successful map + scrape, results render. If Firecrawl credits are exhausted it would now return 402 (handled as `firecrawl_unavailable`) instead of the gateway 404.

## No user action needed

The Firecrawl connection is already linked and valid. This is purely a code fix.
