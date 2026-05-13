import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

export const Scene6Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });
  const s2 = spring({
    frame: frame - 14,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const s3 = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 220 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          opacity: s1,
          transform: `translateY(${interpolate(s1, [0, 1], [16, 0])}px)`,
          color: COLORS.fg,
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -2.5,
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: 1500,
        }}
      >
        Find what AI can do
        <br />
        for your business —
        <br />
        <span
          style={{
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentSoft})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          in 60 seconds.
        </span>
      </div>
      <div
        style={{
          marginTop: 44,
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [16, 0])}px)`,
          color: COLORS.muted,
          fontSize: 24,
          fontWeight: 500,
        }}
      >
        Free · No signup · Live scan beta
      </div>
      <div
        style={{
          marginTop: 36,
          opacity: s3,
          transform: `scale(${interpolate(s3, [0, 1], [0.92, 1])})`,
          padding: "20px 40px",
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 999,
          color: COLORS.fg,
          fontSize: 28,
          fontWeight: 600,
          boxShadow: `0 0 40px ${COLORS.accent}33`,
        }}
      >
        ai-opp-mapper.lovable.app
      </div>
    </AbsoluteFill>
  );
};
