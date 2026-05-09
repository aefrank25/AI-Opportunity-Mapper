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

// --- Deterministic seeded RNG ----------------------------------------------
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Business archetypes ---------------------------------------------------
type Archetype =
  | "clinic"
  | "agency"
  | "shop"
  | "law"
  | "consult"
  | "studio"
  | "coach"
  | "realestate"
  | "restaurant"
  | "professional";

const ARCHETYPE_KEYWORDS: Array<[Archetype, RegExp]> = [
  ["clinic", /(clinic|dental|dentist|orthodont|health|medical|medspa|med-spa|wellness|therapy|chiro|vet|derma|aesthetic|spa)/i],
  ["law", /(law|legal|attorney|advocate|counsel|solicitor|barrister)/i],
  ["agency", /(agency|marketing|seo|growth|brand|creative|digital|ads|advertis)/i],
  ["shop", /(shop|store|boutique|goods|market|outfitters|apparel|wear|cosmetic|beauty|jewelr|gifts)/i],
  ["consult", /(consult|advisor|advisory|strategy|partners|capital)/i],
  ["studio", /(studio|design|architects|interiors|photo|film)/i],
  ["coach", /(coach|coaching|mentor|fitness|trainer|academy|courses|learn|edu|tutor)/i],
  ["realestate", /(realty|realestate|real-estate|homes|properties|estate|broker)/i],
  ["restaurant", /(restaurant|bistro|cafe|kitchen|eatery|pizzeria|bakery|hotel|hospitality|inn|resort)/i],
];

function classify(url: string): Archetype {
  const host = displayHost(url);
  for (const [arch, rx] of ARCHETYPE_KEYWORDS) if (rx.test(host)) return arch;
  return "professional";
}

const ARCHETYPE_COPY: Record<
  Archetype,
  { summary: string; audience: string[]; signals: string[]; workflows: string[] }
> = {
  clinic: {
    summary:
      "Likely a service-based health or wellness practice that books appointments and manages ongoing patient relationships.",
    audience: ["Local patients booking care", "Returning patients on recall schedules"],
    signals: [
      "Likely booking or contact page",
      "Service list with treatment categories",
      "Recurring patient communication needs",
    ],
    workflows: ["Appointment booking & prep", "Patient follow-up & recall", "FAQ and intake"],
  },
  agency: {
    summary:
      "Likely a client services agency producing custom work, with proposals, recurring reporting, and a portfolio of past projects.",
    audience: ["SMB and mid-market clients", "Marketing or operations leaders"],
    signals: [
      "Case studies or portfolio section",
      "Contact / 'work with us' form",
      "Service tiers or packages",
    ],
    workflows: ["Lead intake & qualification", "Proposal & estimate creation", "Client reporting"],
  },
  shop: {
    summary:
      "Likely a direct-to-consumer storefront selling physical goods with recurring customer support and order questions.",
    audience: ["Retail customers and gift buyers", "Returning shoppers"],
    signals: ["Likely product catalog pages", "Cart & checkout flow", "Likely support / shipping FAQ"],
    workflows: ["Order & request management", "Customer support", "Content & product copy"],
  },
  law: {
    summary:
      "Likely a professional legal practice handling intake conversations, sensitive client information, and structured matter workflows.",
    audience: ["Prospective clients with a legal need", "Existing matter clients"],
    signals: ["Practice areas list", "Consultation contact form", "Attorney bios"],
    workflows: ["Lead intake & qualification", "Consultation prep", "Internal admin"],
  },
  consult: {
    summary:
      "Likely a small consulting or advisory firm with bespoke engagements, proposals, and recurring client deliverables.",
    audience: ["Founders and operating leaders", "Mid-market executives"],
    signals: ["Services overview", "Insights or case examples", "Contact / discovery form"],
    workflows: ["Proposal & estimate", "Client onboarding", "Reporting & deliverables"],
  },
  studio: {
    summary:
      "Likely a creative or design studio with a project pipeline, custom estimates, and a public portfolio of work.",
    audience: ["Brands and project owners", "Repeat collaborators"],
    signals: ["Portfolio / projects page", "Inquiry form", "Service descriptions"],
    workflows: ["Lead intake", "Proposal & estimate", "Client onboarding"],
  },
  coach: {
    summary:
      "Likely a coaching or training practice with discovery calls, recurring sessions, and content-driven lead generation.",
    audience: ["Individuals seeking growth", "Returning long-term clients"],
    signals: ["About / approach page", "Booking or application form", "Testimonials"],
    workflows: ["Lead intake", "Customer follow-up", "Content repurposing"],
  },
  realestate: {
    summary:
      "Likely a real-estate practice with frequent inbound inquiries, listings, and time-sensitive client follow-up.",
    audience: ["Buyers and sellers", "Local prospects researching listings"],
    signals: ["Listings or properties section", "Contact / valuation form", "Agent bios"],
    workflows: ["Lead intake & qualification", "Customer follow-up", "Reporting"],
  },
  restaurant: {
    summary:
      "Likely a hospitality business with recurring questions about hours, menu, and reservations from local guests.",
    audience: ["Local diners and event guests", "Repeat regulars"],
    signals: ["Menu page", "Hours & location", "Reservation or contact link"],
    workflows: ["FAQ & customer support", "Order or reservation management", "Content repurposing"],
  },
  professional: {
    summary:
      "Likely a small professional services business that takes inbound inquiries and delivers custom client work.",
    audience: ["SMB clients", "Referral-driven prospects"],
    signals: ["Services or 'what we do' page", "Contact form", "About page"],
    workflows: ["Lead intake", "Customer follow-up", "Internal admin"],
  },
};

