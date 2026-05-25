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

const STEPS = [
  "Interpreting business context",
  "Mapping likely workflow patterns",
  "Identifying practical AI use cases",
  "Ranking opportunities by impact, effort, confidence, and automation risk",
];

export const Scene3Analyzing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardY = interpolate(cardSpring, [0, 1], [30, 0]);

  // Progress bar 0→1 over ~150 frames
  const progress = interpolate(frame, [25, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each step's "active" window
  const stepStart = [25, 60, 110, 155];
  const stepDone = [60, 110, 155, 200];

  return (
    <AbsoluteFill>
      <Caption step="2" text="We read the public website" />
      <AppChrome>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 60,
          }}
        >
          <div
            style={{
              opacity: cardOpacity,
              transform: `translateY(${cardY}px)`,
              width: 1100,
              borderRadius: 22,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: `0 30px 60px -30px ${COLORS.primary}33`,
              padding: 44,
            }}
          >
            <div
              style={{
                color: COLORS.muted,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Generating opportunity map for
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 38,
                fontWeight: 700,
                color: COLORS.fg,
                letterSpacing: -0.8,
              }}
            >
              Marketing agency —{" "}
              <span style={{ color: COLORS.primary }}>northbeam-agency.com</span>
            </div>

            <div
              style={{
                marginTop: 28,
                height: 4,
                borderRadius: 999,
                background: COLORS.bgTint,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`,
                  borderRadius: 999,
                }}
              />
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {STEPS.map((label, i) => {
                const active = frame >= stepStart[i] && frame < stepDone[i];
                const done = frame >= stepDone[i];
                const enter = spring({
                  frame: frame - stepStart[i] + 10,
                  fps,
                  config: { damping: 22, stiffness: 200 },
                });
                const itemOpacity = interpolate(enter, [0, 1], [0.5, 1]);
                return (
                  <div
                    key={label}
                    style={{
                      opacity: itemOpacity,
                      borderRadius: 14,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      background: active
                        ? COLORS.accentBg
                        : COLORS.surfaceAlt,
                      border: `1px solid ${
                        active ? `${COLORS.accent}55` : COLORS.border
                      }`,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: done
                          ? COLORS.good
                          : active
                            ? COLORS.accent
                            : COLORS.bgTint,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    >
                      {done ? "✓" : active ? "•" : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 19,
                        fontWeight: 600,
                        color: COLORS.fg,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 24,
                color: COLORS.mutedSoft,
                fontSize: 14,
              }}
            >
              Reading public pages only. Recommendations should be validated
              before implementation.
            </div>
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
