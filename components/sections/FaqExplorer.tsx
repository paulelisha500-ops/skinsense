"use client";

import { motion } from "framer-motion";
import { Search, SearchX, X } from "lucide-react";
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Accordion } from "@/components/ui/Accordion";
import { Kbd } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { CTA, FAQ_CATEGORIES, FAQ_PAGE, FAQS, type Faq, type FaqCategoryId } from "@/lib/content";
import { APP_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Filter = FaqCategoryId | "all";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps every occurrence of the search tokens in <mark>. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const sorted = [...tokens].sort((a, b) => b.length - a.length);
  const parts = text.split(new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[4px] bg-tan/45 px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Full FAQ: topic tabs + live search with highlighted matches. */
export function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const tokens = useMemo(
    () => deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [deferredQuery],
  );

  const searchHits = useMemo(
    () =>
      FAQS.filter((faq) => {
        const haystack = `${faq.q} ${faq.a}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      }),
    [tokens],
  );

  const visible = category === "all" ? searchHits : searchHits.filter((faq) => faq.category === category);
  const countFor = (id: Filter) =>
    id === "all" ? searchHits.length : searchHits.filter((faq) => faq.category === id).length;
  const activeLabel = FAQ_CATEGORIES.find((c) => c.id === category)?.label ?? "All";
  const trimmed = query.trim();

  const groups =
    category === "all"
      ? FAQ_CATEGORIES.filter((c) => c.id !== "all")
          .map((c) => ({ id: c.id, label: c.label, items: visible.filter((faq) => faq.category === c.id) }))
          .filter((group) => group.items.length > 0)
      : [{ id: category, label: activeLabel, items: visible }];

  // Press "/" anywhere on the page to jump to the search box.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const ids = FAQ_CATEGORIES.map((c) => c.id);
    const current = ids.indexOf(category);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % ids.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + ids.length) % ids.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ids.length - 1;
    else return;
    event.preventDefault();
    setCategory(ids[next]);
    document.getElementById(`faq-tab-${ids[next]}`)?.focus();
  }

  function resetAll() {
    setQuery("");
    setCategory("all");
    inputRef.current?.focus();
  }

  const toItems = (items: Faq[]) =>
    items.map((faq) => ({
      id: faq.id,
      question: <Highlight text={faq.q} tokens={tokens} />,
      answer: <Highlight text={faq.a} tokens={tokens} />,
    }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_19rem] lg:gap-12">
      <div className="min-w-0">
        {/* search */}
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            {FAQ_PAGE.searchLabel}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle"
          />
          <input
            ref={inputRef}
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              }
            }}
            placeholder={FAQ_PAGE.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="faq-result-count"
            className="h-14 w-full rounded-2xl border border-hairline bg-warm-white pl-11 pr-14 text-[15px] text-ink shadow-soft transition placeholder:text-subtle focus:border-tan focus:outline-none focus:ring-4 focus:ring-tan/25 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="grid size-8 place-items-center rounded-full text-subtle transition hover:bg-latte hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <span aria-hidden="true" className="hidden sm:inline-flex">
                <Kbd>/</Kbd>
              </span>
            )}
          </div>
        </div>

        {/* topic tabs */}
        <div
          role="tablist"
          aria-label="Question topics"
          onKeyDown={handleTabKeyDown}
          className="no-scrollbar -mx-5 mt-5 flex gap-1.5 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {FAQ_CATEGORIES.map((c) => {
            const selected = c.id === category;
            return (
              <button
                key={c.id}
                id={`faq-tab-${c.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="faq-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "relative z-0 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                  selected
                    ? "border-espresso text-cream"
                    : "border-hairline bg-warm-white text-subtle hover:border-tan hover:text-ink",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="faq-tab-pill"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-espresso"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {c.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 font-mono text-[11px] tabular-nums",
                    selected ? "bg-white/15 text-latte" : "bg-latte text-subtle",
                  )}
                >
                  {countFor(c.id)}
                </span>
              </button>
            );
          })}
        </div>

        <p id="faq-result-count" aria-live="polite" className="mt-5 text-sm text-subtle">
          {visible.length} {visible.length === 1 ? "question" : "questions"}
          {trimmed ? ` matching “${trimmed}”` : ""}
          {category !== "all" ? ` in ${activeLabel}` : ""}
        </p>

        {/* results */}
        <div id="faq-panel" role="tabpanel" aria-labelledby={`faq-tab-${category}`} className="mt-4">
          {visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-tan bg-warm-white/60 px-6 py-14 text-center">
              <SearchX aria-hidden="true" className="mx-auto size-8 text-caramel" />
              <p className="mt-4 font-medium text-ink">
                {FAQ_PAGE.emptyTitle}
                {trimmed ? ` “${trimmed}”` : ""}
              </p>
              <p className="mt-2 text-sm text-subtle">{FAQ_PAGE.emptyBody}</p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-6 inline-flex h-10 items-center rounded-full bg-espresso px-5 text-sm font-medium text-cream transition hover:bg-coffee"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((group, groupIndex) => (
                <section key={group.id} aria-labelledby={`faq-group-${group.id}`}>
                  <h2
                    id={`faq-group-${group.id}`}
                    className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brown"
                  >
                    {group.label}
                    <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
                  </h2>
                  {/* while searching, remount per query and open the first match
                      so its highlighted answer is visible straight away */}
                  <Accordion
                    key={tokens.length ? `${group.id}:${tokens.join("+")}` : group.id}
                    items={toItems(group.items)}
                    defaultOpenId={tokens.length && groupIndex === 0 ? (group.items[0]?.id ?? null) : null}
                  />
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside aria-label="More help" className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="surface-dark relative isolate overflow-hidden rounded-3xl bg-espresso p-6 text-cream">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 -z-10 size-56 rounded-full bg-caramel/35 blur-3xl"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-tan">{FAQ_PAGE.asideEyebrow}</p>
          <p className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em]">{FAQ_PAGE.asideTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-latte/85">{FAQ_PAGE.asideBody}</p>
          <ButtonLink href={APP_URL} variant="light" size="sm" icon="external" className="mt-5">
            {CTA.openApp}
          </ButtonLink>
        </div>
        <Disclaimer />
      </aside>
    </div>
  );
}
