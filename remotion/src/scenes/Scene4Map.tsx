import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { Caption } from "../components/Caption";

const OPPS = [
  { name: "Patient recall automation", impact: 92, effort: "Low" },
  { name: "Front-desk FAQ assistant", impact: 78, effort: "Low" },
  { name: "Appointment prep summaries", impact: 64, effort: "Med" },
];

function useEntrance(delay: number, fromX = 0, fromY = 30) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  return {
    opacity: s,
    transform: `translate(${interpolate(s, [0, 1], [fromX, 0])}px, ${interpolate(s, [0, 1], [fromY, 0])}px)`,
    filter: `blur(${interpolate(s, [0, 1], [10, 0])}px)`,
  };
}

export const Scene4Map: React.FC = () => {
  const frame = useCurrentFrame();
  const snap = useEntrance(15, -40, 0);
  const top = useEntrance(28, 40, 0);

  return (
    <AbsoluteFill>
      <Caption step="3" text="Get a prioritized opportunity map" />
      <AbsoluteFill
        style={{
          padding: "180px 100px 80px",
          gap: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          {/* Snapshot */}
          <div
            style={{
              flex: 1,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 20,
              padding: 28,
              ...snap,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: COLORS.muted,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Business snapshot
            </div>
            <div
              style={{
                fontSize: 30,
                color: COLORS.fg,
                fontWeight: 700,
                marginTop: 10,
              }}
            >
              Multi-provider dental clinic
            </div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Local SMB", "Appointment-based", "Recall-driven", "Front-desk heavy"].map(
                (t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 16,
                      color: COLORS.muted,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.surfaceHi,
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
          {/* Top opportunity */}
          <div
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${COLORS.accent}1f, ${COLORS.accentSoft}0a)`,
              border: `1px solid ${COLORS.accent}66`,
              borderRadius: 20,
              padding: 28,
              ...top,
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
              ★ Top recommendation
            </div>
            <div
              style={{
                fontSize: 32,
                color: COLORS.fg,
                fontWeight: 700,
                marginTop: 10,
                lineHeight: 1.15,
              }}
            >
              Automated patient recall workflow
            </div>
            <div
              style={{
                fontSize: 18,
                color: COLORS.muted,
                marginTop: 12,
                fontWeight: 500,
              }}
            >
              High inferred impact · Low effort · Ready to pilot this week
            </div>
          </div>
        </div>

        {/* Opportunities row */}
        <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
          {OPPS.map((o, i) => {
            const st = useEntrance(50 + i * 16, 0, 30);
            const fillS = spring({
              frame: useCurrentFrame() - (70 + i * 16),
              fps: 30,
              config: { damping: 20, stiffness: 120 },
            });
            const fillW = interpolate(fillS, [0, 1], [0, o.impact]);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 18,
                  padding: 24,
                  ...st,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: COLORS.muted,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: COLORS.muted,
                      fontWeight: 600,
                    }}
                  >
                    Effort: {o.effort}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: COLORS.fg,
                    fontWeight: 700,
                    minHeight: 64,
                  }}
                >
                  {o.name}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: COLORS.muted,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Inferred impact</span>
                  <span style={{ color: COLORS.accentSoft }}>
                    {Math.round(fillW)}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: COLORS.surfaceHi,
                    borderRadius: 999,
                    marginTop: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${fillW}%`,
                      background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentSoft})`,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
