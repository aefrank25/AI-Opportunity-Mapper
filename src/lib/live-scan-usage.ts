// Local (no-auth) usage tracking for the Live Scan beta.
// Demo and prototype runs are NOT counted here.

const KEY = "aiom:live-scan-usage";
const OWNER_KEY = "aiom:owner-bypass";
const OWNER_TOKEN = "bypass-xy7q2k";
const FREE_PER_DAY = 1;
const EMAIL_BONUS = 2;
const MAX_PER_DAY = FREE_PER_DAY + EMAIL_BONUS;

/**
 * Owner-only bypass: visit any page with ?owner=<token> once to flip the
 * flag in localStorage. After that, this browser skips the daily limit and
 * its scans are never counted. Clear with localStorage.removeItem("aiom:owner-bypass").
 */
export function isOwnerBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OWNER_KEY) === "1";
  } catch {
    return false;
  }
}

export function maybeActivateOwnerBypassFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("owner");
    if (!token) return;
    if (token === OWNER_TOKEN) {
      localStorage.setItem(OWNER_KEY, "1");
    } else if (token === "off") {
      localStorage.removeItem(OWNER_KEY);
    }
    // Strip the param from the URL so it's not shared accidentally.
    params.delete("owner");
    const qs = params.toString();
    const next = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState(null, "", next);
  } catch {
    /* noop */
  }
}

export interface LiveScanUsage {
  date: string; // YYYY-MM-DD
  used: number;
  emailBonusUnlocked: boolean;
  capturedEmail?: string;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyUsage(): LiveScanUsage {
  return { date: todayStr(), used: 0, emailBonusUnlocked: false };
}

export function getUsage(): LiveScanUsage {
  if (typeof window === "undefined") return emptyUsage();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyUsage();
    const parsed = JSON.parse(raw) as LiveScanUsage;
    if (parsed.date !== todayStr()) return emptyUsage();
    return parsed;
  } catch {
    return emptyUsage();
  }
}

function save(u: LiveScanUsage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function liveScanLimit(u: LiveScanUsage = getUsage()): number {
  return u.emailBonusUnlocked ? MAX_PER_DAY : FREE_PER_DAY;
}

export function liveScansRemaining(u: LiveScanUsage = getUsage()): number {
  return Math.max(0, liveScanLimit(u) - u.used);
}

export type LiveScanGate =
  | { allowed: true; remaining: number }
  | { allowed: false; reason: "needs_email" | "limit_reached"; usage: LiveScanUsage };

export function checkLiveScanGate(): LiveScanGate {
  if (isOwnerBypass()) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY };
  }
  const u = getUsage();
  if (u.used < liveScanLimit(u)) {
    return { allowed: true, remaining: liveScanLimit(u) - u.used };
  }
  if (!u.emailBonusUnlocked) {
    return { allowed: false, reason: "needs_email", usage: u };
  }
  return { allowed: false, reason: "limit_reached", usage: u };
}

export function recordLiveScanSuccess(): LiveScanUsage {
  const u = getUsage();
  if (isOwnerBypass()) return u; // owner scans are never counted
  const next = { ...u, used: u.used + 1 };
  save(next);
  return next;
}

export function unlockEmailBonus(email: string): LiveScanUsage {
  const u = getUsage();
  const next: LiveScanUsage = {
    ...u,
    emailBonusUnlocked: true,
    capturedEmail: email,
  };
  save(next);
  return next;
}

export function hasSubmittedEmail(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as LiveScanUsage;
    return !!parsed.capturedEmail || parsed.emailBonusUnlocked === true;
  } catch {
    return false;
  }
}

export const LIVE_SCAN_LIMITS = {
  FREE_PER_DAY,
  EMAIL_BONUS,
  MAX_PER_DAY,
};

