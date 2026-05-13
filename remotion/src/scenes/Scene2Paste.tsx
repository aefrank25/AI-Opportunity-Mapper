import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { Caption } from "../components/Caption";

const TYPED = "acme-dental.com";

export const Scene2Paste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardBlur = interpolate(cardSpring, [0, 1], [10, 0]);

  // typing starts at frame 35
  const typeStart = 35;
  const typeSpeed = 3.5; // frames per character
  const typedCount = Math.max(
    0,
    Math.min(TYPED.length, Math.floor((frame - typeStart) / typeSpeed)),
  );
  const text = TYPED.slice(0, typedCount);
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  // button pulse near end
  const btnPulse = spring({
    frame: frame - 100,
    fps,
    config: { damping: 8, stiffness: 220 },
  });
  const btnScale = 1 + interpolate(btnPulse, [0, 1], [0, 0.06]);

  return (
    <AbsoluteFill>
      <Caption step="1" text="Paste a business URL" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1200,
            opacity: cardSpring,
            transform: `translateY(${cardY}px)`,
            filter: `blur(${cardBlur}px)`,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: 32,
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.border}`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: COLORS.muted,
              fontWeight: 500,
              marginBottom: 14,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Business website
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                flex: 1,
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "26px 28px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 36,
                color: COLORS.fg,
                fontWeight: 500,
              }}
            >
              <span style={{ color: COLORS.muted, fontSize: 28 }}>https://</span>
              <span>{text}</span>
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 38,
                  background: cursorOn ? COLORS.accent : "transparent",
                  marginLeft: 2,
                }}
              />
            </div>
            <div
              style={{
                background: COLORS.accent,
                color: "white",
                borderRadius: 16,
                padding: "26px 40px",
                fontSize: 28,
                fontWeight: 700,
                transform: `scale(${btnScale})`,
                boxShadow: `0 10px 40px ${COLORS.accent}66`,
              }}
            >
              Scan →
            </div>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 18,
              color: COLORS.muted,
              fontWeight: 500,
            }}
          >
            Free · No signup · Live scan beta
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
