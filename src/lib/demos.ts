import type { AnalysisResult, Opportunity } from "./types";

export type DemoId = "clinic" | "agency" | "boutique";

export const DEMO_META: Record<DemoId, { label: string; url: string; tagline: string }> = {
  clinic: { label: "Dental clinic", url: "brightsmile-dental.com", tagline: "Patient follow-up & prep" },
  agency: { label: "Marketing agency", url: "northbeam-agency.com", tagline: "Proposals & reporting" },
  boutique: { label: "Online boutique", url: "lumen-goods-shop.com", tagline: "Orders & support" },
};

const O = (o: Omit<Opportunity, "id"> & { id?: string }): Opportunity => ({
  id: o.id ?? `${o.category}-${o.name}`,
  ...o,
});

export const DEMOS: Record<DemoId, AnalysisResult> = {
  clinic: {
    url: DEMO_META.clinic.url,
    displayUrl: DEMO_META.clinic.url,
    priority: "follow_up",
    isDemo: true,
    demoLabel: DEMO_META.clinic.label,
    snapshot: {
      summary:
        "BrightSmile Dental is likely a multi-provider dental practice serving local families, with bookings, recall reminders, and routine patient questions running through a small front-desk team.",
      audience: [
        "Local families and individual patients",
        "Returning patients on 6-month recall schedules",
        "New patients researching providers in the area",
      ],
      signals: [
        "Likely booking page linked to a third-party scheduler",
        "Service list covering cleanings, cosmetic, and emergency care",
        "Recurring patient communication around recalls and reminders",
      ],
      workflowAreas: [
        "Appointment booking & prep",
        "Patient follow-up & recall",
        "Front-desk FAQ handling",
      ],
    },
    topOpportunity: O({
      category: "customer_followup",
      name: "Patient follow-up & recall",
      description: "AI-drafted, personalized follow-up and recall messages reviewed by the front desk.",
      whyItMatters:
        "Recall is one of the largest drivers of dental practice revenue. Most missed recall is a communication problem, not a demand problem.",
      signal: "Patient communication likely depends on memory and the next available staff window.",
      painPoint: "Patients fall off recall schedules silently, and front-desk staff don't have time to chase each one personally.",
      improvement:
        "Generate first-draft, personalized recall and follow-up messages that the team approves and sends in minutes instead of hours.",
      firstStep: "Pull a list of patients overdue for recall by 60+ days and pick the top 25 to start with.",
      impact: "High",
      effort: "Low",
      confidence: "High",
      automationRisk: "Low",
    }),
    opportunities: [
      O({
        category: "customer_followup",
        name: "Patient follow-up & recall",
        description: "AI-drafted, personalized follow-up and recall messages reviewed by the front desk.",
        whyItMatters:
          "Recall is one of the largest drivers of dental practice revenue. Most missed recall is a communication problem.",
        signal: "Patient communication likely depends on memory and the next available staff window.",
        painPoint: "Patients fall off recall schedules silently.",
        improvement:
          "Generate first-draft, personalized recall messages that staff approve and send in minutes.",
        firstStep: "Pull a list of patients overdue for recall by 60+ days and pick the top 25 to start with.",
        impact: "High",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
      O({
        category: "appointment_prep",
        name: "Appointment prep briefs",
        description: "One-page summaries for each upcoming appointment, ready when the provider walks in.",
        whyItMatters: "Provider time is the most expensive resource in the practice. Better prep protects it.",
        signal: "Bookings appear central; prep likely happens between back-to-back patients.",
        painPoint: "Providers walk in cold or rely on the chart open in another tab.",
        improvement:
          "Auto-generate a short brief per appointment from intake answers, last-visit notes, and any uploaded forms.",
        firstStep: "Decide what 5 fields you'd want at the top of a one-page brief.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "faq_support",
        name: "Front-desk FAQ assistant",
        description: "An internal assistant that drafts answers to common patient questions for staff to review.",
        whyItMatters: "The front desk fields the same questions every day; AI-drafted answers free them for higher-value calls.",
        signal: "Likely high volume of repeat questions about hours, insurance, and procedures.",
        painPoint: "Repeat questions absorb the time that should go to patients in front of staff.",
        improvement: "Build an internal assistant trained on your real, approved answers.",
        firstStep: "Collect 20 real questions the front desk answered in the last week.",
        impact: "Medium",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      { title: "List your overdue recall patients", action: "Pull the 25 most overdue and decide who to contact first." },
      { title: "Write 3 follow-up message templates", action: "One for recall, one for missed appointments, one post-visit." },
      { title: "Capture top 20 front-desk questions", action: "Spend 30 minutes writing the answers you give every week." },
    ],
  },

  agency: {
    url: DEMO_META.agency.url,
    displayUrl: DEMO_META.agency.url,
    priority: "reduce_admin",
    isDemo: true,
    demoLabel: DEMO_META.agency.label,
    snapshot: {
      summary:
        "Northbeam Agency is likely a small full-service marketing agency with retainer clients, recurring reporting, and bespoke proposals for new business.",
      audience: [
        "SMB and mid-market marketing leaders",
        "Founders looking for outsourced growth support",
        "Existing retainer clients on recurring reporting cycles",
      ],
      signals: [
        "Likely portfolio or case studies section",
        "Service tiers or packages described",
        "'Work with us' contact form for new business",
      ],
      workflowAreas: [
        "Proposal & estimate creation",
        "Recurring client reporting",
        "Client onboarding",
      ],
    },
    topOpportunity: O({
      category: "proposal_estimate",
      name: "Proposal & estimate drafting",
      description: "AI-assembled first-draft proposals from intake notes and your best past wins.",
      whyItMatters:
        "Senior time spent re-writing proposals from scratch is the largest hidden cost in most small agencies.",
      signal: "Custom service tiers suggest each engagement still gets a bespoke proposal.",
      painPoint: "Each proposal restarts from a half-remembered prior version, costing senior hours and slowing close.",
      improvement:
        "Use AI to assemble a tailored first draft from intake answers and a curated library of your best past proposals.",
      firstStep: "Pick the 3 proposals you'd happily reuse as building blocks.",
      impact: "High",
      effort: "Medium",
      confidence: "High",
      automationRisk: "Medium",
    }),
    opportunities: [
      O({
        category: "proposal_estimate",
        name: "Proposal & estimate drafting",
        description: "AI-assembled first-draft proposals from intake notes and your best past wins.",
        whyItMatters: "Senior time on proposals is the largest hidden cost in small agencies.",
        signal: "Custom service tiers suggest each engagement still gets a bespoke proposal.",
        painPoint: "Each proposal restarts from a half-remembered prior version.",
        improvement: "Use AI to assemble a tailored first draft from intake answers and your best past proposals.",
        firstStep: "Pick 3 past proposals to seed a reusable library.",
        impact: "High",
        effort: "Medium",
        confidence: "High",
        automationRisk: "Medium",
      }),
      O({
        category: "reporting_kpi",
        name: "Client reporting drafts",
        description: "First-draft narrative around your existing client metrics, ready for editor review.",
        whyItMatters: "Reporting is high-leverage to automate because it repeats on a known cadence.",
        signal: "Recurring client reporting cadence likely required across the book.",
        painPoint: "Reports are mostly copy-paste plus a few sentences of insight that get rewritten each month.",
        improvement: "Use AI to draft narrative against your numbers; the team edits before sending.",
        firstStep: "Find your last 3 client reports and mark which sections were truly bespoke.",
        impact: "High",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "client_onboarding",
        name: "Client onboarding kits",
        description: "Tailored onboarding plans generated from a short kickoff form.",
        whyItMatters: "Strong onboarding lifts retention and reduces early-stage churn.",
        signal: "Custom engagements likely benefit from a structured first 14 days.",
        painPoint: "The first weeks set the tone but get improvised each time.",
        improvement: "Generate a tailored onboarding plan, kickoff agenda, and intro email per new client.",
        firstStep: "Map the steps a client experienced in your last successful onboarding.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      { title: "Pick your 3 best proposals", action: "These become the seed library for AI-assisted drafts." },
      { title: "Lock one report template", action: "Stop rewriting the structure every month." },
      { title: "Define a kickoff form", action: "5 questions every new client answers before week one." },
    ],
  },

  boutique: {
    url: DEMO_META.boutique.url,
    displayUrl: DEMO_META.boutique.url,
    priority: "customer_experience",
    isDemo: true,
    demoLabel: DEMO_META.boutique.label,
    snapshot: {
      summary:
        "Lumen Goods is likely a small online boutique selling curated physical products, with a steady stream of order questions, shipping inquiries, and seasonal content needs.",
      audience: [
        "Direct-to-consumer shoppers",
        "Gift buyers seeking curated picks",
        "Returning customers buying across seasons",
      ],
      signals: [
        "Likely product catalog with collection pages",
        "Cart and checkout flow",
        "Shipping & returns FAQ",
      ],
      workflowAreas: [
        "Order & request management",
        "Customer support",
        "Content & product copy",
      ],
    },
    topOpportunity: O({
      category: "faq_support",
      name: "Support reply assistant",
      description: "AI drafts replies to incoming support emails using your real, approved answers.",
      whyItMatters:
        "For small e-commerce teams, support is the workflow most likely to silently consume founder time.",
      signal: "Likely high volume of repeat questions about shipping, returns, and product details.",
      painPoint: "The same 10 questions get answered every week, often by the founder.",
      improvement:
        "An internal assistant drafts personalized replies; staff approve and send in seconds.",
      firstStep: "Collect the 25 most-asked customer questions from the last month.",
      impact: "High",
      effort: "Low",
      confidence: "High",
      automationRisk: "Low",
    }),
    opportunities: [
      O({
        category: "faq_support",
        name: "Support reply assistant",
        description: "AI drafts replies to incoming support emails using your real, approved answers.",
        whyItMatters: "Support is the workflow most likely to silently consume founder time.",
        signal: "High volume of repeat shipping, returns, and product questions.",
        painPoint: "The same 10 questions get answered every week.",
        improvement: "An internal assistant drafts personalized replies; staff approve and send.",
        firstStep: "Collect the 25 most-asked customer questions from the last month.",
        impact: "High",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
      O({
        category: "order_management",
        name: "Order triage & flagging",
        description: "Classify incoming orders and surface anything that needs human attention.",
        whyItMatters: "Most teams under-invest in triage and over-invest in heroics.",
        signal: "Steady stream of small orders likely with occasional edge cases.",
        painPoint: "Edge cases get buried in the same queue as routine orders.",
        improvement: "AI classifies each order and flags only the ones a human truly needs to review.",
        firstStep: "Define what 'normal' vs. 'needs review' looks like in your current queue.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "content_repurposing",
        name: "Product content repurposing",
        description: "Turn one product story into newsletter, social, and on-site copy variants.",
        whyItMatters: "Distribution beats production volume for small DTC teams.",
        signal: "Likely produces seasonal content that gets used once and forgotten.",
        painPoint: "Good product stories rarely make it past one channel.",
        improvement: "Use AI to spin a single story into 3–5 channel-specific variants.",
        firstStep: "Pick one recent product launch and list 3 channels it never reached.",
        impact: "Medium",
        effort: "Low",
        confidence: "Medium",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      { title: "Collect your top 25 support questions", action: "These become the foundation of an AI reply assistant." },
      { title: "Define an order triage rule", action: "Write down what makes an order 'needs review'." },
      { title: "Pick one story to repurpose", action: "Choose a recent launch that deserved more reach." },
    ],
  },
};
