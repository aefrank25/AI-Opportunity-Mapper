import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

export const Scene1Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });
  const s2 = spring({
    frame: frame - 14,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const s3 = spring({
    frame: frame - 28,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const blur1 = interpolate(s1, [0, 1], [12, 0]);
  const y1 = interpolate(s1, [0, 1], [20, 0]);
  const blur2 = interpolate(s2, [0, 1], [12, 0]);
  const y2 = interpolate(s2, [0, 1], [20, 0]);
  const y3 = interpolate(s3, [0, 1], [16, 0]);

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
          transform: `translateY(${y1}px)`,
          filter: `blur(${blur1}px)`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "10px 20px",
          borderRadius: 999,
          border: `1px solid ${COLORS.border}`,
          background: `${COLORS.surface}aa`,
          color: COLORS.muted,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: COLORS.accent,
            boxShadow: `0 0 16px ${COLORS.accent}`,
          }}
        />
        AI Opportunity Mapper
      </div>
      <div
        style={{
          marginTop: 36,
          opacity: s2,
          transform: `translateY(${y2}px)`,
          filter: `blur(${blur2}px)`,
          color: COLORS.fg,
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: -3,
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: 1500,
        }}
      >
        Practical AI ideas
        <br />
        for any business.
      </div>
      <div
        style={{
          marginTop: 32,
          opacity: s3,
          transform: `translateY(${y3}px)`,
          color: COLORS.muted,
          fontSize: 28,
          fontWeight: 500,
        }}
      >
        Paste a URL. Get a prioritized opportunity map.
      </div>
    </AbsoluteFill>
  );
};
