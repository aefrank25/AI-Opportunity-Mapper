import { COLORS } from "../theme";

// Mock of the app's compass-in-rounded-square brand mark.
export const BrandMark: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDeep})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 6px 16px -6px ${COLORS.primary}80`,
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
      <path
        d="M15.5 8.5 L13 13 L8.5 15.5 L11 11 Z"
        fill="white"
      />
      <circle cx="12" cy="12" r="1.2" fill={COLORS.primary} />
    </svg>
  </div>
);

export const AppChrome: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      opacity,
    }}
  >
    {/* Header */}
    <div
      style={{
        height: 96,
        borderBottom: `1px solid ${COLORS.border}`,
        background: "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        padding: "0 80px",
        gap: 16,
      }}
    >
      <BrandMark size={42} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.fg,
            letterSpacing: -0.2,
          }}
        >
          AI Opportunity Mapper
        </span>
        <span style={{ fontSize: 13, color: COLORS.muted }}>
          Practical AI opportunities for your business
        </span>
      </div>
    </div>
    <div style={{ flex: 1, padding: "60px 80px 40px" }}>{children}</div>
  </div>
);
