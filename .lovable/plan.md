# Plan: Demo Video for AI Opportunity Mapper

A polished 25-second silent demo video with bold text captions, rendered to MP4 with Remotion and saved to `/mnt/documents/` for download. End-to-end flow: paste URL → analyzing → opportunity map.

## Direction

- **Aesthetic**: Tech product. Dark UI, geometric sans, snappy spring transitions, grid motifs, subtle accent glow.
- **Palette** (from app):
  - Background: `#0B0F14` (near-black with cool tint)
  - Surface: `#121821`
  - Foreground: `#F5F7FA`
  - Muted: `#8A95A5`
  - Accent (primary blue from app): `#3B82F6` with a soft `#60A5FA` glow
- **Type**: Inter (display + body, 2 weights). Loaded via `@remotion/google-fonts/Inter`.
- **Motion system**: Default entrance = blur-to-sharp + 8px Y rise on a snappy spring (`damping: 22, stiffness: 220`). Hero accents use overshoot spring. Scene transitions = `slide` from-right with spring timing. Persistent subtle dot-grid background drifts diagonally across the whole video.
- **Sound**: Silent. Every beat has on-screen caption.

## Scene plan (25s @ 30fps = 750 frames)

```
┌─ Scene 1 (90f, ~3s) ─ Brand hook
│   "AI Opportunity Mapper" wordmark fades in over dot-grid;
│   subtitle "Practical AI ideas for any business" rises in.
│
├─ Scene 2 (120f, ~4s) ─ Paste a URL
│   Caption: "1 — Paste a business URL"
│   Mock URL input card animates in; cursor types
│   "acme-dental.com" character-by-character; "Scan" button pulses.
│
├─ Scene 3 (150f, ~5s) ─ Analyzing
│   Caption: "2 — We read the site"
│   Animated checklist ticks through 4 items
│   (Pages found · Workflow signals · Audience · Opportunities)
│   with staggered spring-in checkmarks; subtle scanning sweep.
│
├─ Scene 4 (180f, ~6s) ─ The map
│   Caption: "3 — Get a prioritized map"
│   Snapshot card slides in left; top-opportunity card slides in right;
│   3 opportunity cards stagger in below; small heatmap dots animate fill.
│
├─ Scene 5 (120f, ~4s) ─ Quick wins + roadmap glimpse
│   Caption: "Quick wins this week · 30-day roadmap"
│   Two stacked rows reveal with bullet points fading in.
│
└─ Scene 6 (90f, ~3s) ─ Close
    Wordmark returns center; tagline:
    "Find what AI can do for your business — in 60 seconds."
    URL pill: ai-opp-mapper.lovable.app
```

Transitions overlap by ~15f using `TransitionSeries` slide; total composition `durationInFrames` adjusted accordingly.

## Technical details

- Scaffold under `remotion/` per the Remotion skill (bun init, install `remotion @remotion/cli @remotion/renderer @remotion/bundler @remotion/transitions @remotion/google-fonts react react-dom typescript @types/react @remotion/compositor-linux-x64-musl`).
- Fix gnu compositor binary + symlink ffmpeg/ffprobe per skill notes (NixOS workaround).
- `src/Root.tsx` registers a single 1920×1080 / 30fps composition.
- `src/MainVideo.tsx` renders persistent dot-grid background + `TransitionSeries` of 6 scenes.
- Each scene is its own file under `src/scenes/`. All motion via `useCurrentFrame` + `interpolate`/`spring` — no CSS transitions.
- Mock UI is built in JSX with Tailwind-like inline styles using the palette above; no real screenshots needed (keeps the piece graphic and on-brand without resolution issues).
- Render via `scripts/render-remotion.mjs` with `chromeMode: "chrome-for-testing"`, `muted: true`, `concurrency: 1`, output → `/mnt/documents/ai-opp-mapper-demo.mp4`.
- Spot-check 2–3 key frames with `bunx remotion still` before full render.

## Deliverable

- `/mnt/documents/ai-opp-mapper-demo.mp4` (1080p, ~25s, silent, MP4/H.264)
- Source kept in `remotion/` so the video can be re-rendered or tweaked later.

No app source code is changed — this is a standalone artifact build.
