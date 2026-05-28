// ============================================================================
// Product analytics — ONE centralized helper for all product events.
//
// Every event flows through `trackEvent()` (src/lib/analytics.ts), which:
//   • is gated by the visitor's analytics cookie consent,
//   • POSTs the event to the existing backend capture endpoint
//     (/api/public/analytics → analytics_events table in Supabase),
//   • fails silently — it never throws and never blocks the UI/scan.
//
// No client-side PostHog / VITE keys. No third-party analytics SDK.
//
// HOW TO ADD A NEW EVENT
//   1. Add a small typed `track*` function below with a JSDoc comment that
//      lists when it fires and its properties.
//   2. Call it from the relevant component/route.
//   3. If it should show up on the admin dashboard, add the event name to
//      PRODUCT_EVENT_NAMES in admin-product-analytics.functions.ts.
//
// Every event is automatically enriched with an anonymous visitor id (`vid`)
// so the dashboard can compute unique visitors, repeat-user rate, and average
// scans per user without any personal data.
// ============================================================================

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

// --- localStorage keys (anonymous, no PII) ---------------------------------
const VID_KEY = "aiom:analytics:vid"; // stable anonymous visitor id
const VISITS_KEY = "aiom:analytics:visits"; // total visit/session count
const SESSION_KEY = "aiom:analytics:session"; // per-tab session marker
const SCANS_KEY = "aiom:analytics:scans"; // total scans started by this browser

export type ScanType = "live_scan" | "demo" | "prototype";

// ---------------------------------------------------------------------------
// Anonymous visitor id — created once per browser, attached to every event.
// ---------------------------------------------------------------------------
function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let vid = localStorage.getItem(VID_KEY);
    if (!vid) {
      vid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VID_KEY, vid);
    }
    return vid;
  } catch {
    return "unknown";
  }
}

function readInt(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeInt(key: string, value: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

// Core emit: enrich with the anonymous visitor id, then hand off to the
// consent-gated, silent-failing backend tracker.
function emit(name: string, props: Record<string, unknown> = {}) {
  trackEvent(name, { vid: getVisitorId(), ...props });
}

// ===========================================================================
// LANDING + TRAFFIC
// ===========================================================================

/**
 * page_view — fired on every route change.
 * props: page, referrer, utm_source, utm_medium, utm_campaign
 * Also drives the `returning_user` retention signal (see below).
 */
export function trackPageView() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  emit("page_view", {
    page: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  });
  maybeTrackReturningUser();
}

/**
 * returning_user — fired once per new session when the visitor has been here
 * before. props: return_count (how many prior visits this browser has had).
 */
function maybeTrackReturningUser() {
  if (typeof window === "undefined") return;
  let isNewSession = false;
  try {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, "1");
      isNewSession = true;
    }
  } catch {
    /* ignore */
  }
  if (!isNewSession) return;

  const visits = readInt(VISITS_KEY) + 1;
  writeInt(VISITS_KEY, visits);
  if (visits >= 2) {
    emit("returning_user", { return_count: visits - 1 });
  }
}

// ===========================================================================
// SCAN FUNNEL
// ===========================================================================

/**
 * scan_started — fired when any scan kicks off (live / demo / prototype).
 * props: website_domain, selected_priority, scan_type
 * Also drives the `repeat_scan` retention signal.
 */
export function trackScanStarted(args: {
  websiteDomain: string | null;
  selectedPriority: string | null;
  scanType: ScanType;
}) {
  emit("scan_started", {
    website_domain: args.websiteDomain,
    selected_priority: args.selectedPriority,
    scan_type: args.scanType,
  });

  // repeat_scan — total_scans_by_user counts every scan this browser starts.
  const scans = readInt(SCANS_KEY) + 1;
  writeInt(SCANS_KEY, scans);
  if (scans >= 2) {
    emit("repeat_scan", { total_scans_by_user: scans });
  }
}

/**
 * scan_completed — fired when a scan finishes successfully.
 * props: website_domain, selected_priority, scan_type, pages_scanned,
 *        scan_duration_seconds, success:true
 */
