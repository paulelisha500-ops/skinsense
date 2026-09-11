import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqExplorer } from "@/components/sections/FaqExplorer";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_PAGE, FAQS } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about SkinSense: what it screens for, how accurate it is, how routines are chosen, what happens to your photos and how to delete your data.",
  path: "/faq",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <section aria-labelledby="faq-title" className="relative isolate overflow-x-clip">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-grid fade-radial" />
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-tan/25 blur-3xl"
        />
        <Container className="pb-24 pt-14 sm:pt-20">
          <SectionHeading
            as="h1"
            id="faq-title"
            eyebrow={FAQ_PAGE.eyebrow}
            title={<Accent text={FAQ_PAGE.title} />}
            lede={FAQ_PAGE.lede}
          />
          <Reveal delay={0.1} className="mt-12">
            <FaqExplorer />
          </Reveal>
        </Container>
      </section>
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
