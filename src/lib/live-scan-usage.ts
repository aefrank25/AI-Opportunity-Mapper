// Local (no-auth) usage tracking for the Live Scan beta.
// Demo and prototype runs are NOT counted here.

const KEY = "aiom:live-scan-usage";
const FREE_PER_DAY = 1;
const EMAIL_BONUS = 2;
const MAX_PER_DAY = FREE_PER_DAY + EMAIL_BONUS;

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

