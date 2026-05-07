import { useCallback, useEffect, useRef, type FocusEvent as ReactFocusEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";

type Orientation = "horizontal" | "vertical" | "both";

/**
 * Roving tabindex: only one focusable child has tabindex=0 at any time.
 * Arrow keys / Home / End move focus between items and update the active item.
 *
 * Children must be focusable elements (buttons, links). The hook queries the
 * container with the provided selector (default: any button or [role=button]).
 */
export function useRovingTabindex<T extends HTMLElement = HTMLElement>(options?: {
  orientation?: Orientation;
  selector?: string;
}) {
  const orientation: Orientation = options?.orientation ?? "both";
  const selector = options?.selector ?? 'button:not([disabled]),[role="button"]:not([aria-disabled="true"])';
  const ref = useRef<T | null>(null);

  const getItems = useCallback((): HTMLElement[] => {
    const root = ref.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(selector));
  }, [selector]);

  const setActive = useCallback(
    (target: HTMLElement | null) => {
      const items = getItems();
      if (items.length === 0) return;
      const active = target && items.includes(target) ? target : items[0];
      for (const el of items) {
        el.tabIndex = el === active ? 0 : -1;
      }
    },
    [getItems],
  );

  // Initialize tabindex once children are present, and observe DOM changes.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    setActive(null);
    const observer = new MutationObserver(() => setActive(document.activeElement as HTMLElement | null));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [setActive]);

  const onFocus = useCallback(
    (e: ReactFocusEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.matches(selector)) setActive(target);
    },
    [selector, setActive],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      const items = getItems();
      if (items.length === 0) return;
      const next = (e.key === "ArrowDown" && (orientation === "vertical" || orientation === "both")) ||
        (e.key === "ArrowRight" && (orientation === "horizontal" || orientation === "both"));
      const prev = (e.key === "ArrowUp" && (orientation === "vertical" || orientation === "both")) ||
        (e.key === "ArrowLeft" && (orientation === "horizontal" || orientation === "both"));
      if (!next && !prev && e.key !== "Home" && e.key !== "End") return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;
      let target = idx;
      if (next) target = idx < 0 ? 0 : (idx + 1) % items.length;
      else if (prev) target = idx <= 0 ? items.length - 1 : idx - 1;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = items.length - 1;
      e.preventDefault();
      const el = items[target];
      el.focus();
      setActive(el);
    },
    [getItems, orientation, setActive],
  );

  return { ref, containerProps: { ref, onKeyDown, onFocus } } as const;
}
