import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { Caption } from "../components/Caption";

const WINS = [
  "Draft recall SMS templates by visit type",
  "Auto-summarize new patient intake forms",
  "Reply suggestions for common front-desk questions",
];

const ROADMAP = [
  { week: "Week 1", text: "Pick one workflow, draft prompts" },
  { week: "Week 2", text: "Pilot with one provider" },
  { week: "Week 3", text: "Measure handle time saved" },
  { week: "Week 4", text: "Roll out to whole clinic" },
];

export const Scene5Wins: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Caption text="Quick wins this week · 30-day roadmap" />
      <AbsoluteFill
        style={{
          padding: "180px 100px 80px",
          display: "flex",
          flexDirection: "row",
          gap: 28,
        }}
      >
        {/* Quick wins */}
        <div
          style={{
            flex: 1,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 22,
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: COLORS.accentSoft,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            ⚡ Quick wins
          </div>
          <div style={{ marginTop: 18 }}>
            {WINS.map((w, i) => {
              const s = spring({
                frame: frame - (15 + i * 14),
                fps,
                config: { damping: 22, stiffness: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    padding: "16px 0",
                    borderBottom:
                      i < WINS.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${COLORS.accent}33`,
                      color: COLORS.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 16,
                      marginTop: 4,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      color: COLORS.fg,
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {w}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap */}
        <div
          style={{
            flex: 1,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 22,
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: COLORS.muted,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            🗺 30-day roadmap
          </div>
          <div style={{ marginTop: 18, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 14,
                bottom: 14,
                width: 2,
                background: COLORS.border,
              }}
            />
            {ROADMAP.map((r, i) => {
              const s = spring({
                frame: frame - (25 + i * 14),
                fps,
                config: { damping: 22, stiffness: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 22,
                    padding: "12px 0",
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: COLORS.surface,
                      border: `2px solid ${COLORS.accent}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: COLORS.accent,
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        color: COLORS.accentSoft,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      {r.week}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        color: COLORS.fg,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {r.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
