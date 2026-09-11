"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useIsClient, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** id of the element that names the dialog (usually its heading). */
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Accessible modal: portal to <body>, focus trapped, Escape and overlay click
 * close it, page scroll is locked and focus returns to the trigger on close.
 * Slides up as a sheet on phones, scales in centred on larger screens.
 */
export function Dialog({ open, ...rest }: DialogProps) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(
    <AnimatePresence>{open && <DialogPanel key="dialog" {...rest} />}</AnimatePresence>,
    document.body,
  );
}

function DialogPanel({ onClose, labelledBy, describedBy, children, className }: Omit<DialogProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, { onEscape: onClose });
  useScrollLock(true);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-espresso/55 backdrop-blur-[6px]"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        initial={{ opacity: 0, y: 56, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 36, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className={cn(
          "relative max-h-[90dvh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-warm-white shadow-lift outline-none ring-1 ring-hairline sm:max-w-2xl sm:rounded-[28px]",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-hairline bg-cream/90 text-subtle backdrop-blur transition hover:border-tan hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
