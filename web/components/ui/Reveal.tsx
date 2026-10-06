"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset to slide in from (px). */
  y?: number;
  /** Horizontal offset to slide in from (px). */
  x?: number;
  as?: "div" | "li" | "span";
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades + slides its children in when they scroll into view (once).
 * With prefers-reduced-motion, MotionConfig (see MotionProvider) drops the
 * transform so it becomes a gentle fade.
 */
export function Reveal({ children, className, delay = 0, y = 22, x = 0, as = "div" }: Props) {
  const props = {
    className,
    initial: { opacity: 0, y, x },
    whileInView: { opacity: 1, y: 0, x: 0 },
    viewport: { once: true, margin: "0px 0px -10% 0px" },
    transition: { duration: 0.75, delay, ease: EASE },
  };

  if (as === "li") return <motion.li {...props}>{children}</motion.li>;
  if (as === "span") return <motion.span {...props}>{children}</motion.span>;
  return <motion.div {...props}>{children}</motion.div>;
}
