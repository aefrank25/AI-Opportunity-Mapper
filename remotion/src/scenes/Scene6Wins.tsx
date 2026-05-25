import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { AppChrome } from "../components/AppChrome";
import { Caption } from "../components/Caption";

const WINS = [
  {
    title: "Pick your 3 best proposals",
    desc: "Use them as examples for structure, tone, and reusable sections.",
  },
  {
    title: "Lock one report template",
    desc: "Standardize the monthly structure before automating the draft.",
  },
  {
    title: "Define a kickoff template",
    desc: "Capture the same core inputs before each new engagement.",
  },
];

const WEEKS = [
  { week: "Week 1", title: "Gather proposal examples" },
  { week: "Week 2", title: "Define the draft structure" },
  { week: "Week 3", title: "Test a proposal draft workflow" },
  { week: "Week 4", title: "Review quality and risks" },
];

export const Scene6Quickwins: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Caption step="5" text="Quick wins this week · 4-week roadmap" />
      <AppChrome>
        {/* Quick wins */}
        <div style={{ paddingTop: 30 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.fg,
            }}
          >
            Quick wins
          </div>
          <div style={{ color: COLORS.muted, fontSize: 15, marginTop: 4 }}>
            Small, low-risk moves to set up your highest-leverage opportunities.
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
            {WINS.map((w, i) => {
              const s = spring({
                frame: frame - 10 - i * 12,
                fps,
                config: { damping: 22, stiffness: 200 },
              });
              return (
                <div
                  key={w.title}
                  style={{
                    flex: 1,
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                    borderRadius: 16,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    padding: 22,
                    boxShadow: `0 10px 24px -18px ${COLORS.primary}25`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: COLORS.accentBg,
                      color: COLORS.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    ✦
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 19,
                      fontWeight: 700,
                      color: COLORS.fg,
                    }}
                  >
                    {w.title}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: COLORS.muted,
                      fontSize: 15,
                      lineHeight: 1.5,
                    }}
                  >
                    {w.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Starter roadmap */}
        <div style={{ marginTop: 36 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.fg,
            }}
          >
            Starter roadmap preview
          </div>
          <div style={{ color: COLORS.muted, fontSize: 15, marginTop: 4 }}>
            A simple cadence to take the top opportunity from idea to validated
            prototype.
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
            {WEEKS.map((w, i) => {
              const s = spring({
                frame: frame - 60 - i * 14,
                fps,
                config: { damping: 22, stiffness: 200 },
              });
              return (
                <div
                  key={w.week}
                  style={{
                    flex: 1,
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                    borderRadius: 14,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: COLORS.primary,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      color: COLORS.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {w.week}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 17,
                      fontWeight: 700,
                      color: COLORS.fg,
                      lineHeight: 1.3,
                    }}
                  >
                    {w.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
