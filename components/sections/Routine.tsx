"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Droplet, Droplets, Layers, Moon, Pill, Sparkles, Sun, SunMedium } from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Accent } from "@/components/ui/Accent";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { INGREDIENTS_ROW_1, INGREDIENTS_ROW_2, ROUTINE, type RoutineStep } from "@/lib/content";
import { cn } from "@/lib/utils";

type Time = "morning" | "evening";

const TIMES: Array<{ id: Time; label: string; icon: ReactNode; count: number }> = [
  { id: "morning", label: "Morning", icon: <Sun aria-hidden="true" className="size-4" />, count: ROUTINE.morning.length },
  { id: "evening", label: "Evening", icon: <Moon aria-hidden="true" className="size-4" />, count: ROUTINE.evening.length },
];

const STEP_ICONS: Record<string, ReactNode> = {
  Cleanser: <Droplets className="size-[18px]" />,
  Exfoliant: <Sparkles className="size-[18px]" />,
  Serum: <Droplet className="size-[18px]" />,
  Moisturizer: <Layers className="size-[18px]" />,
  Sunscreen: <SunMedium className="size-[18px]" />,
  Treatment: <Pill className="size-[18px]" />,
};

export function Routine() {
  const [time, setTime] = useState<Time>("morning");
  const steps = time === "morning" ? ROUTINE.morning : ROUTINE.evening;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Time =
      event.key === "Home" ? "morning" : event.key === "End" ? "evening" : time === "morning" ? "evening" : "morning";
    setTime(next);
    document.getElementById(`routine-tab-${next}`)?.focus();
  }

  return (
    <section
      id="routines"
      aria-labelledby="routine-title"
      className="relative isolate overflow-hidden border-y border-hairline bg-latte/60 py-24 sm:py-28 lg:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots opacity-50 fade-y" />
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="routine-title"
            eyebrow={ROUTINE.eyebrow}
            title={<Accent text={ROUTINE.title} />}
            lede={ROUTINE.lede}
          />
          <Reveal delay={0.1} className="shrink-0">
            <div
              role="tablist"
              aria-label="Time of day"
              onKeyDown={handleKeyDown}
              className="inline-flex rounded-full border border-hairline bg-warm-white p-1 shadow-soft"
            >
              {TIMES.map((t) => {
                const selected = t.id === time;
                return (
                  <button
                    key={t.id}
                    id={`routine-tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="routine-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTime(t.id)}
                    className={cn(
                      "relative z-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300",
                      selected ? "text-cream" : "text-subtle hover:text-ink",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="routine-pill"
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full bg-espresso shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {t.icon}
                    {t.label}
                    <span className={cn("font-mono text-[11px]", selected ? "text-latte/85" : "text-subtle")}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-subtle lg:text-right">{ROUTINE.exampleLabel}</p>
          </Reveal>
        </div>

        <div id="routine-panel" role="tabpanel" aria-labelledby={`routine-tab-${time}`} className="mt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={time}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Carousel
                label={`${time === "morning" ? "Morning" : "Evening"} routine steps`}
                slideClassName="w-[82%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
              >
                {steps.map((step, i) => (
                  <StepCard key={step.step} step={step} n={i + 1} time={time} />
                ))}
              </Carousel>
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-subtle">{ROUTINE.exampleNote}</p>
        </div>

        <Reveal className="mt-12 rounded-3xl border border-hairline bg-warm-white/80 p-6 shadow-soft sm:p-7">
          <h3 className="text-sm font-semibold text-ink">{ROUTINE.habitsTitle}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROUTINE.habits.map((habit) => (
              <li key={habit} className="flex items-start gap-2.5 text-sm leading-snug text-subtle">
                <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-olive/15 text-olive">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {habit}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <div className="mt-16">
        <Container>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-brown">
            {ROUTINE.marqueeTitle}
          </p>
        </Container>
        <div className="mt-6 space-y-3">
          <Marquee items={INGREDIENTS_ROW_1} label="Active ingredients" />
          <Marquee items={INGREDIENTS_ROW_2} label="More active ingredients" reverse />
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, n, time }: { step: RoutineStep; n: number; time: Time }) {
  return (
    <article className="group flex h-full min-h-[17rem] flex-col rounded-3xl border border-hairline bg-warm-white p-6 shadow-soft transition duration-500 ease-out-expo hover:-translate-y-1 hover:border-tan/70">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brown">
          {time === "morning" ? "AM" : "PM"} · Step {n}
        </span>
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-2xl bg-cream text-brown ring-1 ring-hairline transition-colors duration-300 group-hover:bg-espresso group-hover:text-cream"
        >
          {STEP_ICONS[step.step]}
        </span>
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-display text-ink">{step.step}</h3>
      <ul aria-label="Key actives" className="mt-4 flex flex-wrap gap-1.5">
        {step.actives.map((active) => (
          <li key={active} className="rounded-full bg-espresso px-2.5 py-1 text-xs font-medium text-cream">
            {active}
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-6 text-sm leading-relaxed text-subtle">{step.tip}</p>
    </article>
  );
}