// --- Opportunity templates -------------------------------------------------
const TEMPLATES: Record<OpportunityCategory, Omit<Opportunity, "id">> = {
  lead_intake: {
    category: "lead_intake",
    name: "Lead intake & qualification",
    description:
      "Help inbound leads describe what they need and route them to the right next step automatically.",
    signal: "Contact or 'work with us' form likely captures only basic fields.",
    painPoint: "Manual back-and-forth to figure out fit, budget, and timing before a real conversation.",
    improvement:
      "Create a structured intake that captures answers to 3–5 qualifying questions and generates a clean lead summary the team can act on — making downstream follow-up automation-ready.",
    firstStep: "List the 5 questions you wish every new lead answered before the first call.",
    whyItMatters:
      "Most small teams lose hours each week chasing context. Better intake compounds into faster, higher-quality conversations.",
    impact: "High",
    effort: "Low",
    confidence: "High",
    automationRisk: "Low",
  },
  customer_followup: {
    category: "customer_followup",
    name: "Customer follow-up",
    description:
      "Generate personalized follow-up drafts from existing conversation context, reviewed by a human before sending.",
    signal: "Likely relies on memory or ad-hoc email for follow-up after first contact.",
    painPoint: "Leads and customers go cold because timely, personal follow-up is hard to keep up with.",
    improvement:
      "Draft tailored follow-up messages tied to the original conversation, ready for a quick human review.",
    firstStep: "Pick one follow-up moment (e.g. post-discovery call) and write 3 example messages you'd send.",
    whyItMatters:
      "A consistent follow-up rhythm is one of the highest-ROI changes a small business can make.",
    impact: "High",
    effort: "Low",
    confidence: "Medium",
    automationRisk: "Low",
  },
  appointment_prep: {
    category: "appointment_prep",
    name: "Appointment & consultation prep",
    description:
      "Pre-summarize what you know about an upcoming appointment so you walk in ready.",
    signal: "Bookings or consults appear central to the workflow.",
    painPoint: "Prep time is squeezed between back-to-back meetings.",
    improvement:
      "Auto-generate a one-page brief from intake answers and prior notes — pre-meeting prep becomes structured and consistent.",
    firstStep: "Define what you'd want on a one-page brief before each consult.",
    whyItMatters: "Better-prepared meetings convert more often and feel more professional to the client.",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Medium",
  },
  faq_support: {
    category: "faq_support",
    name: "FAQ & customer support assistance",
    description:
      "Surface AI-assisted draft answers to common questions, grounded in real responses, with a human reviewing before sending.",
    signal: "Likely receives repeat questions about hours, scope, pricing, or process.",
    painPoint: "Repetitive questions consume team time that should go to higher-value work.",
    improvement:
      "Stand up an internal AI-assisted answer layer grounded in your real responses — staff edit and send instead of rewriting from scratch.",
    firstStep: "Collect 20 real questions you've answered in the last month.",
    whyItMatters: "Even modest deflection of repeat questions returns hours per week.",
    impact: "Medium",
    effort: "Low",
    confidence: "High",
    automationRisk: "Low",
  },
  internal_admin: {
    category: "internal_admin",
    name: "Internal admin reduction",
    description:
      "Standardize small recurring admin: meeting notes, status updates, internal summaries.",
    signal: "Small team likely splitting client work and operational admin.",
    painPoint: "Admin work eats into delivery time and rarely gets the structure it deserves.",
    improvement:
      "Convert meeting recordings and notes into structured updates that flow into the tools the team already uses.",
    firstStep: "Pick the one admin task you most resent doing each week.",
    whyItMatters: "Reclaiming a few hours of focus per week often unlocks more capacity than hiring.",
    impact: "Medium",
    effort: "Low",
    confidence: "Medium",
    automationRisk: "Low",
  },
  reporting_kpi: {
    category: "reporting_kpi",
    name: "Reporting & KPI tracking",
    description:
      "Generate first-draft client or internal reports from existing data sources.",
    signal: "Recurring reporting cadence likely required for clients or leadership.",
    painPoint: "Report assembly is mostly copy-paste and chart screenshots.",
    improvement:
      "Draft narrative explanation around your existing numbers, with humans owning the analytical judgment.",
    firstStep: "Find your last 3 reports and list which sections were truly bespoke.",
    whyItMatters: "Reporting is high-leverage to standardize because it repeats on a known cadence.",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Medium",
  },
  content_repurposing: {
    category: "content_repurposing",
    name: "Content repurposing",
    description:
      "Adapt one piece of content (article, talk, case study) into 3–5 derivative formats.",
    signal: "Likely produces some long-form or case-based content.",
    painPoint: "Good content gets created once and rarely re-used across channels.",
    improvement:
      "Adapt one approved source into channel-specific drafts so distribution becomes a repeatable operational system.",
    firstStep: "Pick one recent piece of content that performed well and list 3 channels it never reached.",
    whyItMatters: "Distribution beats production volume for small teams.",
    impact: "Medium",
    effort: "Low",
    confidence: "Medium",
    automationRisk: "Low",
  },
  proposal_estimate: {
    category: "proposal_estimate",
    name: "Proposal & estimate support",
    description:
      "Draft tailored proposals from intake notes plus a library of past wins.",
    signal: "Custom services likely require bespoke proposals or estimates.",
    painPoint: "Proposals take hours and often start from a half-remembered prior version.",
    improvement:
      "Assemble a structured proposal draft from intake answers and approved past proposals, ready for senior review.",
    firstStep: "Pick the 3 proposals you'd happily reuse as building blocks.",
    whyItMatters: "Faster, more consistent proposals improve close rate and free up senior time.",
    impact: "High",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Medium",
  },
  order_management: {
    category: "order_management",
    name: "Order & request management",
    description:
      "Triage incoming orders or requests and surface anything that needs human attention.",
    signal: "Likely handles a steady stream of small inbound orders or requests.",
    painPoint: "Edge cases get buried in the same queue as routine items.",
    improvement:
      "Route routine items automatically and surface only the requests that genuinely need a human.",
    firstStep: "Define what 'normal' vs. 'needs review' looks like in your current queue.",
    whyItMatters: "Most teams under-invest in triage and over-invest in heroics.",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Medium",
  },
  client_onboarding: {
    category: "client_onboarding",
    name: "Client onboarding",
    description:
      "Standardize the first 14 days of a client engagement with prompts, briefs, and check-ins.",
    signal: "Custom client engagements likely need a structured kickoff.",
    painPoint: "The first weeks set the tone but tend to be improvised each time.",
    improvement:
      "Generate a tailored onboarding plan from a short kickoff form, so the first 14 days follow a repeatable system.",
    firstStep: "Map the steps a client experienced in your last successful onboarding.",
    whyItMatters: "Better onboarding lifts retention and reduces early-stage churn.",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Low",
  },
};

