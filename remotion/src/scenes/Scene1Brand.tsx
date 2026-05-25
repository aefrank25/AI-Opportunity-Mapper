import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { BrandMark } from "../components/AppChrome";

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
  const s4 = spring({
    frame: frame - 42,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const blur1 = interpolate(s1, [0, 1], [12, 0]);
  const y1 = interpolate(s1, [0, 1], [20, 0]);
  const blur2 = interpolate(s2, [0, 1], [16, 0]);
  const y2 = interpolate(s2, [0, 1], [24, 0]);
  const y3 = interpolate(s3, [0, 1], [16, 0]);
  const y4 = interpolate(s4, [0, 1], [16, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          opacity: s1,
          transform: `translateY(${y1}px)`,
          filter: `blur(${blur1}px)`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 20px",
          borderRadius: 999,
          border: `1px solid ${COLORS.accent}55`,
          background: COLORS.accentBg,
          color: COLORS.primary,
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: COLORS.accent,
          }}
        />
        Practical AI Discovery
      </div>

      <div
        style={{
          marginTop: 44,
          opacity: s2,
          transform: `translateY(${y2}px)`,
          filter: `blur(${blur2}px)`,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <BrandMark size={86} />
        <div
          style={{
            color: COLORS.fg,
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          AI Opportunity Mapper
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          opacity: s3,
          transform: `translateY(${y3}px)`,
          color: COLORS.fg,
          fontSize: 70,
          fontWeight: 700,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
          maxWidth: 1500,
        }}
      >
        Find practical AI opportunities
        <br />
        for any business.
      </div>

      <div
        style={{
          marginTop: 28,
          opacity: s4,
          transform: `translateY(${y4}px)`,
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
