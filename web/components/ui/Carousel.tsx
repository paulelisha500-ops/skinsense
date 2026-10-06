"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Children,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Accessible name for the carousel region. */
  label: string;
  children: ReactNode;
  className?: string;
  /** Width classes for each slide (controls how many are visible). */
  slideClassName?: string;
  tone?: "light" | "dark";
};

type DragState = { x: number; left: number; moved: boolean; pointerId: number };

/**
 * Swipeable horizontal carousel built on native scroll-snap: touch swipe is
 * the browser's own, mouse users can drag, keyboard users can use the arrow
 * keys, and there are prev/next buttons plus position dots.
 */
export function Carousel({
  label,
  children,
  className,
  slideClassName = "w-[84%] sm:w-[46%] lg:w-[31.5%]",
  tone = "light",
}: Props) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const reduce = useReducedMotion();

  const [active, setActive] = useState(0);
  const [pages, setPages] = useState(slides.length);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  function getItems(): HTMLElement[] {
    const el = trackRef.current;
    return el ? (Array.from(el.children) as HTMLElement[]) : [];
  }

  function measure() {
    const el = trackRef.current;
    const items = getItems();
    if (!el || items.length === 0) return;
    const origin = items[0].offsetLeft;
    const slideWidth = items[0].getBoundingClientRect().width;
    const visible = Math.max(1, Math.round(el.clientWidth / Math.max(1, slideWidth)));
    const pageCount = Math.max(1, items.length - visible + 1);
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;

    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    items.forEach((item, i) => {
      const distance = Math.abs(item.offsetLeft - origin - el.scrollLeft);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });

    setPages(pageCount);
    setActive(end ? pageCount - 1 : Math.min(nearest, pageCount - 1));
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(end);
  }

  const onResize = useEffectEvent(measure);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => onResize());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function scrollToIndex(index: number) {
    const el = trackRef.current;
    const items = getItems();
    if (!el || items.length === 0) return;
    const target = items[Math.max(0, Math.min(index, items.length - 1))];
    el.scrollTo({
      left: target.offsetLeft - items[0].offsetLeft,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(active - 1);
    }
  }

  // ── mouse drag (touch uses native scrolling) ──
  function handlePointerDown(event: PointerEvent<HTMLUListElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || !trackRef.current) return;
    dragRef.current = {
      x: event.clientX,
      left: trackRef.current.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      el.setPointerCapture(drag.pointerId);
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      setDragging(true);
    }
    if (drag.moved) el.scrollLeft = drag.left - dx;
  }

  function endDrag() {
    const drag = dragRef.current;
    const el = trackRef.current;
    dragRef.current = null;
    if (!drag || !el || !drag.moved) return;
    suppressClickRef.current = true;
    el.style.scrollBehavior = "";
    setDragging(false);

    // settle on the nearest slide, then hand snapping back to the browser
    const items = getItems();
    const origin = items[0]?.offsetLeft ?? 0;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    items.forEach((item, i) => {
      const distance = Math.abs(item.offsetLeft - origin - el.scrollLeft);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    scrollToIndex(nearest);
    window.setTimeout(() => {
      el.style.scrollSnapType = "";
    }, 450);
  }

  function handleClickCapture(event: MouseEvent<HTMLUListElement>) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  }

  const controlClass = cn(
    "grid size-10 place-items-center rounded-full border transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35",
    tone === "light"
      ? "border-hairline bg-warm-white text-ink shadow-soft hover:border-tan enabled:hover:-translate-y-0.5"
      : "border-hairline-dark bg-white/[0.05] text-cream hover:border-tan/60",
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn("relative", className)}>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={`${label}: use the arrow keys to move between slides`}
        onScroll={measure}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        className={cn(
          "no-scrollbar relative -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-3 pt-1 outline-offset-4",
          dragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={cn("shrink-0 snap-start", slideClassName)}
          >
            {slide}
          </li>
        ))}
      </ul>

      <div className={cn("mt-5 flex items-center justify-between gap-4", pages <= 1 && "hidden")}>
        <div className="flex items-center" aria-label="Choose slide" role="group">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className="group grid h-8 place-items-center px-1"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-500 ease-out-expo",
                  i === active
                    ? cn("w-6", tone === "light" ? "bg-espresso" : "bg-tan")
                    : cn("w-1.5", tone === "light" ? "bg-tan/70 group-hover:bg-caramel" : "bg-latte/30 group-hover:bg-latte/60"),
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            disabled={atStart}
            aria-label="Previous slide"
            className={controlClass}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={atEnd}
            aria-label="Next slide"
            className={controlClass}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
