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
  ["clinic", /(clinic|dental|health|medical|wellness|therapy|chiro|vet)/i],
  ["agency", /(agency|marketing|studio-?digital|creative|growth|seo|brand)/i],
  ["shop", /(shop|store|boutique|goods|market|outfitters|apparel|wear)/i],
  ["law", /(law|legal|attorney|advocate|counsel)/i],
  ["consult", /(consult|advisor|strategy|partners|capital)/i],
  ["studio", /(studio|design|architects|interiors|photo)/i],
  ["coach", /(coach|coaching|mentor|fitness|trainer)/i],
  ["realestate", /(realty|realestate|homes|properties|estate)/i],
  ["restaurant", /(restaurant|bistro|cafe|kitchen|eatery|pizzeria)/i],
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
    signals: ["Product catalog pages", "Cart & checkout flow", "Support / shipping FAQ"],
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
      "Add an AI-assisted intake that asks 3–5 smart follow-up questions and produces a clean lead summary for the team.",
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
      "Use AI to draft personalized follow-up messages after inquiries, meetings, or purchases.",
    signal: "Likely relies on memory or ad-hoc email for follow-up after first contact.",
    painPoint: "Leads and customers go cold because timely, personal follow-up is hard to keep up with.",
    improvement:
      "Generate first-draft follow-up emails tied to the conversation context, ready for a quick human review.",
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
      "Auto-generate a one-page brief from intake answers, prior notes, and any uploaded files.",
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
      "Use AI to draft answers to common questions, with a human reviewing before sending.",
    signal: "Likely receives repeat questions about hours, scope, pricing, or process.",
    painPoint: "Repetitive questions consume team time that should go to higher-value work.",
    improvement:
      "Build an internal AI assistant trained on your real answers — staff edit and send instead of rewriting.",
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
      "Automate small recurring admin: meeting notes, status updates, internal summaries.",
    signal: "Small team likely splitting client work and operational admin.",
    painPoint: "Admin work eats into delivery time and rarely gets the structure it deserves.",
    improvement:
      "Use AI to turn meeting recordings and notes into structured updates for your tools of choice.",
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
      "Use AI to draft narrative around your existing numbers, then edit before sending.",
    firstStep: "Find your last 3 reports and list which sections were truly bespoke.",
    whyItMatters: "Reporting is high-leverage to automate because it repeats on a known cadence.",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automationRisk: "Medium",
  },
  content_repurposing: {
    category: "content_repurposing",
    name: "Content repurposing",
    description:
      "Turn one piece of content (article, talk, case study) into 3–5 derivative formats.",
    signal: "Likely produces some long-form or case-based content.",
    painPoint: "Good content gets created once and rarely re-used across channels.",
    improvement:
      "Use AI to spin a single source into newsletter, social, and sales-enablement variants.",
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
      "Use AI to assemble a first draft from intake answers and your best past proposals.",
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
      "Use AI to classify incoming requests and flag the ones that genuinely need a human.",
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
      "Use AI to generate a tailored onboarding plan from a short kickoff form.",
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
  clinic: ["appointment_prep", "customer_followup", "faq_support", "internal_admin"],
  agency: ["proposal_estimate", "reporting_kpi", "client_onboarding", "lead_intake"],
  shop: ["order_management", "faq_support", "content_repurposing", "customer_followup"],
  law: ["lead_intake", "appointment_prep", "internal_admin", "client_onboarding"],
  consult: ["proposal_estimate", "client_onboarding", "reporting_kpi", "lead_intake"],
  studio: ["proposal_estimate", "lead_intake", "client_onboarding", "content_repurposing"],
  coach: ["lead_intake", "customer_followup", "content_repurposing", "appointment_prep"],
  realestate: ["lead_intake", "customer_followup", "reporting_kpi", "faq_support"],
  restaurant: ["faq_support", "order_management", "content_repurposing", "customer_followup"],
  professional: ["lead_intake", "customer_followup", "internal_admin", "proposal_estimate"],
};

const PRIORITY_BOOST: Record<Priority, OpportunityCategory[]> = {
  save_time: ["internal_admin", "faq_support", "customer_followup"],
  more_leads: ["lead_intake", "customer_followup", "content_repurposing"],
  follow_up: ["customer_followup", "appointment_prep"],
  reduce_admin: ["internal_admin", "reporting_kpi", "order_management"],
  customer_experience: ["faq_support", "client_onboarding", "appointment_prep"],
  reporting: ["reporting_kpi", "internal_admin"],
  not_sure: [],
};

const SCORE_VALUE: Record<ScoreLevel, number> = { Low: 1, Medium: 2, High: 3 };

function rankScore(o: Opportunity, priority: Priority): number {
  const base =
    SCORE_VALUE[o.impact] * 3 +
    SCORE_VALUE[o.confidence] * 2 -
    SCORE_VALUE[o.effort] -
    SCORE_VALUE[o.automationRisk];
  const boost = PRIORITY_BOOST[priority].includes(o.category) ? 4 : 0;
  return base + boost;
}

const QUICK_WIN_POOL: QuickWin[] = [
  { title: "Capture your top 20 FAQs", action: "Spend 30 minutes listing the questions you answer over and over." },
  { title: "Write your 'ideal lead' description", action: "One paragraph defining who you most want to hear from." },
  { title: "Draft 3 follow-up templates", action: "One for hot leads, one for warm, one for re-engagement." },
  { title: "Pick one report to standardize", action: "Lock its structure so it stops being rewritten each time." },
  { title: "Find your 3 best past proposals", action: "Use them as the seed of a future AI-assisted draft." },
  { title: "Audit your booking flow", action: "Walk through it as a customer and note every friction point." },
];

// --- Public API ------------------------------------------------------------
export function analyze(rawUrl: string, priority: Priority): AnalysisResult {
  const url = normalizeUrl(rawUrl);
  const seed = hashString(`${url}|${priority}`);
  const rand = mulberry32(seed);
  const archetype = classify(url);
  const copy = ARCHETYPE_COPY[archetype];

  const mix = [...ARCHETYPE_MIX[archetype]];
  // Light shuffle
  for (let i = mix.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [mix[i], mix[j]] = [mix[j], mix[i]];
  }

  const opportunities: Opportunity[] = mix.slice(0, 4).map((cat, i) => ({
    ...TEMPLATES[cat],
    id: `${url}-${cat}-${i}`,
  }));

  // Apply mild deterministic variation to scores
  for (const o of opportunities) {
    if (rand() > 0.7) o.impact = bumpDown(o.impact);
    if (rand() > 0.7) o.effort = bumpUp(o.effort);
  }

  opportunities.sort((a, b) => rankScore(b, priority) - rankScore(a, priority));
  const top3 = opportunities.slice(0, 3);

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
  };
}

function bumpDown(s: ScoreLevel): ScoreLevel {
  return s === "High" ? "Medium" : s === "Medium" ? "Low" : "Low";
}
function bumpUp(s: ScoreLevel): ScoreLevel {
  return s === "Low" ? "Medium" : s === "Medium" ? "High" : "High";
}
