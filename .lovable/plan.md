# Live Scan Beta — Final Plan (approved direction)

Server-side via TanStack `createServerFn`. Firecrawl (linked) for content; Lovable AI Gateway for extraction & opportunity generation. Demo and prototype modes preserved as-is. Falls back to prototype on any failure.

## New / changed files

- **New** `src/lib/live-scan.server.ts` — Firecrawl + AI helpers (server-only).
- **New** `src/lib/live-scan.functions.ts` — `liveScan` server function (thin wrapper).
- **Edit** `src/lib/types.ts` — add `mode: "demo" | "prototype" | "live"` and optional `scannedPages?: string[]`, `evidence?: string[]` on `AnalysisResult`.
- **Edit** `src/lib/analyzer.ts` — set `mode: "prototype"` on returned results.
- **Edit** `src/lib/demos.ts` — set `mode: "demo"` on demo results (kept as fallback for live failures? No — demos stay demo only).
- **Edit** `src/components/url-input-card.tsx` — add subtle "Live scan (beta)" toggle (default ON), persisted to `localStorage`. Pass `live=1` in the search param.
- **Edit** `src/routes/analyzing.tsx` — when `live=1`, call `liveScan` via `useServerFn`; show adaptive checklist; on success store result in `sessionStorage` (key: `live:${url}:${priority}`) and navigate to `/results?url=...&priority=...&live=1`. On failure, toast the friendly message and offer "Run prototype instead" (re-routes without `live`).
- **Edit** `src/routes/results.tsx` — when `live=1`, hydrate from `sessionStorage`; if missing, fall back to prototype analyzer + show notice. Render mode badge (`Demo result` / `Prototype result` / `Live scan beta`) and, for live, a subtle `Pages scanned: N` line under the header.

No new dependencies (use `fetch`). No DB, no auth, no PDF, no payments, no brief generation.

## Server function: `liveScan(url, priority)`

1. **Validate** with Zod; normalize URL.
2. **Discover** candidate pages via Firecrawl `map` (gateway-proxied, limit 25). Pick up to 5 by regex: home, about, services|products|pricing, faq|help|support, contact|book|booking|quote|inquiry. Always include homepage.
3. **Scrape** each page via Firecrawl `scrape` (`formats: ['markdown']`, `onlyMainContent: true`). Truncate each markdown to ~6k chars; total cap ~30k.
4. **Extract signals** — Lovable AI call (`google/gemini-2.5-flash`) using **tool calling** for strict JSON. Schema fields: `businessType`, `services[]`, `audience[]`, `ctas[]`, `contactFlows[]`, `faqPatterns[]`, `ecommerceSignals[]`, `consultationSignals[]`, `recurringServiceSignals[]`, `workflowSignals[]`, `sensitiveDomain` (bool), `evidenceQuotes[]` (≤120 chars each, must be substrings of the source markdown — verify server-side, drop any that aren't).
5. **Generate opportunity map** — second AI call (tool-calling) returns `AnalysisResult`-shaped JSON: snapshot, topOpportunity, opportunities[3] using existing `OpportunityCategory` values (so `roadmaps.ts` mapping still works), quickWins[3–5], roadmapKey, optional `safetyNote`. System-prompt rules:
   - Use "The site mentions…" / "The website includes…" **only** when the recommendation is grounded in an `evidenceQuotes` item; otherwise use "likely" / "may".
   - For `sensitiveDomain` (health, financial, legal, customer-facing safety) recommendations must be **administrative/internal-only** or include explicit human review / approved templates / approval-before-send in `firstStep`.
   - Score each on Impact / Effort / Confidence / Automation Risk (`Low|Medium|High`).
6. **Validate** AI output with Zod against `AnalysisResult` shape. On any error in steps 2–6 → throw typed error with stable `code` (`firecrawl_failed` | `ai_failed` | `parse_failed` | `no_pages`).
7. **Return** `{ ...result, mode: "live", scannedPages, evidence }`.

Secrets used (server-only): `LOVABLE_API_KEY` (already present), `FIRECRAWL_API_KEY` (just linked). Throw clear errors if missing.

Firecrawl call pattern (gateway-proxied):
```
POST https://connector-gateway.lovable.dev/firecrawl/v2/scrape
Authorization: Bearer ${LOVABLE_API_KEY}
X-Connection-Api-Key: ${FIRECRAWL_API_KEY}
```

## Frontend behavior

- **URL card**: small "Live scan (beta)" toggle next to the submit button; tooltip explains what it does. Persists in `localStorage`.
- **Analyzing screen** (live mode): adaptive checklist labels — "Mapping site pages…", "Reading homepage, services & FAQ…", "Extracting operational signals…", "Generating opportunity map…". On error, show inline message + "Run prototype instead" button (navigates to `/analyzing?...&` without `live`).
- **Results header**: subtle mode badge replaces existing `Demo result` chip — one of `Demo result`, `Prototype result`, `Live scan beta`. For `live`, also render `Pages scanned: N` muted line.
- **Tone**: keep existing calm/operational language; no flashy "AI" branding.

## Out of scope (confirmed)

Auth, DB storage of scans, PDF, payments, full implementation brief, full-site crawl.
