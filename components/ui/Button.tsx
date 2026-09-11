import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,transform,color] duration-300 ease-out-expo active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-espresso text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(43_29_20/0.3),0_10px_24px_-12px_rgb(43_29_20/0.7)] hover:-translate-y-0.5 hover:bg-coffee",
  secondary:
    "bg-warm-white text-ink shadow-soft ring-1 ring-inset ring-hairline hover:-translate-y-0.5 hover:ring-tan",
  ghost: "text-ink hover:bg-latte/60",
  light:
    "bg-cream text-espresso shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] hover:-translate-y-0.5 hover:bg-warm-white",
  "outline-light": "text-cream ring-1 ring-inset ring-cream/25 hover:bg-cream/5 hover:ring-cream/60",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: "arrow" | "external" | "none";
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
};

/** Pill-shaped call-to-action. External (http) links render a plain <a>. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  icon = "arrow",
  className,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const Icon = icon === "external" ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      {icon !== "none" && (
        <Icon
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-300 ease-out-expo",
            icon === "external"
              ? "group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
              : "group-hover/btn:translate-x-0.5",
          )}
        />
      )}
    </>
  );

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={classes} rel="noopener" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
