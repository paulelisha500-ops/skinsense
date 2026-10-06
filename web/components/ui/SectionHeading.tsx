import type { ReactNode } from "react";
import { Eyebrow } from "./Badge";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** id for the <h2>, so the parent <section> can use aria-labelledby. */
  id?: string;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "light",
  id,
  as = "h2",
  className,
}: Props) {
  const Heading = as;
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Eyebrow tone={tone} className={align === "center" ? "justify-center" : undefined}>
          {eyebrow}
        </Eyebrow>
      )}
      <Heading
        id={id}
        className={cn(
          "mt-4 font-semibold leading-[1.04] tracking-display",
          as === "h1" ? "text-[clamp(2.4rem,6vw,4.5rem)]" : "text-[clamp(2rem,4.4vw,3.35rem)]",
          tone === "light" ? "text-ink" : "text-cream",
        )}
      >
        {title}
      </Heading>
      {lede && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "light" ? "text-subtle" : "text-latte/80",
          )}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}
