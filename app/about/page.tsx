import type { Metadata } from "next";
import Image from "next/image";
import { Compass, TriangleAlert } from "lucide-react";
import { CtaBand } from "@/components/sections/CtaBand";
import { Accent } from "@/components/ui/Accent";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { ABOUT } from "@/lib/content";
import { PHOTOS, photoSrc } from "@/lib/images";
import { APP_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why SkinSense exists, the principles it is built on, how its fine-tuned EfficientNet-B0 model works, and the limits you should know about.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section aria-labelledby="about-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid fade-radial" />
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-48 -z-10 size-[40rem] rounded-full bg-tan/30 blur-3xl"
        />
        <Container className="pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
          <SectionHeading
            as="h1"
            id="about-title"
            eyebrow={ABOUT.hero.eyebrow}
            title={<Accent text={ABOUT.hero.title} />}
            lede={ABOUT.hero.lede}
          />
          <Reveal delay={0.15} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={APP_URL} size="lg" icon="external">
              {ABOUT.hero.primaryCta}
            </ButtonLink>
            <ButtonLink href="#how-the-model-works" size="lg" variant="secondary">
              {ABOUT.hero.secondaryCta}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* the problem */}
      <section aria-labelledby="problem-title" className="py-16 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal x={-28} y={0}>
            <figure className="mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-lift ring-1 ring-hairline">
                <Image
                  src={photoSrc("products")}
                  alt={PHOTOS.products.alt}
                  fill
                  sizes="(min-width: 1024px) 26rem, (min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs text-subtle">{ABOUT.problem.photoNote}</figcaption>
            </figure>
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>{ABOUT.problem.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                id="problem-title"
                className="mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.1] tracking-display text-ink"
              >
                <span aria-hidden="true" className="text-caramel">
                  “
                </span>
                {ABOUT.problem.title}
                <span aria-hidden="true" className="text-caramel">
                  ”
                </span>
              </h2>
            </Reveal>
            {ABOUT.problem.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 + i * 0.05}>
                <p className="mt-6 text-lg leading-relaxed text-subtle">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* mission */}
      <section aria-labelledby="mission-title" className="py-8">
        <Container>
          <Reveal>
            <div className="surface-dark relative isolate overflow-hidden rounded-[32px] bg-espresso px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-80 fade-radial" />
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-32 -z-10 size-[30rem] rounded-full bg-caramel/30 blur-3xl"
              />
              <Eyebrow tone="dark">{ABOUT.mission.eyebrow}</Eyebrow>
              <h2
                id="mission-title"
                className="mt-5 max-w-3xl text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-display text-cream"
              >
                <Accent tone="dark" text={ABOUT.mission.title} />
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-latte/85">{ABOUT.mission.body}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* principles */}
      <section aria-labelledby="principles-title" className="py-24 sm:py-28">
        <Container>
          <SectionHeading
            id="principles-title"
            eyebrow={ABOUT.principles.eyebrow}
            title={<Accent text={ABOUT.principles.title} />}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT.principles.items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.06}>
                <TiltCard className="h-full rounded-3xl">
                  <article className="flex h-full flex-col rounded-3xl border border-hairline bg-warm-white p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-espresso text-cream">
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <span className="font-mono text-sm text-brown">0{i + 1}</span>
                    </div>
                    <h3 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-subtle">{item.body}</p>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* how the model works */}
      <section
        id="how-the-model-works"
        aria-labelledby="model-title"
        className="border-y border-hairline bg-latte/60 py-24 sm:py-28"
      >
        <Container>
          <SectionHeading
            id="model-title"
            eyebrow={ABOUT.model.eyebrow}
            title={<Accent text={ABOUT.model.title} />}
            lede={ABOUT.model.lede}
          />
          <ol className="relative mt-14 grid gap-4 md:grid-cols-5">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-[2.35rem] hidden h-px bg-linear-to-r from-transparent via-tan to-transparent md:block"
            />
            {ABOUT.model.pipeline.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
                <div className="h-full rounded-2xl border border-hairline bg-warm-white p-5 shadow-soft">
                  <span className="grid size-9 place-items-center rounded-full bg-espresso font-mono text-xs text-cream ring-4 ring-latte">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-subtle">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8">
            <dl className="grid gap-px overflow-hidden rounded-2xl bg-hairline ring-1 ring-hairline sm:grid-cols-2 lg:grid-cols-3">
              {ABOUT.model.spec.map((row) => (
                <div key={row.k} className="bg-warm-white p-5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-brown">{row.k}</dt>
                  <dd className="mt-1.5 font-mono text-[13px] leading-relaxed text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* limits */}
      <section aria-labelledby="limits-title" className="py-24 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="limits-title"
              eyebrow={ABOUT.limits.eyebrow}
              title={<Accent text={ABOUT.limits.title} />}
              lede={ABOUT.limits.lede}
            />
            <Reveal delay={0.1}>
              <Disclaimer className="mt-8" />
            </Reveal>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {ABOUT.limits.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={(i % 2) * 0.06}
                className="rounded-2xl border border-hairline bg-warm-white p-6 shadow-soft"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-amber/15 text-brown">
                  <TriangleAlert aria-hidden="true" className="size-4" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{item.body}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* what's next */}
      <section aria-labelledby="next-title" className="pb-16">
        <Container>
          <Reveal>
            <div className="rounded-[28px] border border-hairline bg-warm-white p-6 shadow-soft sm:p-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Eyebrow>{ABOUT.next.eyebrow}</Eyebrow>
                  <h2
                    id="next-title"
                    className="mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.08] tracking-display text-ink"
                  >
                    <Accent text={ABOUT.next.title} />
                  </h2>
                </div>
                <Badge className="self-start sm:self-auto">
                  <Compass aria-hidden="true" className="size-3.5" />
                  {ABOUT.next.note}
                </Badge>
              </div>
              <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {ABOUT.next.items.map((item) => (
                  <li key={item.title} className="border-t border-hairline pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brown">Intention</p>
                    <h3 className="mt-3 font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-subtle">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