export function trackScanCompleted(args: {
  websiteDomain: string | null;
  selectedPriority: string | null;
  scanType: ScanType;
  pagesScanned: number | null;
  scanDurationSeconds: number | null;
}) {
  emit("scan_completed", {
    website_domain: args.websiteDomain,
    selected_priority: args.selectedPriority,
    scan_type: args.scanType,
    pages_scanned: args.pagesScanned,
    scan_duration_seconds: args.scanDurationSeconds,
    success: true,
  });
}

/**
 * scan_failed — fired when a scan errors out.
 * props: website_domain, scan_type, failure_reason, success:false
 */
export function trackScanFailed(args: {
  websiteDomain: string | null;
  scanType: ScanType;
  failureReason: string;
}) {
  emit("scan_failed", {
    website_domain: args.websiteDomain,
    scan_type: args.scanType,
    failure_reason: args.failureReason,
    success: false,
  });
}

// ===========================================================================
// ACTIVATION + USAGE
// ===========================================================================

/**
 * results_viewed — fired when the opportunity map renders.
 * props: website_domain, selected_priority, scan_type
 */
export function trackResultsViewed(args: {
  websiteDomain: string | null;
  selectedPriority: string | null;
  scanType: ScanType;
}) {
  emit("results_viewed", {
    website_domain: args.websiteDomain,
    selected_priority: args.selectedPriority,
    scan_type: args.scanType,
  });
}

/**
 * scan_limit_reached — fired when the daily Live Scan limit is hit.
 * props: scans_used_today
 */
export function trackScanLimitReached(args: { scansUsedToday: number }) {
  emit("scan_limit_reached", { scans_used_today: args.scansUsedToday });
}

/** email_unlock_shown — fired when the "enter email for more scans" prompt appears. */
export function trackEmailUnlockShown() {
  emit("email_unlock_shown");
}

/** email_unlock_completed — fired when the visitor submits that email. */
export function trackEmailUnlockCompleted() {
  emit("email_unlock_completed");
}

// ===========================================================================
// INTEREST + MONETIZATION SIGNALS (high priority)
// ===========================================================================

/**
 * expanded_analysis_interest — fired when a visitor signals demand for the
 * paid/expanded report: submits a notify email OR clicks an expanded-analysis CTA.
 * props: website_domain
 */
export function trackExpandedAnalysisInterest(args: { websiteDomain?: string | null } = {}) {
  emit("expanded_analysis_interest", { website_domain: args.websiteDomain ?? null });
}

/**
 * export_interest — fired when a visitor engages with export / download /
 * report functionality (even before it ships).
 * props: website_domain
 */
export function trackExportInterest(args: { websiteDomain?: string | null } = {}) {
  emit("export_interest", { website_domain: args.websiteDomain ?? null });
}

/**
 * client_use_interest — fired when a visitor engages with consultant /
 * client-facing workflow language or signals desire to use this with clients.
 * props: website_domain
 */
export function trackClientUseInterest(args: { websiteDomain?: string | null } = {}) {
  emit("client_use_interest", { website_domain: args.websiteDomain ?? null });
}

/**
 * feedback_submitted — fired when the feedback widget is submitted.
 * props: feedback_length, website_domain
 */
export function trackFeedbackSubmitted(args: {
  feedbackLength: number;
  websiteDomain?: string | null;
}) {
  emit("feedback_submitted", {
    feedback_length: args.feedbackLength,
    website_domain: args.websiteDomain ?? null,
  });
}

// ===========================================================================
// VIDEO + CONTENT
// ===========================================================================

/** video_played — fired when the demo video starts playing. props: video_name */
export function trackVideoPlayed(args: { videoName: string }) {
  emit("video_played", { video_name: args.videoName });
}

/** video_completed — fired when the demo video finishes. props: video_name */
export function trackVideoCompleted(args: { videoName: string }) {
  emit("video_completed", { video_name: args.videoName });
}

// ===========================================================================
// Hook: fire page_view on every route change.
// ===========================================================================
export function useProductPageviewTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    trackPageView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
