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
  { week: "Week 1", title: "Gather proposal examples", tag: "Start here" },
  { week: "Week 2", title: "Define the draft structure", tag: "Shape" },
  { week: "Week 3", title: "Test a proposal draft workflow", tag: "Pilot" },
  { week: "Week 4", title: "Review quality and risks", tag: "Validate" },
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
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: COLORS.accentBg,
                  color: COLORS.primary,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: COLORS.accent,
                  }}
                />
                4-week starter roadmap
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.fg,
                }}
              >
                Your first month, mapped out
              </div>
              <div style={{ color: COLORS.muted, fontSize: 15, marginTop: 4 }}>
                A simple cadence to take the top opportunity from idea to
                validated prototype.
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            style={{
              marginTop: 26,
              position: "relative",
              paddingTop: 22,
            }}
          >
            {/* Track */}
            <div
              style={{
                position: "absolute",
                top: 22 + 18,
                left: `${100 / (WEEKS.length * 2)}%`,
                right: `${100 / (WEEKS.length * 2)}%`,
                height: 4,
                borderRadius: 999,
                background: COLORS.border,
              }}
            />
            {/* Animated progress fill */}
            <div
              style={{
                position: "absolute",
                top: 22 + 18,
                left: `${100 / (WEEKS.length * 2)}%`,
                width: `${
                  (100 - (100 / (WEEKS.length * 2)) * 2) *
                  interpolate(
                    spring({
                      frame: frame - 50,
                      fps,
                      config: { damping: 30, stiffness: 80 },
                    }),
                    [0, 1],
                    [0, 1],
                  )
                }%`,
                height: 4,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`,
                boxShadow: `0 0 14px ${COLORS.accent}55`,
              }}
            />

            <div style={{ display: "flex", gap: 16, position: "relative" }}>
              {WEEKS.map((w, i) => {
                const s = spring({
                  frame: frame - 60 - i * 14,
                  fps,
                  config: { damping: 22, stiffness: 200 },
                });
                const isFirst = i === 0;
                return (
                  <div
                    key={w.week}
                    style={{
                      flex: 1,
                      opacity: s,
                      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* Node */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        background: isFirst
                          ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`
                          : COLORS.surface,
                        color: isFirst ? "white" : COLORS.primary,
                        border: isFirst
                          ? "none"
                          : `2px solid ${COLORS.primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 800,
                        boxShadow: isFirst
                          ? `0 6px 18px ${COLORS.primary}55`
                          : `0 2px 6px ${COLORS.primary}15`,
                        zIndex: 1,
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Card */}
                    <div
                      style={{
                        marginTop: 16,
                        width: "100%",
                        borderRadius: 14,
                        background: COLORS.surface,
                        border: `1px solid ${isFirst ? COLORS.accent : COLORS.border}`,
                        padding: 18,
                        boxShadow: isFirst
                          ? `0 12px 28px -16px ${COLORS.primary}55`
                          : `0 4px 12px -8px ${COLORS.primary}15`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: isFirst
                            ? COLORS.primary
                            : COLORS.bgTint,
                          color: isFirst ? "white" : COLORS.muted,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                        }}
                      >
                        {w.tag}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
