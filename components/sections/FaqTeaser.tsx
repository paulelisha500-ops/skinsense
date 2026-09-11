import { Accent } from "@/components/ui/Accent";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_TEASER, FAQS } from "@/lib/content";

export function FaqTeaser() {
  const featured = FAQS.filter((faq) => faq.featured).slice(0, 5);

  return (
    <section
      aria-labelledby="faq-teaser-title"
      className="relative border-y border-hairline bg-latte/60 py-24 sm:py-28 lg:py-32"
    >
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-teaser-title"
            eyebrow={FAQ_TEASER.eyebrow}
            title={<Accent text={FAQ_TEASER.title} />}
            lede={FAQ_TEASER.lede}
          />
          <Reveal delay={0.1} className="mt-8">
            <ButtonLink href="/faq" variant="secondary">
              {FAQ_TEASER.cta}
            </ButtonLink>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <Accordion
            items={featured.map((faq) => ({ id: faq.id, question: faq.q, answer: faq.a }))}
            defaultOpenId={featured[0]?.id ?? null}
          />
        </Reveal>
      </Container>
    </section>
  );
}
