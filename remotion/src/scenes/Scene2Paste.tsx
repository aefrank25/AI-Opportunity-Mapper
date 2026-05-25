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

const TYPED = "northbeam-agency.com";

export const Scene2Paste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = spring({ frame, fps, config: { damping: 22, stiffness: 180 } });
  const cardY = interpolate(card, [0, 1], [40, 0]);
  const cardOpacity = interpolate(card, [0, 1], [0, 1]);

  // Type one character every 3 frames, starting at frame 35.
  const typeStart = 35;
  const charCount = Math.max(
    0,
    Math.min(TYPED.length, Math.floor((frame - typeStart) / 3))
  );
  const typed = TYPED.slice(0, charCount);
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  // Priority dropdown selection appears after typing
  const prioritySelected = frame > typeStart + TYPED.length * 3 + 10;
  const priorityPulse = spring({
    frame: frame - (typeStart + TYPED.length * 3 + 10),
    fps,
    config: { damping: 18, stiffness: 200 },
  });

  // Button press near the end
  const pressFrame = 175;
  const pressed = frame > pressFrame;
  const press = spring({
    frame: frame - pressFrame,
    fps,
    config: { damping: 14, stiffness: 240 },
  });
  const buttonScale = pressed
    ? interpolate(press, [0, 0.5, 1], [1, 0.95, 1])
    : 1;

  return (
    <AbsoluteFill>
      <Caption step="1" text="Share a business URL" />
      <AppChrome>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 60,
          }}
        >
          <div
            style={{
              opacity: cardOpacity,
              transform: `translateY(${cardY}px)`,
              width: 1100,
              borderRadius: 22,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: `0 30px 60px -30px ${COLORS.primary}33, 0 10px 20px -10px ${COLORS.primary}22`,
              padding: 40,
            }}
          >
            <div style={{ display: "flex", gap: 24 }}>
              <Field label="Business website">
                <div
                  style={{
                    height: 56,
                    borderRadius: 12,
                    border: `1px solid ${COLORS.borderStrong}`,
                    background: COLORS.surfaceAlt,
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 22,
                    color: typed ? COLORS.fg : COLORS.mutedSoft,
                    fontWeight: 500,
                  }}
                >
                  {typed || "example.com"}
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 24,
                      background: COLORS.fg,
                      marginLeft: 3,
                      opacity: cursorOn && frame > typeStart - 5 ? 1 : 0,
                    }}
                  />
                </div>
              </Field>
              <Field label="Main priority (optional)">
                <div
                  style={{
                    height: 56,
                    borderRadius: 12,
                    border: `1px solid ${prioritySelected ? COLORS.accent : COLORS.borderStrong}`,
                    background: COLORS.surfaceAlt,
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 20,
                    color: prioritySelected ? COLORS.fg : COLORS.mutedSoft,
                    fontWeight: 500,
                    transform: prioritySelected
                      ? `scale(${interpolate(priorityPulse, [0, 0.5, 1], [1, 1.02, 1])})`
                      : "scale(1)",
                    transition: "none",
                  }}
                >
                  {prioritySelected ? "Reduce admin work" : "Choose a priority"}
                  <span style={{ color: COLORS.mutedSoft, fontSize: 14 }}>▾</span>
                </div>
              </Field>
            </div>

            <div
              style={{
                marginTop: 28,
                background: COLORS.accentBg,
                border: `1px solid ${COLORS.accent}33`,
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>✦</span>
                <span style={{ fontWeight: 700, color: COLORS.fg, fontSize: 18 }}>
                  Live Scan
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: COLORS.primary,
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  BETA
                </span>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.5 }}>
                Uses public website content only.
                <br />
                Private data and internal systems are not accessed.
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                height: 64,
                borderRadius: 14,
                background: pressed
                  ? COLORS.primaryDeep
                  : `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.primaryDeep})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                gap: 12,
                boxShadow: `0 10px 24px -10px ${COLORS.primary}99`,
                transform: `scale(${buttonScale})`,
              }}
            >
              <span>✦</span> Run Live Scan
            </div>
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ flex: 1 }}>
    <div
      style={{
        color: COLORS.fg,
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 10,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);
