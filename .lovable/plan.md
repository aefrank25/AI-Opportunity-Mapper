## Goal
On mobile, tapping the ⓘ in a `ScoreChip` should:
- Open reliably on first tap (Radix Tooltip is hover/focus-only and flaky on touch).
- Not shift the chip or surrounding card layout.
- Not be confused with a card tap/scroll gesture.

## Changes — `src/components/score-chip.tsx`

1. **Swap Tooltip → Popover on touch, keep Tooltip on hover-capable devices.**
   - Use a single component: `Popover` from `@/components/ui/popover` (Radix-based, already in project). Popover works equally well for click/tap and keyboard, and avoids the touch-tap quirks of Tooltip.
   - Trigger: same `<button>` with `aria-label`, but add:
     - `onClick`/`onPointerDown` `e.stopPropagation()` and `e.preventDefault()` so the tap doesn't bubble to the parent card (prevents conflict with card gestures / future swipe handlers).
     - `onTouchStart` with `stopPropagation` for Safari.
   - Replace `TooltipContent` with `PopoverContent` styled to match current tooltip look (`max-w-[14rem] text-xs leading-snug p-2.5 rounded-md`), `side="top"`, `align="end"`, `sideOffset={6}`, `collisionPadding={12}`.

2. **Prevent layout shift.**
   - Keep the trigger size fixed: `h-6 w-6` (24×24 hit area) with `inline-flex items-center justify-center`, drop the negative-margin trick (`-m-1.5 p-1.5`) which can nudge flex alignment when the popover opens and Radix toggles `data-state` classes.
   - Anchor the popover via Radix Portal (default) so the floating panel never affects the chip's flow.
   - Ensure the chip row reserves space for the icon at all times (it already does); no conditional rendering changes.

3. **Gesture isolation.**
   - Add `touch-action: manipulation` to the trigger button to suppress the 300ms tap delay and double-tap zoom on the icon only.
   - On `PopoverContent`, set `onOpenAutoFocus={(e) => e.preventDefault()}` to keep focus on the trigger (prevents page scroll jump on small screens).
   - Close on outside tap is default; also pass `onCloseAutoFocus={(e) => e.preventDefault()}`.

4. **Keep desktop hover-like UX.**
   - Open on `onMouseEnter` and close on `onMouseLeave` of the trigger via controlled `open` state, in addition to click. This preserves the current "hover to peek" feel on desktop without losing tap reliability on mobile.
   - Single controlled `open` state with `useState`; toggled by click, set true on mouseenter, set false on mouseleave (with a small 80ms close delay to allow moving into the popover — optional, can omit for simplicity).

5. **A11y.**
   - Trigger keeps `aria-label="{label} explanation"` and `type="button"`.
   - Add `aria-expanded` (Popover handles this) and `aria-haspopup="dialog"` automatically via Radix.

## Out of scope
- No changes to other components, tokens, or the chip's visual styling beyond the trigger sizing noted above.
- No new dependencies; `@/components/ui/popover` already exists.

## Files touched
- `src/components/score-chip.tsx` (only).
