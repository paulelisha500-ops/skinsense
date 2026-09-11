import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Accent } from "@/components/ui/Accent";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { NOT_FOUND } from "@/lib/content";
import { APP_URL } from "@/lib/site";

const QUICK_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Conditions", href: "/#conditions" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
];

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid fade-radial" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-10 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-tan/25 blur-3xl"
      />
      <Container className="flex min-h-[72vh] flex-col items-center justify-center py-24 text-center">
        <div className="relative grid size-40 place-items-center">
          <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full animate-spin-slow">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#C8A27C" strokeWidth="1" strokeDasharray="3 6" />
          </svg>
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="absolute inset-5 animate-[spin_14s_linear_infinite_reverse]"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#B07A4A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="150 140"
            />
          </svg>
          <LogoMark size={60} />
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-brown">Error {NOT_FOUND.code}</p>
        <h1
          id="not-found-title"
          className="mt-4 max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.03] tracking-display text-ink"
        >
          <Accent text={NOT_FOUND.title} />
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-subtle">{NOT_FOUND.body}</p>

        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/faq" variant="secondary">
            Browse the FAQ
          </ButtonLink>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-2 text-sm">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-full border border-hairline bg-warm-white px-3.5 py-1.5 text-subtle transition hover:border-tan hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={APP_URL}
              rel="noopener"
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-warm-white px-3.5 py-1.5 text-subtle transition hover:border-tan hover:text-ink"
            >
              Open the app
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          </li>
        </ul>
      </Container>
    </section>
  );
}
