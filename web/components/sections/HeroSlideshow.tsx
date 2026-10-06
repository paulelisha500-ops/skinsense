"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Pause, Play, Timer } from "lucide-react";
import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  position: string;
};

type Props = {
  slides: HeroSlide[];
  note: string;
  timer: { label: string; value: string };
  routine: { label: string; steps: string[] };
};

const INTERVAL_MS = 6000;

/**
 * Auto-advancing crossfade slideshow with a slow Ken Burns zoom. Pauses on
 * hover and keyboard focus, has a pause/play button (WCAG 2.2.2), dots and
 * arrows. With reduced motion it starts paused.
 */
export function HeroSlideshow({ slides, note, timer, routine }: Props) {
  const count = slides.length;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? Boolean(reduce);
  const playing = !paused && !hovered && !focused;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, count]);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const current = slides[index];

  return (
    <div className="relative mx-auto w-full max-w-[32rem]">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="SkinSense highlights"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-latte shadow-lift ring-1 ring-espresso/10"
      >
        {slides.map((slide, i) => (
          <motion.div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.08 }}
            transition={{
              opacity: { duration: 1.1, ease: "easeInOut" },
              scale: { duration: 7, ease: "linear" },
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              sizes="(min-width: 640px) 32rem, 100vw"
              className="object-cover"
              style={{ objectPosition: slide.position }}
            />
          </motion.div>
        ))}

        {/* legibility gradient + viewfinder */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-espresso/95 via-espresso/40 via-40% to-espresso/10"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-5">
          <span className="absolute left-0 top-0 size-7 rounded-tl-xl border-l-2 border-t-2 border-cream/70" />
          <span className="absolute right-0 top-0 size-7 rounded-tr-xl border-r-2 border-t-2 border-cream/70" />
          <span className="absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-2 border-l-2 border-cream/40" />
          <span className="absolute bottom-0 right-0 size-7 rounded-br-xl border-b-2 border-r-2 border-cream/40" />
          <span className="absolute inset-x-6 h-px animate-scan bg-linear-to-r from-transparent via-tan to-transparent shadow-[0_0_16px_2px_rgb(200_162_124/0.55)]" />
        </div>
        <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-espresso/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/90 backdrop-blur-md sm:top-6">
          {note}
        </span>

        {/* caption + controls */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
          <div
            aria-live={playing ? "off" : "polite"}
            className="min-h-[6.5rem] max-w-[19rem] [text-shadow:0_1px_14px_rgb(43_29_20/0.45)] sm:max-w-[21rem]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-tan">{current.eyebrow}</p>
                <p className="mt-2 max-w-sm text-xl font-medium leading-snug tracking-[-0.02em] text-cream sm:text-2xl">
                  {current.title}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="-ml-1 flex items-center" role="group" aria-label="Choose slide">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1} of ${count}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group grid h-8 place-items-center px-1"
                >
                  <span
                    className={cn(
                      "relative block h-1 overflow-hidden rounded-full transition-all duration-500 ease-out-expo",
                      i === index ? "w-10 bg-cream/30" : "w-4 bg-cream/35 group-hover:bg-cream/60",
                    )}
                  >
                    {i === index && (
                      <motion.span
                        key={`${index}-${playing}`}
                        className="absolute inset-0 rounded-full bg-cream"
                        style={{ originX: 0 }}
                        initial={{ scaleX: playing ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: playing ? INTERVAL_MS / 1000 : 0, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <GlassButton
                label={paused ? "Play slideshow" : "Pause slideshow"}
                onClick={() => setUserPaused(!paused)}
              >
                {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
              </GlassButton>
              <GlassButton label="Previous slide" onClick={() => go(-1)}>
                <ChevronLeft aria-hidden="true" />
              </GlassButton>
              <GlassButton label="Next slide" onClick={() => go(1)}>
                <ChevronRight aria-hidden="true" />
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* floating chips (decorative) */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-12 top-20 hidden rounded-2xl border border-hairline bg-warm-white/90 p-3.5 pr-5 shadow-lift backdrop-blur-md lg:block xl:-left-20"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-espresso text-cream">
            <Timer className="size-4" />
          </span>
          <div>
            <p className="text-xs text-subtle">{timer.label}</p>
            <p className="text-sm font-semibold text-ink">{timer.value}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute -right-8 bottom-40 hidden w-52 rounded-2xl border border-hairline bg-warm-white/90 p-4 shadow-lift backdrop-blur-md lg:block xl:-right-14"
        animate={reduce ? undefined : { y: [0, 9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-brown">
          <Moon className="size-3" />
          {routine.label}
        </p>
        <ol className="mt-3 space-y-2">
          {routine.steps.map((step, i) => (
            <li key={step} className="flex items-center gap-2.5 text-[13px] text-ink">
              <span className="grid size-5 place-items-center rounded-full bg-latte font-mono text-[10px] text-brown">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}

function GlassButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-cream backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 active:scale-95 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
