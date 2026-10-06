import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

/** Small pill badge, optionally with a live "pulse" dot. */
export function Badge({
  children,
  tone = "light",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur",
        tone === "light"
          ? "border border-hairline bg-warm-white/80 text-subtle shadow-soft"
          : "border border-hairline-dark bg-white/5 text-latte",
        className,
      )}
    >
      {dot && (
        <span className="relative flex size-1.5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-caramel opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-caramel" />
        </span>
      )}
      {children}
    </span>
  );
}

/** Mono, uppercase section label. */
export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em]",
        tone === "light" ? "text-brown" : "text-tan",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-px w-5", tone === "light" ? "bg-caramel/60" : "bg-tan/60")}
      />
      {children}
    </p>
  );
}

/** Keyboard-key style chip. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-hairline bg-warm-white px-1.5 font-mono text-[10px] font-medium text-subtle shadow-[inset_0_-1px_0_var(--color-hairline)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
