import { Check, Moon, Sun } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HOW_IT_WORKS } from "@/lib/content";
import { cn } from "@/lib/utils";

type Step = (typeof HOW_IT_WORKS.steps)[number];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="relative isolate py-24 sm:py-28 lg:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots opacity-60 fade-y" />
      <Container>
        <SectionHeading
          id="how-title"
          eyebrow={HOW_IT_WORKS.eyebrow}
          title={<Accent text={HOW_IT_WORKS.title} />}
          lede={HOW_IT_WORKS.lede}
        />
        <Carousel
          label="How SkinSense works"
          className="mt-14"
          slideClassName="w-[86%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
        >
          {HOW_IT_WORKS.steps.map((step) => (
            <StepCard key={step.n} step={step} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-hairline bg-warm-white p-6 shadow-soft transition duration-500 ease-out-expo hover:-translate-y-1 hover:border-tan/70 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] transition-transform duration-500 ease-out-expo group-hover:-rotate-6">
          <Icon name={step.icon} className="size-5" />
        </span>
        <span className="font-mono text-sm text-brown">{step.n}</span>
      </div>
      <StepVisual kind={step.icon} />
      <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink">{step.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-subtle">{step.body}</p>
      <div className="mt-auto pt-6">
        <ul className="space-y-2.5 border-t border-hairline pt-5">
          {step.points.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm text-ink">
              <Check aria-hidden="true" className="size-4 shrink-0 text-olive" strokeWidth={2.5} />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

const BARS = [68, 14, 7, 5, 3, 2, 1];

function StepVisual({ kind }: { kind: string }) {
  const frame = "relative mt-6 h-40 overflow-hidden rounded-2xl border border-hairline bg-cream";

  if (kind === "camera") {
    return (
      <div aria-hidden="true" className={cn(frame, "grid place-items-center bg-dots")}>
        <span className="absolute left-3 top-3 size-5 rounded-tl-lg border-l-2 border-t-2 border-brown/40" />
        <span className="absolute right-3 top-3 size-5 rounded-tr-lg border-r-2 border-t-2 border-brown/40" />
        <span className="absolute bottom-3 left-3 size-5 rounded-bl-lg border-b-2 border-l-2 border-brown/40" />
        <span className="absolute bottom-3 right-3 size-5 rounded-br-lg border-b-2 border-r-2 border-brown/40" />
        <span className="grid size-20 place-items-center rounded-full border border-dashed border-caramel/70 bg-warm-white transition-transform duration-700 ease-out-expo group-hover:scale-105">
          <LogoMark size={40} />
        </span>
        <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline bg-warm-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">
          <span className="size-1.5 rounded-full bg-olive" />
          Centred · in focus
        </span>
      </div>
    );
  }

  if (kind === "scan") {
    return (
      <div aria-hidden="true" className={cn(frame, "p-4")}>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          <span>7 categories</span>
          <span>= 100%</span>
        </div>
        <div className="mt-3.5 space-y-[7px]">
          {BARS.map((value, i) => (
            <div key={i} className="h-[7px] rounded-full bg-hairline/80">
              <div
                className={cn(
                  "h-full origin-left rounded-full transition-transform duration-700 ease-out-expo group-hover:scale-x-105",
                  i === 0 ? "bg-linear-to-r from-brown to-caramel" : "bg-tan/70",
                )}
                style={{ width: `${Math.max(value, 3)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cn(frame, "grid grid-cols-2 gap-2 p-3")}>
      {[
        { label: "AM", icon: <Sun className="size-3.5" />, steps: ["Cleanser", "Serum", "SPF"] },
        { label: "PM", icon: <Moon className="size-3.5" />, steps: ["Cleanser", "Treatment", "Moisturizer"] },
      ].map((col) => (
        <div key={col.label} className="rounded-xl bg-warm-white p-3 ring-1 ring-hairline">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brown">
            {col.icon}
            {col.label}
          </p>
          <ol className="mt-2.5 space-y-1.5">
            {col.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-[12px] text-ink">
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-latte font-mono text-[9px] text-brown">
                  {i + 1}
                </span>
                <span className="truncate">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
