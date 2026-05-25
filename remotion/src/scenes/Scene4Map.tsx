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

// Snapshot + top recommendation cards (results page top half)
export const Scene4Map: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const header = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });
  const snap = spring({
    frame: frame - 20,
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const top = spring({
    frame: frame - 60,
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  return (
    <AbsoluteFill>
      <Caption step="3" text="A prioritized opportunity map" />
      <AppChrome>
        <div
          style={{
            opacity: header,
            transform: `translateY(${interpolate(header, [0, 1], [12, 0])}px)`,
            paddingTop: 30,
          }}
        >
          <div
            style={{
              color: COLORS.muted,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Opportunity Map
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 42,
              fontWeight: 800,
              color: COLORS.fg,
              letterSpacing: -1,
            }}
          >
            🧭 northbeam-agency.com
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <Badge color={COLORS.muted}>Demo result</Badge>
            <Badge color={COLORS.primary}>Priority: Reduce admin work</Badge>
          </div>
        </div>

        {/* Snapshot card */}
        <Card
          spring={snap}
          style={{ marginTop: 30 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.fg,
              }}
            >
              Business snapshot
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "4px 10px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
              }}
            >
              Inferred
            </span>
          </div>
          <p
            style={{
              marginTop: 14,
              fontSize: 18,
              lineHeight: 1.55,
              color: COLORS.fgSoft,
            }}
          >
            Northbeam Agency is likely a small full-service marketing agency
            with retainer clients, recurring reporting, custom strategy work,
            and bespoke proposals for new business.
          </p>
          <div style={{ marginTop: 22, display: "flex", gap: 60 }}>
            <SnapshotList
              label="Likely audience"
              items={[
                "SMB and mid-market marketing leaders",
                "Founders looking for outsourced growth support",
                "Existing retainer clients on recurring cycles",
              ]}
            />
            <SnapshotList
              label="Inferred business signals"
              items={[
                "Portfolio or case study section",
                "Service tiers or packages",
                "‘Work with us’ contact flow",
                "Recurring client reporting needs",
              ]}
            />
          </div>
        </Card>

        {/* Top recommendation card */}
        <Card
          spring={top}
          style={{
            marginTop: 24,
            border: `1px solid ${COLORS.accent}44`,
            background: `linear-gradient(180deg, ${COLORS.accentBg}, ${COLORS.surface} 40%)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: COLORS.primary,
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            ✦ Top recommendation for your goal
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 38,
              fontWeight: 800,
              color: COLORS.fg,
              letterSpacing: -1,
            }}
          >
            Proposal &amp; estimate drafting
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: 18,
              color: COLORS.muted,
              lineHeight: 1.5,
            }}
          >
            AI-assisted first drafts created from intake answers, reusable
            proposal sections, and approved past proposals.
          </p>

          <div style={{ marginTop: 22, display: "flex", gap: 40 }}>
            <Why
              title="Why this matters"
              body="Time spent rewriting proposals from scratch can be one of the largest hidden costs in small agencies."
            />
            <Why
              title="Suggested improvement"
              body="Use AI to generate a structured first draft from intake answers, reusable service descriptions, and selected past examples."
            />
          </div>
        </Card>
      </AppChrome>
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color: string }> = ({
  children,
  color,
}) => (
  <span
    style={{
      fontSize: 13,
      fontWeight: 600,
      color,
      padding: "4px 12px",
      borderRadius: 999,
      background: `${color}14`,
      border: `1px solid ${color}33`,
    }}
  >
    {children}
  </span>
);

const Card: React.FC<{
  children: React.ReactNode;
  spring: number;
  style?: React.CSSProperties;
}> = ({ children, spring: s, style }) => (
  <div
    style={{
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
      borderRadius: 20,
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      padding: 32,
      boxShadow: `0 20px 40px -25px ${COLORS.primary}25`,
      ...style,
    }}
  >
    {children}
  </div>
);

const SnapshotList: React.FC<{ label: string; items: string[] }> = ({
  label,
  items,
}) => (
  <div style={{ flex: 1 }}>
    <div
      style={{
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {label}
    </div>
    {items.map((it) => (
      <div
        key={it}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontSize: 16,
          color: COLORS.fgSoft,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            marginTop: 8,
            width: 5,
            height: 5,
            borderRadius: 999,
            background: COLORS.primary,
            flexShrink: 0,
          }}
        />
        {it}
      </div>
    ))}
  </div>
);

const Why: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div style={{ flex: 1 }}>
    <div
      style={{
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: 16, color: COLORS.fgSoft, lineHeight: 1.5 }}>
      {body}
    </div>
  </div>
);
