// Server-only helpers for Live Scan: Firecrawl content fetch + Lovable AI extraction.
import type {
  AnalysisResult,
  BusinessSnapshot,
  Opportunity,
  OpportunityCategory,
  Priority,
  QuickWin,
  ScoreLevel,
} from "./types";
import { CATEGORY_TO_ROADMAP } from "./roadmaps";
import { displayHost, normalizeUrl } from "./url";

const FIRECRAWL_API = "https://api.firecrawl.dev/v2";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

type PageCategory =
  | "home"
  | "services"
  | "products"
  | "pricing"
  | "about"
  | "portfolio"
  | "faq"
  | "booking"
  | "contact";

const PAGE_PATTERNS: Array<{ key: Exclude<PageCategory, "home">; rx: RegExp }> = [
  { key: "services", rx: /\/(services?|solutions|offerings|menu)(\/|$)/i },
  { key: "products", rx: /\/(products?|shop|store|collections?)(\/|$)/i },
  { key: "pricing", rx: /\/(pricing|plans|rates)(\/|$)/i },
  { key: "about", rx: /\/(about|company|team|story|who-we-are)(\/|$)/i },
  { key: "portfolio", rx: /\/(portfolio|work|projects|case-studies|gallery)(\/|$)/i },
  { key: "faq", rx: /\/(faqs?|help|support|knowledge|questions)(\/|$)/i },
  { key: "booking", rx: /\/(book(ing)?|appointments?|schedule|consult(ation)?|get-started)(\/|$)/i },
  { key: "contact", rx: /\/(contact|quote|inquiry|enquiry)(\/|$)/i },
];

const EXCLUDE_PATH_RX =
  /\/(cart|checkout|payment|billing|orders?|account|profile|login|signin|signup|register|auth|admin|dashboard|wp-admin|wp-login|my-account|customer|members?-only|private)(\/|$)/i;
const EXCLUDE_EXT_RX = /\.(pdf|zip|jpe?g|png|gif|webp|css|js)(\?|#|$)/i;

const MAP_LIMIT = 25;
const MAX_PAGES = 5;
const PER_PAGE_CHARS = 6000;
const TOTAL_CHARS_CAP = 30000;
const OVERALL_TIMEOUT_MS = 60_000;

export type LiveScanCode =
  | "firecrawl_unavailable"
  | "url_invalid"
  | "page_discovery_failed"
  | "page_scrape_failed"
  | "no_content"
  | "llm_unavailable"
  | "validation_failed"
  | "timeout"
  | "missing_secrets"
  | "unknown";

export interface LiveScanDiagnostics {
  normalizedUrl?: string;
  mapSucceeded: boolean;
  discoveredCount: number;
  selectedPages: string[];
  scrapedCount: number;
  totalChars: number;
  llmCallStarted: boolean;
  validationFailed: boolean;
  rawError?: string;
  step?: string;
}

export class LiveScanError extends Error {
  code: LiveScanCode;
  diagnostics: LiveScanDiagnostics;
  constructor(code: LiveScanCode, message: string, diagnostics: LiveScanDiagnostics) {
    super(message);
    this.code = code;
    this.diagnostics = diagnostics;
  }
}

function emptyDiag(): LiveScanDiagnostics {
  return {
    mapSucceeded: false,
    discoveredCount: 0,
    selectedPages: [],
    scrapedCount: 0,
    totalChars: 0,
    llmCallStarted: false,
    validationFailed: false,
  };
}

// Strip API keys/tokens from any string before sending to client/log.
function redact(msg: string): string {
  return msg
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]")
    .replace(/(api[_-]?key|authorization|token)[^,\s"']{0,4}[A-Za-z0-9._\-]{8,}/gi, "$1=[redacted]");
}

function getKeys(diag: LiveScanDiagnostics) {
  const lovable = process.env.LOVABLE_API_KEY;
  const firecrawl = process.env.FIRECRAWL_API_KEY;
  if (!lovable || !firecrawl) {
    throw new LiveScanError(
      "missing_secrets",
      "Live scan is not fully configured.",
      { ...diag, step: "config" },
    );
  }
  return { lovable, firecrawl };
}

async function firecrawlMap(url: string, diag: LiveScanDiagnostics): Promise<string[]> {
  const { firecrawl } = getKeys(diag);
  let res: Response;
  try {
    res = await fetch(`${FIRECRAWL_API}/map`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawl}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, limit: MAP_LIMIT, includeSubdomains: false }),
    });
  } catch (e) {
    throw new LiveScanError(
      "firecrawl_unavailable",
      `Firecrawl map network error: ${redact((e as Error).message)}`,
      { ...diag, step: "map" },
    );
  }
  if (!res.ok) {
    const text = redact((await res.text().catch(() => "")).slice(0, 300));
    const code: LiveScanCode = res.status >= 500 || res.status === 429 ? "firecrawl_unavailable" : "page_discovery_failed";
    throw new LiveScanError(code, `Firecrawl map ${res.status}: ${text}`, { ...diag, step: "map" });
  }
  const data = (await res.json().catch(() => ({}))) as {
    links?: Array<string | { url: string }>;
    data?: { links?: Array<string | { url: string }> };
  };
  const raw = data.links ?? data.data?.links ?? [];
  return raw
    .map((l) => (typeof l === "string" ? l : l?.url))
    .filter((u): u is string => typeof u === "string");
}