// --- Archetype → opportunity mix ------------------------------------------
const ARCHETYPE_MIX: Record<Archetype, OpportunityCategory[]> = {
  clinic: ["customer_followup", "appointment_prep", "faq_support", "internal_admin", "lead_intake", "reporting_kpi"],
  agency: ["proposal_estimate", "reporting_kpi", "client_onboarding", "lead_intake", "content_repurposing", "customer_followup"],
  shop: ["faq_support", "order_management", "customer_followup", "content_repurposing", "internal_admin", "reporting_kpi"],
  law: ["lead_intake", "appointment_prep", "client_onboarding", "internal_admin", "customer_followup", "proposal_estimate"],
  consult: ["proposal_estimate", "client_onboarding", "reporting_kpi", "lead_intake", "content_repurposing", "customer_followup"],
  studio: ["proposal_estimate", "lead_intake", "client_onboarding", "content_repurposing", "customer_followup", "internal_admin"],
  coach: ["lead_intake", "customer_followup", "content_repurposing", "appointment_prep", "client_onboarding", "faq_support"],
  realestate: ["lead_intake", "customer_followup", "appointment_prep", "faq_support", "reporting_kpi", "content_repurposing"],
  restaurant: ["faq_support", "order_management", "customer_followup", "content_repurposing", "reporting_kpi", "internal_admin"],
  professional: ["lead_intake", "customer_followup", "internal_admin", "proposal_estimate", "client_onboarding", "reporting_kpi"],
};

