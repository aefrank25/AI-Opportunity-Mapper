import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { BrandMark } from "../components/AppChrome";

export const Scene7Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });
  const s2 = spring({
    frame: frame - 16,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const s3 = spring({
    frame: frame - 38,
    fps,
    config: { damping: 22, stiffness: 180 },
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
          transform: `translateY(${interpolate(s1, [0, 1], [20, 0])}px) scale(${interpolate(s1, [0, 1], [0.9, 1])})`,
        }}
      >
        <BrandMark size={110} />
      </div>
      <div
        style={{
          marginTop: 36,
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [20, 0])}px)`,
          fontSize: 64,
          fontWeight: 800,
          color: COLORS.fg,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Find what AI can do
        <br />
        for your business — in 60 seconds.
      </div>
      <div
        style={{
          marginTop: 36,
          opacity: s3,
          transform: `translateY(${interpolate(s3, [0, 1], [12, 0])}px)`,
          padding: "14px 28px",
          borderRadius: 999,
          background: COLORS.primary,
          color: "white",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -0.3,
          boxShadow: `0 20px 40px -20px ${COLORS.primary}99`,
        }}
      >
        ai-opp-mapper.lovable.app
      </div>
    </AbsoluteFill>
  );
};
