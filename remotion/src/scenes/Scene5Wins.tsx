import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { AppChrome } from "../components/AppChrome";
import { Caption } from "../components/Caption";

// Heatmap + three opportunity cards (results page lower half)
const OPPS = [
  {
    title: "Proposal & estimate drafting",
    impact: "High",
    effort: "Medium",
    confidence: "High",
    automation: "Medium",
  },
  {
    title: "Client reporting drafts",
    impact: "High",
    effort: "Medium",
    confidence: "Medium",
    automation: "Medium",
  },
  {
    title: "Client onboarding kits",
    impact: "Medium",
    effort: "Medium",
    confidence: "Medium",
    automation: "Low",
  },
];

// Dot positions in the heatmap quadrant (x, y normalized 0–1)
const DOTS = [
  { x: 0.55, y: 0.28, label: "1", color: COLORS.accent },
  { x: 0.62, y: 0.52, label: "2", color: COLORS.warn },
  { x: 0.4, y: 0.7, label: "3", color: COLORS.mutedSoft },
];

export const Scene5Heatmap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heat = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });

  return (
    <AbsoluteFill>
      <Caption step="4" text="Impact vs. effort, at a glance" />
      <AppChrome>
        <div style={{ paddingTop: 24, display: "flex", gap: 32 }}>
          {/* Heatmap */}
          <div
            style={{
              flex: 1.1,
              opacity: heat,
              transform: `translateY(${interpolate(heat, [0, 1], [20, 0])}px)`,
              borderRadius: 20,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              padding: 28,
              boxShadow: `0 20px 40px -25px ${COLORS.primary}25`,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.fg,
              }}
            >
              AI Opportunity Heatmap
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 14,
                color: COLORS.muted,
              }}
            >
              Impact vs. ease of implementation
            </div>

            <Heatmap frame={frame} fps={fps} />

            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {OPPS.map((o, i) => (
                <div
                  key={o.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 15,
                    color: COLORS.fgSoft,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: DOTS[i].color,
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  {o.title}
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity cards */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.fg,
                paddingTop: 4,
              }}
            >
              Prioritized opportunities
            </div>
            {OPPS.map((o, i) => {
              const s = spring({
                frame: frame - 30 - i * 18,
                fps,
                config: { damping: 22, stiffness: 180 },
              });
              return (
                <div
                  key={o.title}
                  style={{
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
                    borderRadius: 16,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    padding: 20,
                    boxShadow: `0 10px 24px -16px ${COLORS.primary}25`,
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Opportunity {i + 1}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 22,
                      fontWeight: 700,
                      color: COLORS.fg,
                    }}
                  >
                    {o.title}
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      rowGap: 8,
                      columnGap: 20,
                    }}
                  >
                    <Stat label="Impact" value={o.impact} />
                    <Stat label="Effort" value={o.effort} />
                    <Stat label="Confidence" value={o.confidence} />
                    <Stat label="Automation risk" value={o.automation} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const tone =
    value === "High"
      ? COLORS.good
      : value === "Medium"
        ? COLORS.warn
        : COLORS.muted;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        color: COLORS.muted,
      }}
    >
      <span>{label}</span>
      <span style={{ color: tone, fontWeight: 700 }}>{value}</span>
    </div>
  );
};

const Heatmap: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const w = 580;
  const h = 360;
  return (
    <div
      style={{
        marginTop: 18,
        height: h,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${COLORS.accentBg}, ${COLORS.surfaceAlt})`,
        position: "relative",
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
      }}
    >
      {/* axes labels */}
      <Label pos={{ top: 12, left: 14 }}>Quick wins</Label>
      <Label pos={{ top: 12, right: 14 }}>High-impact next</Label>
      <Label pos={{ bottom: 12, left: 14 }}>Easy extras</Label>
      <Label pos={{ bottom: 12, right: 14 }}>Lower priority</Label>

      {/* grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
          backgroundSize: `${w / 4}px ${h / 4}px`,
          opacity: 0.6,
        }}
      />

      {DOTS.map((d, i) => {
        const s = spring({
          frame: frame - 50 - i * 14,
          fps,
          config: { damping: 14, stiffness: 200 },
        });
        const scale = interpolate(s, [0, 1], [0, 1]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(${d.x * 100}% - 20px)`,
              top: `calc(${d.y * 100}% - 20px)`,
              width: 40,
              height: 40,
              borderRadius: 999,
              background: d.color,
              color: "white",
              fontSize: 16,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 0 6px ${d.color}33`,
              transform: `scale(${scale})`,
            }}
          >
            {d.label}
          </div>
        );
      })}
    </div>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  pos: React.CSSProperties;
}> = ({ children, pos }) => (
  <div
    style={{
      position: "absolute",
      ...pos,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: COLORS.muted,
    }}
  >
    {children}
  </div>
);
