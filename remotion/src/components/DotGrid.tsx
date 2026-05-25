import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

// Subtle light background with drifting dot grid + soft primary glow.
export const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (frame * 0.25) % 40;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${COLORS.accentBg} 0%, ${COLORS.bg} 55%, ${COLORS.bgTint} 100%)`,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: 0.5 }}
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
            <circle cx={1} cy={1} r={1.1} fill="#C7D2E1" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask id="m">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" mask="url(#m)" />
      </svg>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -220,
          top: -260,
          background: `radial-gradient(circle, ${COLORS.accent}22 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          right: -180,
          bottom: -200,
          background: `radial-gradient(circle, ${COLORS.primary}1A 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};
