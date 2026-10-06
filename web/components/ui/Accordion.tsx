"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  question: ReactNode;
  answer: ReactNode;
};

type Props = {
  items: AccordionItem[];
  defaultOpenId?: string | null;
  headingLevel?: 2 | 3;
  className?: string;
};

/** Single-open accordion with animated height. WAI-ARIA accordion pattern. */
export function Accordion({ items, defaultOpenId = null, headingLevel = 3, className }: Props) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const uid = useId();
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-hairline bg-warm-white shadow-soft",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        const buttonId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;
        return (
          <div key={item.id} className={cn(i > 0 && "border-t border-hairline")}>
            <Heading className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="group flex w-full items-start justify-between gap-6 px-5 py-5 text-left transition-colors duration-200 hover:bg-latte/25 sm:px-7 sm:py-6"
              >
                <span className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-ink sm:text-[17px]">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-out-expo",
                    isOpen
                      ? "rotate-45 border-espresso bg-espresso text-cream"
                      : "border-hairline bg-cream text-subtle group-hover:border-tan",
                  )}
                >
                  <Plus className="size-3.5" />
                </span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 pr-12 text-[15px] leading-relaxed text-subtle sm:px-7 sm:pr-20">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
