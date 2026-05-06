import type { OpportunityCategory, RoadmapKey } from "./types";

export interface RoadmapWeek {
  week: string;
  title: string;
  desc: string;
}

const GENERIC: RoadmapWeek[] = [
  { week: "Week 1", title: "Clarify the workflow", desc: "Pick one opportunity and gather concrete examples of how the work gets done today." },
  { week: "Week 2", title: "Define the process", desc: "Write down the inputs, decisions, and outputs the workflow needs to function reliably." },
  { week: "Week 3", title: "Test a prototype", desc: "Build a lightweight AI or automation prototype and try it on real (low-stakes) examples." },
  { week: "Week 4", title: "Review & decide", desc: "Evaluate the results, capture what worked, and decide whether to expand or pivot." },
];

export const ROADMAPS: Record<RoadmapKey, RoadmapWeek[]> = {
  support_reply: [
    { week: "Week 1", title: "Collect repeat questions", desc: "Gather common customer questions from email, DMs, order notes, and support messages." },
    { week: "Week 2", title: "Approve answer patterns", desc: "Write or clean up approved answers for the most common questions." },
    { week: "Week 3", title: "Test reply drafts", desc: "Generate draft replies for low-risk questions, with staff review before sending." },
    { week: "Week 4", title: "Review quality and handoff rules", desc: "Compare draft quality, flag confusing cases, and define which questions require human-only handling." },
  ],
  proposal_drafting: [
    { week: "Week 1", title: "Gather proposal examples", desc: "Collect 3 to 5 recent proposals, intake notes, pricing assumptions, and approval comments." },
    { week: "Week 2", title: "Define the draft structure", desc: "Identify reusable sections, required client-specific inputs, and human review checkpoints." },
    { week: "Week 3", title: "Test a proposal draft workflow", desc: "Create a lightweight prototype that turns intake answers into a first-draft proposal." },
    { week: "Week 4", title: "Review quality and risks", desc: "Compare AI-assisted drafts against past proposals and decide what still needs human judgment." },
  ],
  recall_followup: [
    { week: "Week 1", title: "Identify follow-up segments", desc: "Pull a small list of overdue recall patients, missed appointments, post-visit follow-ups, or routine scheduling reminders and group them by type." },
    { week: "Week 2", title: "Approve message templates", desc: "Create approved templates for recall reminders, missed appointments, post-visit follow-up, and routine scheduling reminders." },
    { week: "Week 3", title: "Test staff-reviewed drafts", desc: "Generate draft messages for a small low-risk batch and have staff review before sending." },
    { week: "Week 4", title: "Review responses and handoff rules", desc: "Track responses, unclear cases, and situations that should always stay human-handled." },
  ],
  reporting_drafts: [
    { week: "Week 1", title: "Pick one recurring report", desc: "Choose one report that repeats monthly or weekly." },
    { week: "Week 2", title: "Define the standard sections", desc: "Identify the metrics, notes, and explanation sections that appear every cycle." },
    { week: "Week 3", title: "Test narrative drafts", desc: "Generate first-draft summaries from existing metrics and notes." },
    { week: "Week 4", title: "Review insight quality and approval rules", desc: "Compare drafts to past reports and decide what requires human analysis." },
  ],
  onboarding_kits: [
    { week: "Week 1", title: "Map the first 7 days", desc: "List every step a new client, customer, or employee experiences during the first week." },
    { week: "Week 2", title: "Define required inputs", desc: "Identify what information is needed to personalize the onboarding materials." },
    { week: "Week 3", title: "Draft onboarding materials", desc: "Generate a first-draft checklist, welcome message, and next-step guide." },
    { week: "Week 4", title: "Review with a real example", desc: "Test the materials against one real or sample onboarding case and refine." },
  ],
  order_triage: [
    { week: "Week 1", title: "Define routine vs needs-review", desc: "Write down what makes an order routine, needs review, or urgent." },
    { week: "Week 2", title: "Identify common edge cases", desc: "List special requests, address issues, gift notes, returns, or unusual order patterns." },
    { week: "Week 3", title: "Test triage labels", desc: "Apply the labels to a small batch of sample orders or requests." },
    { week: "Week 4", title: "Review misses and refine rules", desc: "Look at missed edge cases and update the triage criteria." },
  ],
  content_repurposing: [
    { week: "Week 1", title: "Pick one approved source story", desc: "Choose a recent launch, case study, service explanation, or announcement." },
    { week: "Week 2", title: "Define target channels", desc: "Decide which channels need different versions, such as email, social, website, or sales follow-up." },
    { week: "Week 3", title: "Generate channel-specific drafts", desc: "Create 3 to 5 drafts adapted to each channel." },
    { week: "Week 4", title: "Review performance and reuse rules", desc: "Decide which formats are reusable and where human editing is required." },
  ],
  generic: GENERIC,
};

export const CATEGORY_TO_ROADMAP: Record<OpportunityCategory, RoadmapKey> = {
  faq_support: "support_reply",
  proposal_estimate: "proposal_drafting",
  customer_followup: "recall_followup",
  reporting_kpi: "reporting_drafts",
  client_onboarding: "onboarding_kits",
  order_management: "order_triage",
  content_repurposing: "content_repurposing",
  lead_intake: "generic",
  appointment_prep: "generic",
  internal_admin: "generic",
};

export function roadmapFor(key: RoadmapKey | undefined): RoadmapWeek[] {
  return ROADMAPS[key ?? "generic"];
}
