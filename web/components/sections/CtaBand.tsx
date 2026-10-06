import { Accent } from "@/components/ui/Accent";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { FINAL_CTA } from "@/lib/content";
import { APP_URL } from "@/lib/site";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="pb-24 pt-4 sm:pb-28">
      <Container>
        <Reveal>
          <div className="surface-dark relative isolate overflow-hidden rounded-[32px] bg-espresso px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark fade-radial" />
            <div
              aria-hidden="true"
              className="absolute -top-40 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-caramel/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-48 right-0 -z-10 size-96 rounded-full bg-coffee blur-3xl"
            />

            <div className="relative mx-auto grid size-24 place-items-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="absolute inset-0 size-full animate-spin-slow"
              >
                <circle cx="50" cy="50" r="47" fill="none" stroke="#C8A27C" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <LogoMark size={52} tone="dark" />
            </div>

            <h2
              id="cta-title"
              className="mx-auto mt-8 max-w-3xl text-[clamp(2rem,4.8vw,3.5rem)] font-semibold leading-[1.05] tracking-display text-cream"
            >
              <Accent tone="dark" text={FINAL_CTA.title} />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-latte/85 sm:text-lg">{FINAL_CTA.body}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href={APP_URL} variant="light" size="lg" icon="external">
                {FINAL_CTA.primary}
              </ButtonLink>
              <ButtonLink href="/faq" variant="outline-light" size="lg">
                {FINAL_CTA.secondary}
              </ButtonLink>
            </div>
            <p className="mt-8 text-xs text-latte/70">{FINAL_CTA.footnote}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