const PRIORITY_BOOST: Record<Priority, OpportunityCategory[]> = {
  save_time: ["internal_admin", "faq_support", "customer_followup", "appointment_prep", "content_repurposing"],
  more_leads: ["lead_intake", "customer_followup", "proposal_estimate", "appointment_prep", "content_repurposing"],
  follow_up: ["customer_followup", "appointment_prep", "client_onboarding"],
  reduce_admin: ["internal_admin", "reporting_kpi", "order_management", "proposal_estimate", "client_onboarding"],
  customer_experience: ["faq_support", "client_onboarding", "appointment_prep", "customer_followup", "order_management"],
  reporting: ["reporting_kpi", "internal_admin", "content_repurposing"],
  not_sure: [],
};

// Priorities where customer-facing or sensitive recommendations should down-weight automation risk.
const SENSITIVE_PRIORITIES: Priority[] = ["follow_up", "customer_experience"];

const SCORE_VALUE: Record<ScoreLevel, number> = { Low: 1, Medium: 2, High: 3 };

function rankScore(o: Opportunity, priority: Priority): number {
  let base =
    SCORE_VALUE[o.impact] * 3 +
    SCORE_VALUE[o.confidence] * 2 -
    SCORE_VALUE[o.effort] -
    SCORE_VALUE[o.automationRisk];
  if (PRIORITY_BOOST[priority].includes(o.category)) base += 2;
  // Penalize high automation risk more strongly for sensitive priorities.
  if (SENSITIVE_PRIORITIES.includes(priority)) {
    base -= SCORE_VALUE[o.automationRisk];
  }
  return base;
}

const QUICK_WIN_POOL: QuickWin[] = [
  { title: "Capture your top 20 FAQs", action: "Spend 30 minutes listing the questions you answer over and over." },
  { title: "Write your 'ideal lead' description", action: "One paragraph defining who you most want to hear from." },
  { title: "Draft 3 follow-up templates", action: "One for hot leads, one for warm, one for re-engagement." },
  { title: "Pick one report to standardize", action: "Lock its structure so it stops being rewritten each time." },
  { title: "Find your 3 best past proposals", action: "Use them as the seed of a future AI-assisted draft." },
  { title: "Audit your booking flow", action: "Walk through it as a customer and note every friction point." },
  { title: "Define a kickoff form", action: "Capture the same core inputs before each new engagement." },
  { title: "Define an order triage rule", action: "Write down what makes a request routine, needs review, or urgent." },
];

const QUICK_WINS_BY_CATEGORY: Partial<Record<OpportunityCategory, QuickWin[]>> = {
  lead_intake: [
    { title: "Write your 'ideal lead' description", action: "One paragraph defining who you most want to hear from." },
    { title: "List the 5 questions every new lead should answer", action: "Capture them before any sales call to make intake structured." },
  ],
  customer_followup: [
    { title: "Draft 3 follow-up templates", action: "One for hot leads, one for warm, one for re-engagement." },
    { title: "Pick one follow-up moment to standardize first", action: "Choose the highest-leverage touchpoint and define its trigger." },
  ],
  proposal_estimate: [
    { title: "Find your 3 best past proposals", action: "Use them as the seed of a future AI-assisted draft." },
    { title: "List the sections every proposal repeats", action: "Lock the reusable structure so each draft starts 70% done." },
  ],
  faq_support: [
    { title: "Capture your top 20 FAQs", action: "Spend 30 minutes listing the questions you answer over and over." },
    { title: "Tag the 5 questions that always need a human", action: "Define the boundary between automatable and judgment-required." },
  ],
  reporting_kpi: [
    { title: "Pick one report to standardize", action: "Lock its structure so it stops being rewritten each time." },
    { title: "List which sections were truly bespoke last cycle", action: "Everything else is a candidate for a structured template." },
  ],
  order_management: [
    { title: "Define an order triage rule", action: "Write down what makes a request routine, needs review, or urgent." },
  ],
  client_onboarding: [
    { title: "Define a kickoff form", action: "Capture the same core inputs before each new engagement." },
  ],
  appointment_prep: [
    { title: "Audit your booking flow", action: "Walk through it as a customer and note every friction point." },
  ],
  internal_admin: [
    { title: "Pick the admin task you most resent", action: "Make it the first candidate for a structured workflow." },
  ],
  content_repurposing: [
    { title: "Pick one piece worth repurposing", action: "Choose a recent high-performer and list 3 channels it never reached." },
  ],
};

