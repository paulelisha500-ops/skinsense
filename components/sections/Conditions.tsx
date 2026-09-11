"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, FlaskConical, Lightbulb, Stethoscope, Zap } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";
import { Accent } from "@/components/ui/Accent";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Dialog } from "@/components/ui/Dialog";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { CONDITIONS, CONDITIONS_INTRO, CTA } from "@/lib/content";
import { APP_URL } from "@/lib/site";

export function Conditions() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <section
      id="conditions"
      aria-labelledby="conditions-title"
      className="surface-dark relative isolate overflow-hidden bg-espresso py-24 text-cream sm:py-28 lg:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-80 fade-y" />
      <div
        aria-hidden="true"
        className="absolute -right-48 -top-48 -z-10 size-[38rem] rounded-full bg-caramel/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 -left-40 -z-10 size-[32rem] rounded-full bg-coffee blur-3xl"
      />

      <Container>
        <SectionHeading
          tone="dark"
          id="conditions-title"
          eyebrow={CONDITIONS_INTRO.eyebrow}
          title={<Accent tone="dark" text={CONDITIONS_INTRO.title} />}
          lede={CONDITIONS_INTRO.lede}
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONDITIONS.map((condition, i) => (
            <Reveal as="li" key={condition.slug} delay={(i % 4) * 0.06}>
              <TiltCard className="h-full rounded-3xl">
                <button
                  type="button"
                  onClick={() => openAt(i)}
                  aria-haspopup="dialog"
                  className="group flex h-full min-h-52 w-full flex-col items-start rounded-3xl border border-hairline-dark bg-white/[0.035] p-6 text-left transition-colors duration-300 hover:border-tan/45 hover:bg-white/[0.06]"
                >
                  <span aria-hidden="true" className="relative flex size-3.5">
                    <span
                      className="absolute -inset-1 rounded-full opacity-60 blur-[6px]"
                      style={{ backgroundColor: condition.accent }}
                    />
                    <span
                      className="relative size-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: condition.accent }}
                    />
                  </span>
                  <span className="mt-10 text-lg font-semibold tracking-[-0.02em] text-cream">
                    {condition.name}
                  </span>
                  <span className="mt-1.5 text-sm leading-relaxed text-latte/75">{condition.short}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-tan">
                    Learn more
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </button>
              </TiltCard>
            </Reveal>
          ))}
          <Reveal as="li" delay={0.2}>
            <div className="flex h-full min-h-52 flex-col rounded-3xl border border-dashed border-hairline-dark p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-tan">
                {CONDITIONS_INTRO.otherTitle}
              </p>
              <p className="mt-auto pt-8 text-sm leading-relaxed text-latte/80">{CONDITIONS_INTRO.otherBody}</p>
            </div>
          </Reveal>
        </ul>

        <p className="mt-8 text-center text-xs text-latte/70">{CONDITIONS_INTRO.note}</p>
      </Container>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="condition-title"
        describedBy="condition-summary"
      >
        <ConditionDetail index={index} onNavigate={setIndex} />
      </Dialog>
    </section>
  );
}

function ConditionDetail({ index, onNavigate }: { index: number; onNavigate: (i: number) => void }) {
  const total = CONDITIONS.length;
  const condition = CONDITIONS[index];
  const prevIndex = (index - 1 + total) % total;
  const nextIndex = (index + 1) % total;

  function navigate(event: MouseEvent<HTMLButtonElement>, target: number) {
    event.currentTarget.closest<HTMLElement>('[role="dialog"]')?.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate(target);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={condition.slug}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
      >
        <header className="relative overflow-hidden border-b border-hairline bg-cream px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-20 size-56 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: condition.accent }}
          />
          <p className="relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brown">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: condition.accent }} />
            Condition guide · {index + 1} / {total}
          </p>
          <h2
            id="condition-title"
            className="relative mt-3 pr-10 text-3xl font-semibold tracking-display text-ink sm:text-4xl"
          >
            {condition.name}
          </h2>
          <p id="condition-summary" className="relative mt-2 text-subtle">
            {condition.short}
          </p>
        </header>

        <div className="space-y-7 px-6 py-7 sm:px-8">
          <Block icon={<Eye className="size-4" />} title="What it looks like">
            <p>{condition.looks}</p>
          </Block>
          <Block icon={<Zap className="size-4" />} title="Common triggers">
            <ul className="space-y-2">
              {condition.triggers.map((trigger) => (
                <li key={trigger} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-caramel" />
                  {trigger}
                </li>
              ))}
            </ul>
          </Block>
          <Block icon={<FlaskConical className="size-4" />} title="Key ingredients that help">
            <ul className="flex flex-wrap gap-2">
              {condition.ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="rounded-full border border-hairline bg-cream px-3 py-1 text-[13px] font-medium text-ink"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </Block>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-latte/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Lightbulb aria-hidden="true" className="size-4 text-brown" />
                One habit tip
              </p>
              <p className="mt-2 text-sm leading-relaxed text-subtle">{condition.habit}</p>
            </div>
            <div className="rounded-2xl border border-rust/25 bg-rust/[0.06] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-rust">
                <Stethoscope aria-hidden="true" className="size-4" />
                When to see a dermatologist
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/85">{condition.derm}</p>
            </div>
          </div>
          <Disclaimer />
          <div className="sm:hidden">
            <ButtonLink href={APP_URL} icon="external" className="w-full">
              {CTA.analyse}
            </ButtonLink>
          </div>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-hairline bg-warm-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={(event) => navigate(event, prevIndex)}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtle transition hover:bg-latte/70 hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">Previous: </span>
            <span className="truncate">{CONDITIONS[prevIndex].name}</span>
          </button>
          <span className="hidden sm:inline-flex">
            <ButtonLink href={APP_URL} size="sm" icon="external">
              {CTA.analyse}
            </ButtonLink>
          </span>
          <button
            type="button"
            onClick={(event) => navigate(event, nextIndex)}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtle transition hover:bg-latte/70 hover:text-ink"
          >
            <span className="sr-only">Next: </span>
            <span className="truncate">{CONDITIONS[nextIndex].name}</span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-lg bg-latte text-brown">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-3 text-[15px] leading-relaxed text-subtle">{children}</div>
    </div>
  );
}
