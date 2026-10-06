import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  /** Accessible name for the list. */
  label: string;
  reverse?: boolean;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Infinite CSS marquee. The list is rendered twice (the copy is aria-hidden)
 * and the track slides by exactly half its width for a seamless loop. Pauses
 * on hover/focus; with reduced motion it becomes a static, wrapped list.
 */
export function Marquee({ items, label, reverse = false, tone = "light", className }: Props) {
  const pill = cn(
    "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
    tone === "light"
      ? "border border-hairline bg-warm-white text-ink shadow-soft"
      : "border border-hairline-dark bg-white/[0.04] text-latte",
  );
  const dot = cn("size-1.5 rounded-full", tone === "light" ? "bg-caramel" : "bg-tan");

  return (
    <div className={cn("marquee relative flex overflow-hidden py-1 fade-x", className)}>
      <ul
        aria-label={label}
        className={cn(
          "marquee-track flex w-max shrink-0 animate-marquee gap-3 pr-3",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {items.map((item) => (
          <li key={item} className={pill}>
            <span aria-hidden="true" className={dot} />
            {item}
          </li>
        ))}
        {items.map((item) => (
          <li key={`clone-${item}`} aria-hidden="true" className={cn("marquee-clone", pill)}>
            <span className={dot} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