// Categories considered "marketing/content-related" — used to avoid over-weighting them.
const CONTENT_CATEGORIES = new Set<OpportunityCategory>(["content_repurposing"]);

function selectTop3(
  candidates: Opportunity[],
  priority: Priority,
): Opportunity[] {
  const ranked = [...candidates].sort(
    (a, b) => rankScore(b, priority) - rankScore(a, priority),
  );

  const picked: Opportunity[] = [];
  const usedCats = new Set<OpportunityCategory>();

  // Pick top while keeping category diversity.
  for (const o of ranked) {
    if (picked.length >= 3) break;
    if (usedCats.has(o.category)) continue;
    picked.push(o);
    usedCats.add(o.category);
  }
  // Fill remaining if we couldn't get 3 unique categories.
  for (const o of ranked) {
    if (picked.length >= 3) break;
    if (picked.includes(o)) continue;
    picked.push(o);
  }

  // Ensure not all 3 are content/marketing-related.
  if (picked.every((o) => CONTENT_CATEGORIES.has(o.category))) {
    const swap = ranked.find((o) => !CONTENT_CATEGORIES.has(o.category) && !picked.includes(o));
    if (swap) picked[2] = swap;
  }

  // Ensure at least one low-effort quick win is included.
  if (!picked.some((o) => o.effort === "Low")) {
    const lowEffort = ranked.find((o) => o.effort === "Low" && !picked.includes(o));
    if (lowEffort) picked[picked.length - 1] = lowEffort;
  }

  return picked;
}

// --- Public API ------------------------------------------------------------
export function analyze(rawUrl: string, priority: Priority): AnalysisResult {
  const url = normalizeUrl(rawUrl);
  const seed = hashString(`${url}|${priority}`);
  const rand = mulberry32(seed);
  const archetype = classify(url);
  const copy = ARCHETYPE_COPY[archetype];

  const mix = [...ARCHETYPE_MIX[archetype]];
  // Light shuffle for variety across URLs while staying deterministic per URL.
  for (let i = mix.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [mix[i], mix[j]] = [mix[j], mix[i]];
  }

  // Build 5-6 candidate opportunities for this archetype.
  const candidates: Opportunity[] = mix.slice(0, 6).map((cat, i) => ({
    ...TEMPLATES[cat],
    id: `${url}-${cat}-${i}`,
  }));

  // Apply mild deterministic variation to scores so different URLs feel distinct.
  for (const o of candidates) {
    if (rand() > 0.75) o.impact = bumpDown(o.impact);
    if (rand() > 0.75) o.effort = bumpUp(o.effort);
  }

  const top3 = selectTop3(candidates, priority);

  const wins: QuickWin[] = [];
  const usedWinIdx = new Set<number>();
  while (wins.length < 3) {
    const idx = Math.floor(rand() * QUICK_WIN_POOL.length);
    if (usedWinIdx.has(idx)) continue;
    usedWinIdx.add(idx);
    wins.push(QUICK_WIN_POOL[idx]);
  }

  const snapshot: BusinessSnapshot = {
    summary: copy.summary,
    audience: copy.audience,
    signals: copy.signals,
    workflowAreas: copy.workflows,
  };

  return {
    url,
    displayUrl: displayHost(url),
    priority,
    isDemo: false,
    snapshot,
    topOpportunity: top3[0],
    opportunities: top3,
    quickWins: wins,
    roadmapKey: CATEGORY_TO_ROADMAP[top3[0].category],
  };
}

function bumpDown(s: ScoreLevel): ScoreLevel {
  return s === "High" ? "Medium" : "Low";
}
function bumpUp(s: ScoreLevel): ScoreLevel {
  return s === "Low" ? "Medium" : "High";
}

