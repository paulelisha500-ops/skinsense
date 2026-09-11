import { ScanFace, ShieldCheck } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROGRESS } from "@/lib/content";
import { ProgressChart } from "./ProgressChart";

export function Progress() {
  return (
    <section
      id="progress"
      aria-labelledby="progress-title"
      className="surface-dark relative isolate overflow-hidden bg-espresso py-24 text-cream sm:py-28 lg:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-70 fade-y" />
      <div
        aria-hidden="true"
        className="absolute -right-40 top-0 -z-10 size-[40rem] rounded-full bg-caramel/25 blur-3xl"
      />

      <Container>
        <SectionHeading
          tone="dark"
          id="progress-title"
          eyebrow={PROGRESS.eyebrow}
          title={<Accent tone="dark" text={PROGRESS.title} />}
          lede={PROGRESS.lede}
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          {/* before / after */}
          <Reveal className="rounded-[28px] border border-hairline-dark bg-white/[0.03] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-tan">{PROGRESS.panelsTitle}</p>
              <span className="text-xs text-latte/75">{PROGRESS.panelsTag}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              {PROGRESS.panels.map((panel) => (
                <figure key={panel.label} className="flex flex-col">
                  <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl border border-dashed border-latte/25 bg-white/[0.02]">
                    <span className="absolute left-3 top-3 rounded-full bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-latte/85">
                      {panel.tag}
                    </span>
                    <span aria-hidden="true" className="absolute inset-6 rounded-[40%] border border-latte/10" />
                    <div className="flex flex-col items-center px-3 text-center">
                      <ScanFace aria-hidden="true" className="size-10 text-latte/45" strokeWidth={1.25} />
                      <p className="mt-3 text-[11px] leading-snug text-latte/70">Fills with your photo</p>
                    </div>
                  </div>
                  <figcaption className="mt-3">
                    <p className="text-sm font-medium text-cream">{panel.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-latte/75">{panel.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 flex gap-2.5 rounded-xl bg-white/[0.05] p-3.5 text-xs leading-relaxed text-latte/85">
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-tan" />
              {PROGRESS.panelsNote}
            </p>
          </Reveal>

          <div className="grid gap-5">
            <Reveal delay={0.08} className="rounded-[28px] border border-hairline-dark bg-white/[0.03] p-5 sm:p-7">
              <ProgressChart
                points={PROGRESS.chartPoints}
                label={PROGRESS.chartLabel}
                title={PROGRESS.chartTitle}
                note={PROGRESS.chartNote}
              />
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-2">
              {PROGRESS.features.map((feature, i) => (
                <Reveal
                  as="li"
                  key={feature.title}
                  delay={0.1 + i * 0.05}
                  className="rounded-2xl border border-hairline-dark bg-white/[0.03] p-5 transition-colors duration-300 hover:border-tan/40"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-tan/15 text-tan">
                    <Icon name={feature.icon} className="size-4" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-cream">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-latte/80">{feature.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