function pickPages(home: string, links: string[]): Array<{ url: string; category: PageCategory }> {
  const homeNorm = home.replace(/\/$/, "");
  let homeHost: string;
  try {
    homeHost = new URL(home).host;
  } catch {
    return [{ url: home, category: "home" }];
  }
  const seen = new Set<string>();
  const sameHost = links.filter((l) => {
    try {
      const u = new URL(l);
      if (u.host !== homeHost) return false;
      const path = u.pathname;
      if (EXCLUDE_PATH_RX.test(path)) return false;
      if (EXCLUDE_EXT_RX.test(path)) return false;
      const norm = `${u.origin}${path.replace(/\/$/, "")}`;
      if (norm === homeNorm || seen.has(norm)) return false;
      seen.add(norm);
      return true;
    } catch {
      return false;
    }
  });
  const picked: Array<{ url: string; category: PageCategory }> = [{ url: home, category: "home" }];
  for (const { key, rx } of PAGE_PATTERNS) {
    if (picked.length >= MAX_PAGES) break;
    const match = sameHost.find((l) => rx.test(l));
    if (match) picked.push({ url: match, category: key });
  }
  return picked.slice(0, MAX_PAGES);
}

async function firecrawlScrape(
  url: string,
  diag: LiveScanDiagnostics,
): Promise<{ url: string; markdown: string } | null> {
  const { firecrawl } = getKeys(diag);
  try {
    const res = await fetch(`${FIRECRAWL_API}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawl}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { markdown?: string; data?: { markdown?: string } };
    const md = data.markdown ?? data.data?.markdown ?? "";
    if (!md.trim()) return null;
    return { url, markdown: md.slice(0, PER_PAGE_CHARS) };
  } catch {
    return null;
  }
}

async function aiToolCall<T>(
  systemPrompt: string,
  userPrompt: string,
  toolName: string,
  parameters: Record<string, unknown>,
  diag: LiveScanDiagnostics,
): Promise<T> {
  const { lovable } = getKeys(diag);
  diag.llmCallStarted = true;
  const body = {
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: { name: toolName, description: "Return the structured result.", parameters },
      },
    ],
    tool_choice: { type: "function", function: { name: toolName } },
  };

  let res: Response;
  try {
    res = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${lovable}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new LiveScanError(
      "llm_unavailable",
      `AI gateway network error: ${redact((e as Error).message)}`,
      { ...diag, step: "llm" },
    );
  }

  if (!res.ok) {
    const text = redact((await res.text().catch(() => "")).slice(0, 300));
    throw new LiveScanError("llm_unavailable", `AI ${res.status}: ${text}`, { ...diag, step: "llm" });
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
  };
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    diag.validationFailed = true;
    throw new LiveScanError("validation_failed", "AI returned no tool call.", { ...diag, step: "llm_parse" });
  }
  try {
    return JSON.parse(args) as T;
  } catch {
    diag.validationFailed = true;
    throw new LiveScanError("validation_failed", "AI returned invalid JSON.", { ...diag, step: "llm_parse" });
  }
}

interface ExtractedSignals {
  businessType: string;
  services: string[];
  audience: string[];
  ctas: string[];
  contactFlows: string[];
  faqPatterns: string[];
  ecommerceSignals: string[];
  consultationSignals: string[];
  recurringServiceSignals: string[];
  workflowSignals: string[];
  sensitiveDomain: boolean;
  evidenceQuotes: string[];
}

const SIGNALS_SCHEMA = {
  type: "object",
  properties: {
    businessType: { type: "string" },
    services: { type: "array", items: { type: "string" } },
    audience: { type: "array", items: { type: "string" } },
    ctas: { type: "array", items: { type: "string" } },
    contactFlows: { type: "array", items: { type: "string" } },
    faqPatterns: { type: "array", items: { type: "string" } },
    ecommerceSignals: { type: "array", items: { type: "string" } },
    consultationSignals: { type: "array", items: { type: "string" } },
    recurringServiceSignals: { type: "array", items: { type: "string" } },
    workflowSignals: { type: "array", items: { type: "string" } },
    sensitiveDomain: { type: "boolean" },
    evidenceQuotes: {
      type: "array",
      items: { type: "string" },
      description: "Short verbatim snippets (max ~120 chars each) copied from the source markdown.",
    },
  },
  required: [
    "businessType",
    "services",
    "audience",
    "ctas",
    "contactFlows",
    "faqPatterns",
    "ecommerceSignals",
    "consultationSignals",
    "recurringServiceSignals",
    "workflowSignals",
    "sensitiveDomain",
    "evidenceQuotes",
  ],
} as const;

const CATEGORIES: OpportunityCategory[] = [
  "lead_intake",
  "customer_followup",
  "appointment_prep",
  "faq_support",
  "internal_admin",
  "reporting_kpi",
  "content_repurposing",
  "proposal_estimate",
  "order_management",
  "client_onboarding",
];

const SCORE_VALUES: ScoreLevel[] = ["Low", "Medium", "High"];

const OPPORTUNITY_PROPS = {
  category: { type: "string", enum: CATEGORIES },
  name: { type: "string" },
  description: { type: "string" },
  signal: { type: "string" },
  painPoint: { type: "string" },
  improvement: { type: "string" },
  firstStep: { type: "string" },
  whyItMatters: { type: "string" },
  impact: { type: "string", enum: SCORE_VALUES },
  effort: { type: "string", enum: SCORE_VALUES },
  confidence: { type: "string", enum: SCORE_VALUES },
  automationRisk: { type: "string", enum: SCORE_VALUES },
} as const;

const OPPORTUNITY_REQUIRED = [
  "category",
  "name",
  "description",
  "signal",
  "painPoint",
  "improvement",
  "firstStep",
  "whyItMatters",
  "impact",
  "effort",
  "confidence",
  "automationRisk",
];

const MAP_SCHEMA = {
  type: "object",
  properties: {
    snapshot: {
      type: "object",
      properties: {
        summary: { type: "string" },
        audience: { type: "array", items: { type: "string" } },
        signals: { type: "array", items: { type: "string" } },
        workflowAreas: { type: "array", items: { type: "string" } },
      },
      required: ["summary", "audience", "signals", "workflowAreas"],
    },
    opportunities: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "object", properties: OPPORTUNITY_PROPS, required: OPPORTUNITY_REQUIRED },
    },
    quickWins: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        properties: { title: { type: "string" }, action: { type: "string" } },
        required: ["title", "action"],
      },
    },
    safetyNote: { type: "string" },
  },
  required: ["snapshot", "opportunities", "quickWins"],
} as const;

interface RawOpportunity {
  category: string;
  name: string;
  description: string;
  signal: string;
  painPoint: string;
  improvement: string;
  firstStep: string;
  whyItMatters: string;
  impact: string;
  effort: string;
  confidence: string;
  automationRisk: string;
}

interface RawMap {
  snapshot: BusinessSnapshot;
  opportunities: RawOpportunity[];
  quickWins: QuickWin[];
  safetyNote?: string;
}

function normScore(s: string): ScoreLevel {
  return SCORE_VALUES.includes(s as ScoreLevel) ? (s as ScoreLevel) : "Medium";
}
function normCategory(c: string): OpportunityCategory {
  return CATEGORIES.includes(c as OpportunityCategory) ? (c as OpportunityCategory) : "internal_admin";
}

function verifyEvidence(quotes: string[], corpus: string): string[] {
  const norm = corpus.toLowerCase().replace(/\s+/g, " ");
  return quotes
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && q.length <= 200)
    .filter((q) => norm.includes(q.toLowerCase().replace(/\s+/g, " ").slice(0, 80)));
}

async function runLiveScanInner(
  rawUrl: string,
  priority: Priority,
  diag: LiveScanDiagnostics,
): Promise<AnalysisResult> {
  // Normalize URL
  let cleaned: string;
  try {
    cleaned = normalizeUrl(rawUrl);
    if (!cleaned || !/^([a-z0-9-]+\.)+[a-z]{2,}/i.test(cleaned)) {
      throw new Error("Invalid hostname");
    }
  } catch (e) {
    throw new LiveScanError("url_invalid", `URL normalization failed: ${(e as Error).message}`, {
      ...diag,
      step: "normalize",
    });
  }
  diag.normalizedUrl = cleaned;
  const home = `https://${cleaned}`;

  getKeys(diag);

  // 1. Map
  const links = await firecrawlMap(home, diag);
  diag.mapSucceeded = true;
  diag.discoveredCount = links.length;

  // 2. Pick pages
  const pages = pickPages(home, links);
  diag.selectedPages = pages.map((p) => p.url);
  if (pages.length === 0) {
    throw new LiveScanError("page_discovery_failed", "No pages discovered.", { ...diag, step: "pick" });
  }

  // 3. Scrape
  const scraped = (
    await Promise.all(
      pages.map(async (p) => {
        const r = await firecrawlScrape(p.url, diag);
        return r ? { ...r, category: p.category } : null;
      }),
    )
  ).filter((p): p is { url: string; markdown: string; category: PageCategory } => p !== null);
  diag.scrapedCount = scraped.length;

  if (scraped.length === 0) {
    throw new LiveScanError("page_scrape_failed", "Could not read any page content.", {
      ...diag,
      step: "scrape",
    });
  }

  // Build corpus
  let total = 0;
  const corpusParts: string[] = [];
  for (const p of scraped) {
    const remaining = TOTAL_CHARS_CAP - total;
    if (remaining <= 200) break;
    const slice = p.markdown.slice(0, remaining);
    corpusParts.push(`=== [${p.category}] ${p.url} ===\n${slice}`);
    total += slice.length;
  }
  const corpus = corpusParts.join("\n\n");
  diag.totalChars = total;

  if (total < 200) {
    throw new LiveScanError("no_content", "Scraped content was too short to analyze.", {
      ...diag,
      step: "corpus",
    });
  }

  // 4. Extract signals
  const signals = await aiToolCall<ExtractedSignals>(
    `You are an operations analyst. Extract concrete operational signals from the website content. Be conservative — do not invent signals that aren't supported by the text. Evidence quotes must be short verbatim snippets actually present in the content.

AUDIENCE INFERENCE: Always populate the "audience" array with 2-4 likely buyer/audience groups, even when the site does not explicitly state an audience. Infer cautiously from product types, services, pricing/positioning cues, tone, calls to action, customer-facing pages, and location signals. Consider whether offerings suggest consumers, businesses, consultants, agencies, collectors, gift buyers, clients, patients, members, students, or other buyer types. Phrase each entry as a likely audience (e.g. "Individual art buyers and collectors", "Gift shoppers"), not as confirmed fact. Never leave audience empty.`,
    `Website pages content:\n\n${corpus}`,
    "extract_signals",
    SIGNALS_SCHEMA,
    diag,
  );

  signals.evidenceQuotes = verifyEvidence(signals.evidenceQuotes ?? [], corpus).slice(0, 8);

  // 5. Generate opportunity map
  const mapPriority = priority === "not_sure" ? "no specific priority (balance broadly)" : priority;

  const systemPrompt = `You are a practical AI opportunity strategist for SMBs. Generate a grounded opportunity map from extracted website signals and a selected business priority.

LANGUAGE RULES:
- Use phrasings like "The site mentions…" or "The website includes…" ONLY when the recommendation is directly grounded in one of the provided evidenceQuotes.
- For inferred assumptions, use "likely" or "may".
- Stay calm and operational. Avoid hype, "premium", "transform", "AI-powered" marketing language.

SAFETY:
- If sensitiveDomain is true (health, financial, legal, customer-facing safety), every recommendation MUST be administrative/internal-only OR explicitly require staff review, approved templates, and human approval before anything is sent or acted on. Reflect this in firstStep and add a brief safetyNote.

STRUCTURE:
- Return exactly 3 opportunities using these category values: ${CATEGORIES.join(", ")}.
- Each opportunity has Impact, Effort, Confidence, Automation Risk scored as Low / Medium / High.
- Keep names short. Keep firstStep concrete and small.
- Return 3-5 quickWins (small, low-risk operational moves).
- snapshot.summary should be 1-2 sentences describing the business, using "likely" for inferences.
- snapshot.audience MUST contain 2-4 likely audience groups inferred from product/service signals, tone, CTAs, and positioning even if the site does not explicitly name an audience. Phrase entries cautiously (e.g. "Likely individual art buyers and collectors", "Gift shoppers", "Clients interested in custom commissions"). Append a final entry "Confidence: low" or "Confidence: medium" reflecting how strong the audience signals were. Never leave audience empty.`;

  const userPrompt = `Selected priority: ${mapPriority}

Extracted signals:
${JSON.stringify(signals, null, 2)}

Generate the opportunity map. When a recommendation paraphrases an evidence quote, you may use "The site mentions…"; otherwise use "likely" or "may".`;

  const map = await aiToolCall<RawMap>(systemPrompt, userPrompt, "opportunity_map", MAP_SCHEMA, diag);

  // 6. Validate / normalize
  if (
    !map.snapshot ||
    !Array.isArray(map.opportunities) ||
    map.opportunities.length < 1 ||
    !Array.isArray(map.quickWins) ||
    map.quickWins.length < 1
  ) {
    diag.validationFailed = true;
    throw new LiveScanError("validation_failed", "AI map missing required fields.", {
      ...diag,
      step: "validate",
    });
  }

  const opportunities: Opportunity[] = map.opportunities.slice(0, 3).map((o, i) => ({
    id: `${cleaned}-live-${i}`,
    category: normCategory(o.category),
    name: o.name,
    description: o.description,
    signal: o.signal,
    painPoint: o.painPoint,
    improvement: o.improvement,
    firstStep: o.firstStep,
    whyItMatters: o.whyItMatters,
    impact: normScore(o.impact),
    effort: normScore(o.effort),
    confidence: normScore(o.confidence),
    automationRisk: normScore(o.automationRisk),
  }));

  while (opportunities.length < 3) opportunities.push(opportunities[0]);

  const top = opportunities[0];

  return {
    url: cleaned,
    displayUrl: displayHost(cleaned),
    priority,
    isDemo: false,
    mode: "live",
    snapshot: map.snapshot,
    topOpportunity: top,
    opportunities,
    quickWins: map.quickWins.slice(0, 5),
    safetyNote:
      map.safetyNote ||
      (signals.sensitiveDomain
        ? "This appears to be a sensitive-domain workflow. Keep AI limited to administrative tasks, approved templates, and staff-reviewed communication. Human approval should precede anything customer-facing."
        : undefined),
    roadmapKey: CATEGORY_TO_ROADMAP[top.category],
    scannedPages: scraped.map((p) => p.url),
    pageCount: scraped.length,
    evidence: signals.evidenceQuotes,
  };
}

export async function runLiveScan(rawUrl: string, priority: Priority): Promise<AnalysisResult> {
  const diag = emptyDiag();
  try {
    return await Promise.race([
      runLiveScanInner(rawUrl, priority, diag),
      new Promise<AnalysisResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new LiveScanError("timeout", `Live scan timed out after ${OVERALL_TIMEOUT_MS}ms`, {
                ...diag,
                step: "timeout",
              }),
            ),
          OVERALL_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (e) {
    if (e instanceof LiveScanError) {
      e.diagnostics.rawError = redact(e.message);
      throw e;
    }
    const msg = redact((e as Error).message ?? String(e));
    throw new LiveScanError("unknown", msg, { ...diag, rawError: msg, step: "unknown" });
  }
}
