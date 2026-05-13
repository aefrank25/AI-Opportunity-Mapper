import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { Caption } from "../components/Caption";

const ITEMS = [
  "Reading site pages",
  "Detecting workflow signals",
  "Inferring audience & offers",
  "Mapping AI opportunities",
];

export const Scene3Analyzing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Caption step="2" text="We read the site" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 1100, position: "relative" }}>
          {ITEMS.map((label, i) => {
            const start = 20 + i * 22;
            const s = spring({
              frame: frame - start,
              fps,
              config: { damping: 20, stiffness: 200 },
            });
            const y = interpolate(s, [0, 1], [20, 0]);
            const checkStart = start + 12;
            const checkS = spring({
              frame: frame - checkStart,
              fps,
              config: { damping: 12, stiffness: 220 },
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "26px 32px",
                  marginBottom: 16,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 18,
                  opacity: s,
                  transform: `translateY(${y}px)`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background:
                      checkS > 0.1 ? COLORS.good : `${COLORS.surfaceHi}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${0.8 + checkS * 0.2})`,
                    transition: "none",
                  }}
                >
                  {checkS > 0.1 && (
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="white"
                        strokeWidth={3.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={30}
                        strokeDashoffset={30 - checkS * 30}
                      />
                    </svg>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    color: COLORS.fg,
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: checkS > 0.5 ? COLORS.good : COLORS.muted,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {checkS > 0.5 ? "Done" : "…"}
                </div>
              </div>
            );
          })}

          {/* scanning sweep */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: interpolate(
                (frame % 75) / 75,
                [0, 1],
                [-40, 480],
              ),
              height: 60,
              background: `linear-gradient(180deg, transparent, ${COLORS.accent}33, transparent)`,
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
