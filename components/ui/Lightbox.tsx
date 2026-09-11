"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Kbd } from "./Badge";
import { useFocusTrap, useIsClient, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type LightboxItem = {
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  /** width / height */
  ratio: number;
};

type Props = {
  items: LightboxItem[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Full-screen image viewer: animated open/close, direction-aware slides,
 * click (or the button) to zoom and move the pointer to pan, swipe on touch,
 * ←/→ keys and buttons to browse, Esc / backdrop click to close, and focus
 * is trapped inside while open.
 */
export function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(
    <AnimatePresence>
      {index !== null && (
        <LightboxView
          key="lightbox"
          items={items}
          index={index}
          onClose={onClose}
          onIndexChange={onIndexChange}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 96 : -96, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -96 : 96, opacity: 0, scale: 0.97 }),
};

function LightboxView({
  items,
  index,
  onClose,
  onIndexChange,
}: Omit<Props, "index"> & { index: number }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [direction, setDirection] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const originX = useMotionValue(0.5);
  const originY = useMotionValue(0.5);
  const captionId = useId();
  const count = items.length;
  const item = items[index];

  useFocusTrap(dialogRef, true, { onEscape: onClose });
  useScrollLock(true);

  function resetZoom() {
    setZoomed(false);
    originX.set(0.5);
    originY.set(0.5);
  }

  function go(delta: number) {
    setDirection(delta);
    resetZoom();
    onIndexChange((index + delta + count) % count);
  }

  function jump(target: number) {
    if (target === index) return;
    setDirection(target > index ? 1 : -1);
    resetZoom();
    onIndexChange(target);
  }

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function setOriginFrom(event: { clientX: number; clientY: number; currentTarget: HTMLElement }) {
    const rect = event.currentTarget.getBoundingClientRect();
    originX.set(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)));
    originY.set(Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)));
  }

  function handleImageClick(event: MouseEvent<HTMLDivElement>) {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (!zoomed) setOriginFrom(event);
    setZoomed((z) => !z);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (zoomed) setOriginFrom(event);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -70 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 500) go(-1);
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <motion.div
      className="surface-dark fixed inset-0 z-[100] bg-espresso/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        aria-describedby={captionId}
        tabIndex={-1}
        className="flex h-full flex-col outline-none"
      >
        {/* top bar */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
          <p className="font-mono text-xs tabular-nums text-latte/80">
            <span className="sr-only">Photo </span>
            {index + 1} / {count}
          </p>
          <div className="flex items-center gap-2">
            <ControlButton
              label={zoomed ? "Zoom out" : "Zoom in"}
              pressed={zoomed}
              onClick={() => {
                originX.set(0.5);
                originY.set(0.5);
                setZoomed((z) => !z);
              }}
            >
              {zoomed ? <ZoomOut aria-hidden="true" /> : <ZoomIn aria-hidden="true" />}
            </ControlButton>
            <ControlButton label="Close photo viewer" onClick={onClose}>
              <X aria-hidden="true" />
            </ControlButton>
          </div>
        </div>

        {/* stage */}
        <div
          className="relative min-h-0 flex-1 [--lb-gutter:2rem] [container-type:size] sm:[--lb-gutter:10rem]"
          onClick={closeOnBackdrop}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 320, damping: 34 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 },
              }}
              className="absolute inset-0 flex items-center justify-center"
              onClick={closeOnBackdrop}
            >
              <motion.div
                drag={zoomed ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragStart={() => {
                  draggedRef.current = true;
                }}
                onDragEnd={handleDragEnd}
                className="relative overflow-hidden rounded-2xl bg-coffee/50 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.85)] ring-1 ring-white/10"
                style={{
                  aspectRatio: item.ratio,
                  width: `min(calc(100cqw - var(--lb-gutter)), calc((100cqh - 1.5rem) * ${item.ratio}))`,
                }}
              >
                <div
                  className={cn("absolute inset-0", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
                  style={{ touchAction: zoomed ? "none" : "pan-y" }}
                  onClick={handleImageClick}
                  onPointerMove={handlePointerMove}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ originX, originY }}
                    animate={{ scale: zoomed ? 2.25 : 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 30 }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1280px) 1100px, 100vw"
                      draggable={false}
                      className="select-none object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-between px-5 sm:flex">
            <ControlButton
              size="lg"
              className="pointer-events-auto"
              label="Previous photo"
              onClick={() => go(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </ControlButton>
            <ControlButton
              size="lg"
              className="pointer-events-auto"
              label="Next photo"
              onClick={() => go(1)}
            >
              <ChevronRight aria-hidden="true" />
            </ControlButton>
          </div>
        </div>

        {/* caption, mobile controls, thumbnails */}
        <div className="px-4 pb-5 pt-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <ControlButton className="sm:hidden" label="Previous photo" onClick={() => go(-1)}>
              <ChevronLeft aria-hidden="true" />
            </ControlButton>
            <p
              id={captionId}
              aria-live="polite"
              className="flex-1 text-center text-sm leading-relaxed text-latte/90"
            >
              {item.caption}
            </p>
            <ControlButton className="sm:hidden" label="Next photo" onClick={() => go(1)}>
              <ChevronRight aria-hidden="true" />
            </ControlButton>
          </div>

          <ul className="mt-4 hidden justify-center gap-2 sm:flex">
            {items.map((thumb, i) => (
              <li key={thumb.src}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "relative block size-12 overflow-hidden rounded-lg transition duration-300",
                    i === index
                      ? "opacity-100 ring-2 ring-tan ring-offset-2 ring-offset-espresso"
                      : "opacity-45 ring-1 ring-white/10 hover:opacity-90",
                  )}
                >
                  <Image src={thumb.thumb} alt="" fill sizes="48px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-3 hidden items-center justify-center gap-1.5 text-[11px] text-latte/70 sm:flex">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span className="mr-2">browse</span>
            <span className="mr-2">click to zoom</span>
            <Kbd>Esc</Kbd>
            <span>close</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  pressed,
  size = "md",
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-cream backdrop-blur transition hover:border-white/35 hover:bg-white/[0.14] active:scale-95 [&_svg]:size-5",
        size === "lg" ? "size-12" : "size-10",
        className,
      )}
    >
      {children}
    </button>
  );
}
