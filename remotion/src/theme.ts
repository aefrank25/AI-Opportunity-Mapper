import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Palette matched to the actual app (light theme).
export const COLORS = {
  bg: "#F5F7FA",
  bgTint: "#EEF2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  border: "#E5E9F0",
  borderStrong: "#D6DDE8",
  fg: "#0B1220",
  fgSoft: "#1F2937",
  muted: "#64748B",
  mutedSoft: "#94A3B8",
  primary: "#1E3A8A",
  primaryDeep: "#152C6B",
  accent: "#3B82F6",
  accentSoft: "#60A5FA",
  accentBg: "#EAF1FE",
  good: "#16A34A",
  goodSoft: "#22C55E",
  warn: "#F59E0B",
  danger: "#DC2626",
};
