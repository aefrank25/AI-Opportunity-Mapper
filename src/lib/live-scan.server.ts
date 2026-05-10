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

const GATEWAY = "https://connector-gateway.lovable.dev";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

// Live Scan beta deliberately limits Firecrawl to a small, fixed set of
// high-signal page types. We never crawl the full site.
type PageCategory = "home" | "about" | "services" | "faq" | "contact";

const PAGE_PATTERNS: Array<{ key: Exclude<PageCategory, "home">; rx: RegExp }> = [
  { key: "about", rx: /\/(about|company|team|story|who-we-are)(\/|$)/i },
  { key: "services", rx: /\/(services?|products?|pricing|plans|solutions|offerings|menu|shop)(\/|$)/i },
  { key: "faq", rx: /\/(faqs?|help|support|knowledge|questions)(\/|$)/i },
  { key: "contact", rx: /\/(contact|book(ing)?|appointments?|quote|inquiry|enquiry|consult(ation)?|get-started|schedule)(\/|$)/i },
];

// Hard caps — enforced before any AI generation runs.
const MAP_LIMIT = 25;          // max links Firecrawl map may return
const MAX_PAGES = 5;           // max pages we scrape (home + up to 4 categories)
const PER_PAGE_CHARS = 6000;   // max chars retained per scraped page
const TOTAL_CHARS_CAP = 30000; // max total chars passed to the AI extractor

export class LiveScanError extends Error {
  code: "firecrawl_failed" | "ai_failed" | "parse_failed" | "no_pages" | "missing_secrets";
  constructor(code: LiveScanError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function getKeys() {
  const lovable = process.env.LOVABLE_API_KEY;
  const firecrawl = process.env.FIRECRAWL_API_KEY;
  if (!lovable || !firecrawl) {
    throw new LiveScanError(
      "missing_secrets",
      "Live scan is not fully configured. Please try again or run prototype mode.",
    );
  }
  return { lovable, firecrawl };
}

async function firecrawlMap(url: string): Promise<string[]> {
  const { lovable, firecrawl } = getKeys();
  try {
    const res = await fetch(`${GATEWAY}/firecrawl/v2/map`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovable}`,
        "X-Connection-Api-Key": firecrawl,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, limit: 25, includeSubdomains: false }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new LiveScanError("firecrawl_failed", `Map failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as { links?: Array<string | { url: string }>; data?: { links?: string[] } };
    const raw = data.links ?? data.data?.links ?? [];
    return raw
      .map((l) => (typeof l === "string" ? l : l?.url))
      .filter((u): u is string => typeof u === "string");
  } catch (e) {
    if (e instanceof LiveScanError) throw e;
    throw new LiveScanError("firecrawl_failed", `Map error: ${(e as Error).message}`);
  }
}

function pickPages(home: string, links: string[]): string[] {
  const picked: string[] = [home];
  const seenKeys = new Set<string>();
  const homeNorm = home.replace(/\/$/, "");

  for (const { key, rx } of PAGE_PATTERNS) {
    if (seenKeys.has(key)) continue;
    const match = links.find((l) => rx.test(l) && l.replace(/\/$/, "") !== homeNorm);
    if (match && !picked.includes(match)) {
      picked.push(match);
      seenKeys.add(key);
    }
    if (picked.length >= MAX_PAGES) break;
  }
  return picked.slice(0, MAX_PAGES);
}

async function firecrawlScrape(url: string): Promise<{ url: string; markdown: string } | null> {
  const { lovable, firecrawl } = getKeys();
  try {
    const res = await fetch(`${GATEWAY}/firecrawl/v2/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovable}`,
        "X-Connection-Api-Key": firecrawl,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      markdown?: string;
      data?: { markdown?: string };
    };
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
): Promise<T> {
  const { lovable } = getKeys();
  const body = {
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: toolName,
          description: "Return the structured result.",
          parameters,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: toolName } },
  };

  let res: Response;
  try {
    res = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovable}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new LiveScanError("ai_failed", `AI request failed: ${(e as Error).message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new LiveScanError("ai_failed", `AI ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        tool_calls?: Array<{ function?: { arguments?: string } }>;
      };
    }>;
  };
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new LiveScanError("parse_failed", "AI returned no tool call.");
  try {
    return JSON.parse(args) as T;
  } catch {
    throw new LiveScanError("parse_failed", "AI returned invalid JSON.");
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
      items: {
        type: "object",
        properties: OPPORTUNITY_PROPS,
        required: OPPORTUNITY_REQUIRED,
      },
    },
    quickWins: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          action: { type: "string" },
        },
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
  return CATEGORIES.includes(c as OpportunityCategory)
    ? (c as OpportunityCategory)
    : "internal_admin";
}

