export type ScoreLevel = "Low" | "Medium" | "High";

export type Priority =
  | "save_time"
  | "more_leads"
  | "follow_up"
  | "reduce_admin"
  | "customer_experience"
  | "reporting"
  | "not_sure";

export const PRIORITY_LABELS: Record<Priority, string> = {
  save_time: "Save time",
  more_leads: "Get more leads",
  follow_up: "Improve follow-up",
  reduce_admin: "Reduce admin work",
  customer_experience: "Improve customer experience",
  reporting: "Improve reporting",
  not_sure: "Not sure",
};

export type OpportunityCategory =
  | "lead_intake"
  | "customer_followup"
  | "appointment_prep"
  | "faq_support"
  | "internal_admin"
  | "reporting_kpi"
  | "content_repurposing"
  | "proposal_estimate"
  | "order_management"
  | "client_onboarding";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  name: string;
  description: string;
  signal: string;
  painPoint: string;
  improvement: string;
  firstStep: string;
  impact: ScoreLevel;
  effort: ScoreLevel;
  confidence: ScoreLevel;
  automationRisk: ScoreLevel;
  whyItMatters: string;
}

export interface BusinessSnapshot {
  summary: string;
  audience: string[];
  signals: string[];
  workflowAreas: string[];
}

export interface QuickWin {
  title: string;
  action: string;
}

export interface AnalysisResult {
  url: string;
  displayUrl: string;
  priority: Priority;
  isDemo: boolean;
  demoLabel?: string;
  snapshot: BusinessSnapshot;
  topOpportunity: Opportunity;
  opportunities: Opportunity[]; // 3 total, includes top
  quickWins: QuickWin[];
}
