import { trackEvent } from "@/lib/analytics";
import type { Priority, ResultMode, RoadmapKey } from "@/lib/types";

export type ExpandedMapSourceSection =
  | "opportunity_card"
  | "roadmap_card"
  | "expanded_map_section";

export interface ExpandedMapFunnelContext {
  result_mode: ResultMode;
  selected_priority: Priority;
  inferred_business_type: RoadmapKey | "unknown";
  pages_scanned: number | null;
}

export type ExpandedMapEvent =
  | "expanded_map_viewed"
  | "expanded_map_request_clicked"
  | "expanded_map_email_started"
  | "expanded_map_consent_checked"
  | "expanded_map_submitted"
  | "expanded_map_submit_error";

export function trackExpandedMap(
  event: ExpandedMapEvent,
  context: ExpandedMapFunnelContext,
  extras: Record<string, unknown> = {},
) {
  trackEvent(event, { ...context, ...extras });
}
