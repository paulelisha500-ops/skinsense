import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRIVACY_SAFETY as P } from "@/lib/content";
import { cn } from "@/lib/utils";

export function PrivacySafety() {
  const [signIn, ...rest] = P.items;

  return (
    <section id="privacy-safety" aria-labelledby="privacy-safety-title" className="relative py-24 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading
          id="privacy-safety-title"
          eyebrow={P.eyebrow}
          title={<Accent text={P.title} />}
          lede={P.lede}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2 lg:col-span-1 lg:row-span-2">
            <article className="surface-dark relative isolate flex h-full flex-col overflow-hidden rounded-[28px] bg-espresso p-7 text-cream sm:p-8">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-dark opacity-70 fade-b" />
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-caramel/30 blur-3xl"
              />
              <span className="grid size-11 place-items-center rounded-2xl bg-tan/15 text-tan">
                <Icon name={signIn.icon} className="size-5" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-display">{signIn.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-latte/80">{signIn.body}</p>

              <div aria-hidden="true" className="mt-auto pt-10">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs text-latte/75">{P.codeLabel}</p>
                  <p className="mt-1 font-mono text-sm text-cream">{P.codeEmail}</p>
                  <div className="mt-4 grid grid-cols-6 gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "grid aspect-[4/5] place-items-center rounded-lg border font-mono text-lg",
                          i < 3 && "border-tan/40 bg-white/[0.06] text-cream",
                          i === 3 && "border-tan bg-white/[0.08] shadow-[0_0_0_3px_rgb(200_162_124/0.18)]",
                          i > 3 && "border-white/10 bg-white/[0.02]",
                        )}
                      >
                        {i < 3 ? "•" : i === 3 ? <span className="h-5 w-px animate-pulse bg-tan" /> : null}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>

          {rest.map((item, i) => (
            <Reveal key={item.title} delay={0.06 * (i + 1)}>
              <article className="h-full rounded-[28px] border border-hairline bg-warm-white p-7 shadow-soft transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift">
                <span className="grid size-11 place-items-center rounded-2xl bg-latte text-brown">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-subtle">{item.body}</p>
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.24}>
            <Link
              href="/privacy"
              className="group flex h-full flex-col rounded-[28px] border border-dashed border-tan bg-cream p-7 transition duration-300 hover:border-caramel hover:bg-warm-white"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brown">Privacy</span>
              <span className="mt-8 block text-lg font-semibold tracking-[-0.02em] text-ink">{P.linkTitle}</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-subtle">{P.linkBody}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-brown">
                {P.linkCta}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        </div>

        <Disclaimer className="mt-6" />
      </Container>
    </section>
  );
}
