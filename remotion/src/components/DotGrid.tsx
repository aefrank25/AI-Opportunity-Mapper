import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

export const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (frame * 0.3) % 40;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 20%, #14213a 0%, ${COLORS.bg} 55%, #060a10 100%)`,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: 0.35 }}
      >
        <defs>
          <pattern
            id="dots"
            x={drift}
            y={drift}
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={1} cy={1} r={1.2} fill="#2b3a52" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask id="m">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" mask="url(#m)" />
      </svg>
      {/* Soft accent glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -200,
          top: -200,
          background: `radial-gradient(circle, ${COLORS.accent}22 0%, transparent 60%)`,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          right: -150,
          bottom: -150,
          background: `radial-gradient(circle, ${COLORS.accentSoft}22 0%, transparent 60%)`,
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};
