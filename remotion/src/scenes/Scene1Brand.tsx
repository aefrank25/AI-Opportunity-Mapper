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
    frame: frame - 30,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const s4 = spring({
    frame: frame - 46,
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  const y1 = interpolate(s1, [0, 1], [20, 0]);
  const y2 = interpolate(s2, [0, 1], [24, 0]);
  const y3 = interpolate(s3, [0, 1], [16, 0]);
  const y4 = interpolate(s4, [0, 1], [16, 0]);

  const stats: { value: string; label: string }[] = [
    { value: "60s", label: "from URL to roadmap" },
    { value: "5–10", label: "prioritized AI wins" },
    { value: "4-wk", label: "rollout plan" },
  ];

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
          marginTop: 24,
          opacity: s3,
          transform: `translateY(${y3}px)`,
          color: COLORS.muted,
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: -0.3,
          textAlign: "center",
        }}
      >
        Paste any company URL → get a ranked AI roadmap.
      </div>

      <div
        style={{
          marginTop: 56,
          opacity: s4,
          transform: `translateY(${y4}px)`,
          display: "flex",
          gap: 20,
        }}
      >
        {stats.map((s, i) => {
          const ds = spring({
            frame: frame - 50 - i * 8,
            fps,
            config: { damping: 22, stiffness: 180 },
          });
          return (
            <div
              key={s.value}
              style={{
                opacity: ds,
                transform: `translateY(${interpolate(ds, [0, 1], [16, 0])}px)`,
                padding: "20px 32px",
                borderRadius: 18,
                background: "white",
                border: `1px solid ${COLORS.border}`,
                boxShadow: `0 12px 30px -20px ${COLORS.primary}40`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: COLORS.primary,
                  letterSpacing: -1.5,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLORS.muted,
                  letterSpacing: 0.2,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
