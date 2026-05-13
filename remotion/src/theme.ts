import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const COLORS = {
  bg: "#0B0F14",
  surface: "#121821",
  surfaceHi: "#1A2230",
  border: "#222C3A",
  fg: "#F5F7FA",
  muted: "#8A95A5",
  accent: "#3B82F6",
  accentSoft: "#60A5FA",
  good: "#34D399",
};
