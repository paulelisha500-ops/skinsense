import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";
import { CTA, DISCLAIMER, FOOTER } from "@/lib/content";
import { APP_URL } from "@/lib/site";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="surface-dark relative isolate overflow-hidden bg-espresso text-latte">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-70 fade-y" />
      <div
        aria-hidden="true"
        className="absolute -top-48 left-1/2 -z-10 h-96 w-[56rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-caramel/20 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" aria-label="SkinSense home" className="-m-1 inline-block rounded-xl p-1">
              <Wordmark tone="dark" size={30} />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-latte/75">{FOOTER.tagline}</p>
            <ButtonLink href={APP_URL} variant="light" size="sm" icon="external" className="mt-6">
              {CTA.openApp}
            </ButtonLink>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER.columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-tan">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link) => {
                    const external = link.href === "app";
                    const cls =
                      "group inline-flex items-center gap-1 rounded text-latte/80 transition-colors hover:text-cream";
                    return (
                      <li key={link.label}>
                        {external ? (
                          <a href={APP_URL} rel="noopener" className={cls}>
                            {link.label}
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </a>
                        ) : (
                          <Link href={link.href} className={cls}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div
          role="note"
          aria-label="Medical disclaimer"
          className="mt-14 rounded-2xl border border-hairline-dark bg-white/[0.03] p-5 text-[13px] leading-relaxed text-latte/80 sm:p-6"
        >
          <strong className="font-semibold text-cream">Medical disclaimer.</strong> {DISCLAIMER}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-hairline-dark pt-6 text-xs text-latte/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {YEAR} SkinSense. {FOOTER.bottom}
          </p>
          <p>
            Photos:{" "}
            <a
              href="https://unsplash.com"
              rel="noopener noreferrer"
              target="_blank"
              className="underline decoration-latte/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream"
            >
              Unsplash
            </a>
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[0.18em] select-none bg-linear-to-b from-latte/[0.12] to-transparent bg-clip-text text-center text-[clamp(4.5rem,20vw,16rem)] font-semibold leading-none tracking-[-0.06em] text-transparent"
      >
        SkinSense
      </div>
    </footer>
  );
}
