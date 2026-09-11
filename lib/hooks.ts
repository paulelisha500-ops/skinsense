"use client";

import { useEffect, useEffectEvent, useSyncExternalStore, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

function focusableWithin(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
  );
}

type FocusTrapOptions = {
  onEscape?: () => void;
  /** Element to focus first; defaults to the first focusable child. */
  initialFocus?: RefObject<HTMLElement | null>;
};

/**
 * Keeps keyboard focus inside `ref` while `active`, closes on Escape and
 * returns focus to whatever was focused before when it deactivates.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  { onEscape, initialFocus }: FocusTrapOptions = {},
) {
  const handleEscape = useEffectEvent(() => onEscape?.());

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus straight away (the node is mounted by the time effects run), and
    // once more on the next frame in case an entering child wasn't ready yet.
    const focusFirst = () => {
      if (node.contains(document.activeElement)) return;
      const first = initialFocus?.current ?? focusableWithin(node)[0] ?? node;
      first.focus({ preventScroll: true });
    };
    focusFirst();
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleEscape();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusableWithin(node);
      if (items.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === firstEl || !node.contains(current))) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && (current === lastEl || !node.contains(current))) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, ref, initialFocus]);
}

/** Locks page scroll while `active`, compensating for the scrollbar width. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
    };
  }, [active]);
}

const noopSubscribe = () => () => {};

/** True only after hydration on the client (safe for portals). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
