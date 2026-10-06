import type { Metadata } from "next";
import { Ban, Check, Clock, Mail, Trash2 } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRIVACY } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What SkinSense stores, what it doesn't, and how to ask for your data to be deleted, in plain language.",
  path: "/privacy",
});

type TextBlock = { id: string; title: string; body: string };

export default function PrivacyPage() {
  const byId = Object.fromEntries(PRIVACY.sections.map((s) => [s.id, s])) as Record<string, TextBlock>;
  const toc = [
    { id: "at-a-glance", label: PRIVACY.glanceTitle },
    { id: "where", label: byId.where.title },
    { id: "why", label: byId.why.title },
    { id: "deletion", label: PRIVACY.deletion.title },
    { id: "this-site", label: byId["this-site"].title },
    { id: "changes", label: byId.changes.title },
    { id: "medical", label: PRIVACY.medicalTitle },
  ];

  return (
    <>
      <section aria-labelledby="privacy-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid fade-radial" />
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-tan/25 blur-3xl"
        />
        <Container className="pb-14 pt-14 sm:pt-20">
          <SectionHeading
            as="h1"
            id="privacy-title"
            eyebrow={PRIVACY.eyebrow}
            title={<Accent text={PRIVACY.title} />}
            lede={PRIVACY.lede}
          />
          <Reveal delay={0.1}>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-warm-white px-3 py-1 font-mono text-xs text-subtle">
              <Clock aria-hidden="true" className="size-3.5" />
              Last updated {PRIVACY.updated}
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="grid gap-12 pb-24 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brown">On this page</p>
            <ul className="mt-4 space-y-0.5 border-l border-hairline">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-subtle transition-colors hover:border-caramel hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-16">
          <section id="at-a-glance" aria-labelledby="glance-title">
            <h2 id="glance-title" className="text-2xl font-semibold tracking-display text-ink sm:text-3xl">
              {PRIVACY.glanceTitle}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <GlanceCard kind="stored" title={PRIVACY.stored.title} items={PRIVACY.stored.items} />
              <GlanceCard kind="not" title={PRIVACY.notStored.title} items={PRIVACY.notStored.items} />
            </div>
          </section>

          <TextSection block={byId.where} />
          <TextSection block={byId.why} />

          <section id="deletion" aria-labelledby="deletion-title">
            <Reveal>
              <div className="surface-dark relative isolate overflow-hidden rounded-[28px] bg-espresso p-7 text-cream sm:p-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-caramel/30 blur-3xl"
                />
                <span className="grid size-11 place-items-center rounded-2xl bg-tan/15 text-tan">
                  <Trash2 aria-hidden="true" className="size-5" />
                </span>
                <h2 id="deletion-title" className="mt-6 text-2xl font-semibold tracking-display sm:text-3xl">
                  {PRIVACY.deletion.title}
                </h2>
                <p className="mt-4 flex items-start gap-2 text-lg font-medium text-tan">
                  <Mail aria-hidden="true" className="mt-1 size-5 shrink-0" />
                  {PRIVACY.deletion.lead}
                </p>
                <p className="mt-3 max-w-2xl leading-relaxed text-latte/85">{PRIVACY.deletion.body}</p>
              </div>
            </Reveal>
          </section>

          <TextSection block={byId["this-site"]} />
          <TextSection block={byId.changes} />

          <section id="medical" aria-labelledby="medical-title" className="border-t border-hairline pt-8">
            <h2 id="medical-title" className="text-2xl font-semibold tracking-display text-ink">
              {PRIVACY.medicalTitle}
            </h2>
            <Disclaimer className="mt-5" />
          </section>
        </div>
      </Container>
    </>
  );
}

function GlanceCard({
  kind,
  title,
  items,
}: {
  kind: "stored" | "not";
  title: string;
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <Reveal delay={kind === "stored" ? 0 : 0.06} className="h-full">
      <div className="h-full rounded-[24px] border border-hairline bg-warm-white p-6 shadow-soft sm:p-7">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em] text-ink">
          <span
            aria-hidden="true"
            className={cn(
              "grid size-8 place-items-center rounded-full",
              kind === "stored" ? "bg-olive/15 text-olive" : "bg-rust/10 text-rust",
            )}
          >
            {kind === "stored" ? <Check className="size-4" strokeWidth={2.5} /> : <Ban className="size-4" />}
          </span>
          {title}
        </h3>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.title} className="border-t border-hairline pt-4">
              <p className="font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-subtle">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function TextSection({ block }: { block: TextBlock }) {
  return (
    <section id={block.id} aria-labelledby={`${block.id}-title`} className="border-t border-hairline pt-8">
      <h2 id={`${block.id}-title`} className="text-2xl font-semibold tracking-display text-ink">
        {block.title}
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-subtle">{block.body}</p>
    </section>
  );
}
