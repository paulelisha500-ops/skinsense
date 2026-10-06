"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";
import { CTA, NAV_LINKS } from "@/lib/content";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { APP_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const getScrolled = () => window.scrollY > 8;
const getScrolledOnServer = () => false;

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getScrolledOnServer);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(headerRef, open, {
    onEscape: () => {
      setOpen(false);
      toggleRef.current?.focus();
    },
    initialFocus: firstMobileLinkRef,
  });
  useScrollLock(open);

  // Close the mobile menu if the viewport grows to desktop size.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  const solid = scrolled || open;

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      {/* glass layer lives on its own element so the fixed mobile panel isn't
          trapped inside a backdrop-filter containing block */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,opacity] duration-300",
          solid ? "border-hairline/90 bg-cream/80 opacity-100" : "border-transparent bg-cream/0 opacity-0",
        )}
      />
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          aria-label="SkinSense home"
          onClick={() => setOpen(false)}
          className="-m-1 rounded-xl p-1"
        >
          <Wordmark size={28} />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex" onMouseLeave={() => setHovered(null)}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "relative block rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
                    active ? "font-medium text-ink" : "text-subtle hover:text-ink",
                  )}
                >
                  {active && (
                    <span aria-hidden="true" className="absolute inset-0 rounded-full bg-latte/45" />
                  )}
                  {hovered === link.href && (
                    <motion.span
                      aria-hidden="true"
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-latte/70"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex">
            <ButtonLink href={APP_URL} size="sm" icon="external">
              {CTA.openApp}
            </ButtonLink>
          </span>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full border border-hairline bg-warm-white/80 text-ink shadow-soft transition active:scale-95 lg:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={open ? "close" : "open"}
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-hairline bg-cream lg:hidden"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dots opacity-40 fade-b" />
            <div className="relative flex min-h-full flex-col justify-between px-5 pb-10 pt-4 sm:px-6">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        ref={i === 0 ? firstMobileLinkRef : undefined}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-center justify-between border-b border-hairline py-4 text-[26px] font-medium tracking-[-0.025em] text-ink"
                      >
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true" className="font-mono text-xs font-normal text-faint">
                            0{i + 1}
                          </span>
                          {link.label}
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className={cn(
                            "size-5 transition-transform group-hover:translate-x-1",
                            active ? "text-brown" : "text-caramel",
                          )}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <div className="mt-10 space-y-3">
                <ButtonLink href={APP_URL} size="lg" icon="external" className="w-full" onClick={() => setOpen(false)}>
                  {CTA.openApp}
                </ButtonLink>
                <p className="text-center text-xs text-subtle">
                  Free to use · Educational screening, not a diagnosis
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
