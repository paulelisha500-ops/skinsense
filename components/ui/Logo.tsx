import { useId } from "react";
import { cn, safeId } from "@/lib/utils";

type Tone = "light" | "dark";

/** Colours for the mark on light (cream) and dark (espresso) backgrounds. */
const MARK_COLORS: Record<Tone, { c1: string; c2: string; ring: string; vein: string }> = {
  light: { c1: "#C8A27C", c2: "#6F4E37", ring: "#B07A4A", vein: "#FFFDF9" },
  dark: { c1: "#E6C9A3", c2: "#B07A4A", ring: "#F3E8DA", vein: "#3B2A20" },
};

type MarkProps = {
  size?: number;
  tone?: Tone;
  className?: string;
};

/** The SkinSense mark: a dashed scan ring around a leaf-droplet with a central vein. */
export function LogoMark({ size = 32, tone = "light", className }: MarkProps) {
  const gid = `ss-leaf-${safeId(useId())}`;
  const c = MARK_COLORS[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gid} x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.c1} />
          <stop offset="1" stopColor={c.c2} />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="21.2"
        stroke={c.ring}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="88 22"
        className="origin-center transition-transform duration-700 ease-(--ease-out-expo) [transform-box:fill-box] group-hover:rotate-[140deg]"
      />
      <path
        d="M24 9.5c6.4 4.6 10.6 10.2 10.6 15.6 0 6-4.7 10.4-10.6 10.4S13.4 31.1 13.4 25.1c0-5.4 4.2-11 10.6-15.6z"
        fill={`url(#${gid})`}
      />
      <path d="M24 15.5v15.8" stroke={c.vein} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <path
        d="M24 22.6l4.4-3.6M24 27.4l-4.4-3.6"
        stroke={c.vein}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

type WordmarkProps = MarkProps & {
  /** Hide the text visually but keep it for screen readers (icon-only logo). */
  markOnly?: boolean;
};

/** Mark + "Skin" (ink) "Sense" (caramel) wordmark. */
export function Wordmark({ size = 30, tone = "light", className, markOnly = false }: WordmarkProps) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} tone={tone} />
      <span
        className={cn("font-semibold leading-none tracking-[-0.03em]", markOnly && "sr-only")}
        style={{ fontSize: Math.round(size * 0.6) }}
      >
        <span className={tone === "light" ? "text-ink" : "text-cream"}>Skin</span>
        <span className={tone === "light" ? "text-caramel" : "text-tan"}>Sense</span>
      </span>
    </span>
  );
}
