import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Caption: React.FC<{ step?: string; text: string }> = ({
  step,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 220 },
  });
  const y = interpolate(s, [0, 1], [16, 0]);
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const blur = interpolate(s, [0, 1], [10, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 80,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {step && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 999,
            background: COLORS.primary,
            color: "white",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {step}
        </span>
      )}
      <span
        style={{
          color: COLORS.fg,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -0.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};
