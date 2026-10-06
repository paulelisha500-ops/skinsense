import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { HERO } from "@/lib/content";
import { PHOTOS, photoSrc } from "@/lib/images";
import { APP_URL } from "@/lib/site";
import { HeroSlideshow, type HeroSlide } from "./HeroSlideshow";

export function Hero() {
  const slides: HeroSlide[] = HERO.slides.map((slide) => ({
    src: photoSrc(slide.photo),
    alt: PHOTOS[slide.photo].alt,
    eyebrow: slide.eyebrow,
    title: slide.title,
    position: slide.position,
  }));

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid fade-radial" />
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-48 -z-10 size-[44rem] rounded-full bg-tan/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-48 top-64 -z-10 size-[32rem] rounded-full bg-latte blur-3xl"
      />

      <Container className="grid items-center gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-16">
        <div>
          <Reveal>
            <Badge dot>
              <span className="font-medium text-ink">{HERO.badge}</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-hairline sm:block" />
              <span className="hidden sm:inline">{HERO.badgeDetail}</span>
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              id="hero-title"
              className="mt-7 text-[clamp(2.55rem,6.6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.042em] text-ink"
            >
              {HERO.titleLead} <span className="text-gradient">{HERO.titleAccent}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-subtle sm:text-xl">{HERO.sub}</p>
          </Reveal>

          <Reveal delay={0.2} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={APP_URL} size="lg" icon="external">
              {HERO.primaryCta}
            </ButtonLink>
            <ButtonLink href="/#how-it-works" size="lg" variant="secondary">
              {HERO.secondaryCta}
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.28}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-subtle">
              {HERO.assurances.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-olive/15 text-olive">
                    <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={32}>
          <HeroSlideshow
            slides={slides}
            note={HERO.photoNote}
            timer={HERO.floatingTimer}
            routine={HERO.floatingRoutine}
          />
        </Reveal>
      </Container>
    </section>
  );
}
