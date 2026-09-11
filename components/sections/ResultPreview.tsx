import { CircleCheck } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { AnimatedBar } from "@/components/ui/AnimatedBar";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EXAMPLE_READING as R } from "@/lib/content";
import { cn } from "@/lib/utils";

const BANDS = ["Mild", "Moderate", "Severe"];

export function ResultPreview() {
  return (
    <section aria-labelledby="reading-title" className="relative overflow-x-clip py-24 sm:py-28 lg:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading
            id="reading-title"
            eyebrow={R.eyebrow}
            title={<Accent text={R.title} />}
            lede={R.lede}
          />
          <ul className="mt-10 grid gap-7 sm:grid-cols-2">
            {R.points.map((point, i) => (
              <Reveal as="li" key={point.title} delay={0.05 * i}>
                <span className="grid size-10 place-items-center rounded-xl border border-hairline bg-warm-white text-brown shadow-soft">
                  <Icon name={point.icon} className="size-[18px]" />
                </span>
                <h3 className="mt-4 font-semibold tracking-[-0.01em] text-ink">{point.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-subtle">{point.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal y={36} delay={0.1}>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[40px] bg-linear-to-br from-tan/40 via-latte to-transparent blur-2xl"
            />
            <figure
              aria-label={`${R.label}: ${R.note}`}
              className="overflow-hidden rounded-[28px] border border-hairline bg-warm-white shadow-lift"
            >
              {/* window chrome */}
              <div className="flex items-center justify-between gap-3 border-b border-hairline bg-cream/80 px-5 py-3">
                <div aria-hidden="true" className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-hairline" />
                  <span className="size-2.5 rounded-full bg-hairline" />
                  <span className="size-2.5 rounded-full bg-hairline" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-warm-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brown">
                  <span aria-hidden="true" className="size-1.5 animate-pulse-soft rounded-full bg-amber" />
                  {R.label}
                </span>
              </div>

              <div className="space-y-3 p-4 sm:p-6">
                {/* headline */}
                <div className="surface-dark relative overflow-hidden rounded-2xl bg-linear-to-br from-espresso to-coffee px-6 py-7 text-center">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-16 size-48 rounded-full bg-caramel/40 blur-3xl"
                  />
                  <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-tan">Top result</p>
                  <p className="relative mt-2 text-3xl font-semibold tracking-display text-cream sm:text-4xl">
                    {R.top}
                  </p>
                </div>

                {/* confidence + severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-hairline bg-cream/60 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Confidence</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
                      <Counter value={R.confidence} suffix="%" />
                    </p>
                    <AnimatedBar
                      value={R.confidence}
                      className="mt-3 h-1.5"
                      barClassName="bg-linear-to-r from-brown to-caramel"
                    />
                  </div>
                  <div className="rounded-2xl border border-hairline bg-cream/60 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Severity</p>
                    <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
                      <span aria-hidden="true" className="size-2.5 rounded-full bg-olive" />
                      {R.severity}
                    </p>
                    <div aria-hidden="true" className="mt-3 grid grid-cols-3 gap-1">
                      {BANDS.map((band) => (
                        <span
                          key={band}
                          className={cn("h-1.5 rounded-full", band === R.severity ? "bg-olive" : "bg-hairline")}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* breakdown */}
                <div className="rounded-2xl border border-hairline p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                      All seven categories
                    </p>
                    <p className="text-xs text-subtle">Totals 100%</p>
                  </div>
                  <ul className="mt-3.5 space-y-2.5">
                    {R.breakdown.map((row, i) => (
                      <li
                        key={row.name}
                        className="grid grid-cols-[7.75rem_1fr_2.4rem] items-center gap-3 text-[13px] sm:grid-cols-[9rem_1fr_2.5rem]"
                      >
                        <span className={cn("truncate", i === 0 ? "font-medium text-ink" : "text-subtle")}>
                          {row.name}
                        </span>
                        <AnimatedBar
                          value={row.value}
                          delay={0.05 * i}
                          className="h-1.5"
                          barClassName={i === 0 ? "bg-linear-to-r from-brown to-caramel" : "bg-tan"}
                        />
                        <span className="text-right font-mono tabular-nums text-subtle">{row.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* recommendation */}
                <div className="flex items-start gap-3 rounded-2xl border border-olive/25 bg-olive/[0.07] p-4">
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-olive" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{R.doctor}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-subtle">{R.severityNote}</p>
                  </div>
                </div>
              </div>

              <figcaption className="border-t border-hairline bg-cream/70 px-5 py-3 text-center text-xs text-subtle">
                {R.note}
              </figcaption>
            </figure>
          </div>
          <Disclaimer className="mt-5" />
        </Reveal>
      </Container>
    </section>
  );
}
