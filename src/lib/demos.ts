import type { AnalysisResult, Opportunity } from "./types";

export type DemoId = "clinic" | "agency" | "boutique";

export const DEMO_META: Record<DemoId, { label: string; url: string; tagline: string }> = {
  clinic: { label: "Dental clinic", url: "brightsmile-dental.com", tagline: "Follow-up & prep" },
  agency: { label: "Marketing agency", url: "northbeam-agency.com", tagline: "Proposals & reports" },
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
    roadmapKey: "recall_followup",
    safetyNote:
      "Keep AI limited to scheduling, reminders, admin prep, and staff-approved communication. Do not automate diagnosis, treatment advice, or clinical decisions.",
    snapshot: {
      summary:
        "BrightSmile Dental is likely a multi-provider dental practice serving local families and individual patients, with appointment booking, recall reminders, routine questions, and front-desk communication handled by staff.",
      audience: [
        "Local families and individual patients",
        "Returning patients on 6-month recall schedules",
        "New patients researching providers in the area",
      ],
      signals: [
        "Booking page linked to a scheduler",
        "Service list covering cleanings, cosmetic dentistry, and urgent care",
        "Recurring patient communication around recall reminders and scheduling",
        "Routine questions about hours, insurance, forms, and appointments",
      ],
      workflowAreas: [
        "Appointment booking and prep",
        "Patient follow-up and recall",
        "Front-desk FAQ handling",
      ],
    },
    topOpportunity: O({
      category: "customer_followup",
      name: "Patient follow-up & recall",
      description:
        "AI-assisted recall and follow-up message drafts created from approved templates and reviewed by the front desk before sending.",
      whyItMatters:
        "Recall is one of the largest drivers of dental practice revenue. Most missed recall is a communication problem, not a demand problem.",
      signal:
        "Recurring patient communication around recall reminders, missed appointments, post-visit follow-up, and routine scheduling.",
      painPoint:
        "Patients can fall behind on recall schedules when reminders depend on manual follow-up and available staff time.",
      improvement:
        "Generate first-draft recall and follow-up messages from approved templates so staff can review, personalize, and send.",
      firstStep:
        "Pull a small list of patients overdue for recall by 60+ days and choose the first 25 to review.",
      impact: "High",
      effort: "Low",
      confidence: "High",
      automationRisk: "Low",
    }),
    opportunities: [
      O({
        category: "customer_followup",
        name: "Patient follow-up & recall",
        description:
          "AI-assisted recall and follow-up message drafts created from approved templates and reviewed by the front desk before sending.",
        whyItMatters:
          "Recall is one of the largest drivers of dental practice revenue. Most missed recall is a communication problem.",
        signal:
          "Recurring patient communication around recall reminders, missed appointments, and routine scheduling.",
        painPoint:
          "Patients can fall behind on recall schedules when reminders depend on manual follow-up and available staff time.",
        improvement:
          "Generate first-draft recall and follow-up messages from approved templates so staff can review, personalize, and send.",
        firstStep:
          "Pull a small list of patients overdue for recall by 60+ days and choose the first 25 to review.",
        impact: "High",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
      O({
        category: "appointment_prep",
        name: "Appointment prep checklist",
        description:
          "Non-clinical appointment prep checklists for upcoming visits, reviewed by staff before the appointment.",
        whyItMatters:
          "Provider and front-desk time is the most expensive resource in the practice. Better prep protects it.",
        signal:
          "Appointment booking appears central, and staff may need to prepare context between back-to-back visits.",
        painPoint:
          "Providers and front-desk staff may need quick visibility into appointment type, forms received, missing admin details, or patient questions.",
        improvement:
          "Generate a non-clinical prep checklist from appointment type, approved intake fields, and patient-submitted admin details.",
        firstStep:
          "Decide which 5 non-clinical fields should appear at the top of a prep checklist, such as appointment type, forms received, insurance status, open questions, and requested accommodations.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "faq_support",
        name: "Front-desk FAQ assistant",
        description:
          "An internal assistant that drafts answers to common patient questions using approved office policies and staff-reviewed responses.",
        whyItMatters:
          "The front desk fields the same questions every day; AI-drafted answers free them for higher-value calls.",
        signal:
          "Likely repeat questions about hours, insurance, scheduling, forms, pricing, and appointment logistics.",
        painPoint:
          "Repeat questions can absorb front-desk time that could otherwise go to patients currently in the office.",
        improvement:
          "Build an internal assistant using approved answers for administrative questions. Staff review responses before sending.",
        firstStep:
          "Collect 20 recurring front-desk questions from the last week and write the approved answer for each.",
        impact: "Medium",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      {
        title: "List overdue recall patients",
        action: "Pull the 25 most overdue patients and decide who to contact first.",
      },
      {
        title: "Write 3 follow-up templates",
        action:
          "Create one template for recall, one for missed appointments, and one for post-visit follow-up.",
      },
      {
        title: "Capture top 20 front-desk questions",
        action: "Spend 30 minutes writing down the questions staff answer every week.",
      },
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
        "Northbeam Agency is likely a small full-service marketing agency with retainer clients, recurring reporting, custom strategy work, and bespoke proposals for new business.",
      audience: [
        "SMB and mid-market marketing leaders",
        "Founders looking for outsourced growth support",
        "Existing retainer clients on recurring reporting cycles",
      ],
      signals: [
        "Portfolio or case study section",
        "Service tiers or packages",
        "'Work with us' or contact flow for new business",
        "Recurring client reporting needs",
      ],
      workflowAreas: [
        "Proposal and estimate creation",
        "Client reporting",
        "Client onboarding",
      ],
    },
    topOpportunity: O({
      category: "proposal_estimate",
      name: "Proposal & estimate drafting",
      description:
        "AI-assisted first drafts created from intake answers, reusable proposal sections, and past successful examples.",
      whyItMatters:
        "Senior time spent re-writing proposals from scratch is the largest hidden cost in most small agencies.",
      signal:
        "Custom service tiers suggest each engagement may require a tailored proposal or estimate.",
      painPoint:
        "Proposal drafts often start from copied prior work, which can slow turnaround and create inconsistent quality.",
      improvement:
        "Use AI to generate a structured first draft from intake answers, reusable service descriptions, and selected past examples.",
      firstStep:
        "Select 3 to 5 strong past proposals and mark the sections that are reusable, client-specific, or require human judgment.",
      impact: "High",
      effort: "Medium",
      confidence: "High",
      automationRisk: "Medium",
    }),
    opportunities: [
      O({
        category: "proposal_estimate",
        name: "Proposal & estimate drafting",
        description:
          "AI-assisted first drafts created from intake answers, reusable proposal sections, and past successful examples.",
        whyItMatters: "Senior time on proposals is the largest hidden cost in small agencies.",
        signal:
          "Custom service tiers suggest each engagement may require a tailored proposal or estimate.",
        painPoint:
          "Proposal drafts often start from copied prior work, which can slow turnaround and create inconsistent quality.",
        improvement:
          "Use AI to generate a structured first draft from intake answers, reusable service descriptions, and selected past examples.",
        firstStep:
          "Select 3 to 5 strong past proposals and mark the sections that are reusable, client-specific, or require human judgment.",
        impact: "High",
        effort: "Medium",
        confidence: "High",
        automationRisk: "Medium",
      }),
      O({
        category: "reporting_kpi",
        name: "Client reporting drafts",
        description:
          "First-draft performance summaries created from recurring client metrics and notes, ready for team review.",
        whyItMatters: "Reporting is high-leverage to automate because it repeats on a known cadence.",
        signal:
          "Recurring client work suggests regular reporting, updates, or performance summaries may be needed.",
        painPoint:
          "Teams often spend time rewriting similar explanations each month instead of focusing on insights and decisions.",
        improvement:
          "Use AI to generate a first-draft client narrative from existing metrics, campaign notes, and agreed reporting sections.",
        firstStep:
          "Choose one recurring report format and identify which sections repeat monthly versus which require custom analysis.",
        impact: "High",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "client_onboarding",
        name: "Client onboarding kits",
        description:
          "AI-assisted onboarding materials generated from a short kickoff form and standard engagement details.",
        whyItMatters: "Strong onboarding lifts retention and reduces early-stage churn.",
        signal: "Custom engagements likely benefit from a structured first 14 days.",
        painPoint:
          "New client setup can become inconsistent when kickoff details, expectations, and next steps live across emails or notes.",
        improvement:
          "Generate a tailored onboarding plan, kickoff agenda, and intro email from a standardized kickoff form.",
        firstStep:
          "Map the first 5 to 7 steps a client experiences after signing and identify the information needed at each step.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      {
        title: "Pick your 3 best proposals",
        action: "Use them as examples for structure, tone, and reusable sections.",
      },
      {
        title: "Lock one report template",
        action: "Standardize the monthly structure before automating the draft.",
      },
      {
        title: "Define a kickoff form",
        action: "Capture the same core inputs before each new engagement.",
      },
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
        "Lumen Goods is likely a small online boutique selling curated physical products, with recurring customer questions, order updates, shipping questions, seasonal launches, and product storytelling needs.",
      audience: [
        "Direct-to-consumer shoppers",
        "Gift buyers seeking curated picks",
        "Returning customers buying across seasons",
      ],
      signals: [
        "Product catalog with collection pages",
        "Cart and checkout flow",
        "Shipping and returns FAQ",
        "Seasonal or curated product drops",
      ],
      workflowAreas: [
        "Order and request management",
        "Customer support",
        "Content and product copy",
      ],
    },
    topOpportunity: O({
      category: "faq_support",
      name: "Support reply assistant",
      description:
        "AI-assisted reply drafts for common customer questions, using approved answers and staff review.",
      whyItMatters:
        "For small e-commerce teams, support is the workflow most likely to silently consume founder time.",
      signal:
        "Likely repeat questions about shipping, returns, product details, order status, and gift options.",
      painPoint:
        "Staff may be answering the same customer questions repeatedly, taking time away from fulfillment, merchandising, and follow-up.",
      improvement:
        "Use AI to draft replies from approved answers so staff can review, personalize, and send.",
      firstStep:
        "Collect the 25 most common customer questions from email, DMs, order notes, and support messages.",
      impact: "High",
      effort: "Low",
      confidence: "High",
      automationRisk: "Low",
    }),
    opportunities: [
      O({
        category: "faq_support",
        name: "Support reply assistant",
        description:
          "AI-assisted reply drafts for common customer questions, using approved answers and staff review.",
        whyItMatters: "Support is the workflow most likely to silently consume founder time.",
        signal:
          "Likely repeat questions about shipping, returns, product details, order status, and gift options.",
        painPoint:
          "Staff may be answering the same customer questions repeatedly, taking time away from fulfillment, merchandising, and follow-up.",
        improvement:
          "Use AI to draft replies from approved answers so staff can review, personalize, and send.",
        firstStep:
          "Collect the 25 most common customer questions from email, DMs, order notes, and support messages.",
        impact: "High",
        effort: "Low",
        confidence: "High",
        automationRisk: "Low",
      }),
      O({
        category: "order_management",
        name: "Order triage & flagging",
        description:
          "Classify incoming orders or requests and surface anything that needs human attention.",
        whyItMatters: "Most teams under-invest in triage and over-invest in heroics.",
        signal:
          "A steady flow of small orders may include occasional edge cases, special requests, address issues, gift notes, or return questions.",
        painPoint: "Edge cases can get buried in the same queue as routine orders.",
        improvement:
          "Use simple rules or AI-assisted classification to flag orders that need review before fulfillment.",
        firstStep:
          "Define what 'routine,' 'needs review,' and 'urgent' look like in the current order queue.",
        impact: "Medium",
        effort: "Medium",
        confidence: "Medium",
        automationRisk: "Medium",
      }),
      O({
        category: "content_repurposing",
        name: "Product content repurposing",
        description: "Turn one product story into email, social, and product-page copy variants.",
        whyItMatters: "Distribution beats production volume for small DTC teams.",
        signal:
          "Seasonal launches and curated products often need repeated promotion across multiple channels.",
        painPoint:
          "Good product stories may only get used once, even when they could support several customer touchpoints.",
        improvement:
          "Use AI to repurpose one approved product story into 3 to 5 channel-specific drafts.",
        firstStep:
          "Pick one recent product launch and list the channels where it could have been reused.",
        impact: "Medium",
        effort: "Low",
        confidence: "Medium",
        automationRisk: "Low",
      }),
    ],
    quickWins: [
      {
        title: "Collect your top 25 support questions",
        action: "These become the foundation for safe AI-assisted reply drafts.",
      },
      {
        title: "Define an order triage rule",
        action: "Write down what makes an order routine, needs review, or urgent.",
      },
      {
        title: "Pick one story to repurpose",
        action: "Choose a recent launch that deserved more reach.",
      },
    ],
  },
};