function verifyEvidence(quotes: string[], corpus: string): string[] {
  const norm = corpus.toLowerCase().replace(/\s+/g, " ");
  return quotes
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && q.length <= 200)
    .filter((q) => norm.includes(q.toLowerCase().replace(/\s+/g, " ").slice(0, 80)));
}

export async function runLiveScan(
  rawUrl: string,
  priority: Priority,
): Promise<AnalysisResult> {
  getKeys(); // throws missing_secrets early

  const cleaned = normalizeUrl(rawUrl);
  const home = `https://${cleaned}`;

  // 1. Map
  let links: string[] = [];
  try {
    links = await firecrawlMap(home);
  } catch (e) {
    if (e instanceof LiveScanError) throw e;
    throw new LiveScanError("firecrawl_failed", (e as Error).message);
  }

  // 2. Pick pages
  const pages = pickPages(home, links);
  if (pages.length === 0) throw new LiveScanError("no_pages", "No pages discovered.");

  // 3. Scrape (parallel)
  const scraped = (await Promise.all(pages.map(firecrawlScrape))).filter(
    (p): p is { url: string; markdown: string } => p !== null,
  );
  if (scraped.length === 0) {
    throw new LiveScanError("firecrawl_failed", "Could not read any page content.");
  }

  // Build corpus with cap
  let total = 0;
  const corpusParts: string[] = [];
  for (const p of scraped) {
    const remaining = TOTAL_CHARS_CAP - total;
    if (remaining <= 200) break;
    const slice = p.markdown.slice(0, remaining);
    corpusParts.push(`=== ${p.url} ===\n${slice}`);
    total += slice.length;
  }
  const corpus = corpusParts.join("\n\n");

  // 4. Extract signals
  const signals = await aiToolCall<ExtractedSignals>(
    "You are an operations analyst. Extract concrete operational signals from the website content. Be conservative — do not invent signals that aren't supported by the text. Evidence quotes must be short verbatim snippets actually present in the content.",
    `Website pages content:\n\n${corpus}`,
    "extract_signals",
    SIGNALS_SCHEMA,
  );

  signals.evidenceQuotes = verifyEvidence(signals.evidenceQuotes ?? [], corpus).slice(0, 8);

  // 5. Generate opportunity map
  const mapPriority =
    priority === "not_sure" ? "no specific priority (balance broadly)" : priority;

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
- snapshot.summary should be 1-2 sentences describing the business, using "likely" for inferences.`;

  const userPrompt = `Selected priority: ${mapPriority}

Extracted signals:
${JSON.stringify(signals, null, 2)}

Generate the opportunity map. When a recommendation paraphrases an evidence quote, you may use "The site mentions…"; otherwise use "likely" or "may".`;

  const map = await aiToolCall<RawMap>(systemPrompt, userPrompt, "opportunity_map", MAP_SCHEMA);

  // 6. Validate / normalize
  if (
    !map.snapshot ||
    !Array.isArray(map.opportunities) ||
    map.opportunities.length < 1 ||
    !Array.isArray(map.quickWins) ||
    map.quickWins.length < 1
  ) {
    throw new LiveScanError("parse_failed", "AI map missing required fields.");
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

  // Pad to 3 if AI returned fewer (defensive)
  while (opportunities.length < 3) {
    opportunities.push(opportunities[0]);
  }

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
    safetyNote: map.safetyNote || (signals.sensitiveDomain
      ? "This appears to be a sensitive-domain workflow. Keep AI limited to administrative tasks, approved templates, and staff-reviewed communication. Human approval should precede anything customer-facing."
      : undefined),
    roadmapKey: CATEGORY_TO_ROADMAP[top.category],
    scannedPages: scraped.map((p) => p.url),
    evidence: signals.evidenceQuotes,
  };
}
