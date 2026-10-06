"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  /** 0–100 */
  value: number;
  delay?: number;
  className?: string;
  barClassName?: string;
  tone?: "light" | "dark";
};

/** Horizontal meter that grows to `value` when it scrolls into view. */
export function AnimatedBar({ value, delay = 0, className, barClassName, tone = "light" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-full",
        tone === "light" ? "bg-hairline/80" : "bg-white/10",
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", barClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, originX: 0 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
