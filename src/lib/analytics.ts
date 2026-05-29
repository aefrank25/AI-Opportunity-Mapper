import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const STORAGE_KEY = "aiom.cookieConsent.v1";
const EVENT_NAME = "aiom:consent-changed";

export type ConsentPrefs = {
  essential: true;
  analytics: boolean;
  decidedAt: string;
};

export function getConsent(): { analytics: boolean; decided: boolean } {
  if (typeof window === "undefined") return { analytics: false, decided: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { analytics: false, decided: false };
    const parsed = JSON.parse(raw) as ConsentPrefs;
    return { analytics: !!parsed.analytics, decided: true };
  } catch {
    return { analytics: false, decided: false };
  }
}

export function setConsent(analytics: boolean) {
  if (typeof window === "undefined") return;
  const prefs: ConsentPrefs = {
    essential: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: prefs }));
}

// Personal opt-out: set `localStorage.setItem("aiom:dnt", "1")` in your
// browser console once to permanently exclude this browser from analytics.
// Clear with `localStorage.removeItem("aiom:dnt")`.
function isSelfExcluded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("aiom:dnt") === "1";
  } catch {
    return false;
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (isSelfExcluded()) return;
  const { analytics } = getConsent();
  if (!analytics) return;


  const payload = {
    name,
    props: props ?? {},
    path: window.location.pathname + window.location.search,
    ts: new Date().toISOString(),
  };

  // Future GA/GTM hookup point
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: name, ...payload });
  }

  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/public/analytics", blob);
      if (ok) return;
    }
    void fetch("/api/public/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function useAnalyticsConsent() {
  const [analytics, setAnalyticsState] = useState(false);
  useEffect(() => {
    setAnalyticsState(getConsent().analytics);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPrefs>).detail;
      setAnalyticsState(!!detail?.analytics);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);
  return analytics;
}

export function usePageviewTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const analytics = useAnalyticsConsent();
  useEffect(() => {
    if (!analytics) return;
    trackEvent("pageview", { path: pathname });
  }, [pathname, analytics]);
}
