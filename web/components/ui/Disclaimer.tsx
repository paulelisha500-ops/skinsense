import { Info } from "lucide-react";
import { DISCLAIMER } from "@/lib/content";
import { cn } from "@/lib/utils";

/** The medical disclaimer, shown near results and claims. */
export function Disclaimer({
  tone = "light",
  title = "Not a diagnosis.",
  className,
}: {
  tone?: "light" | "dark";
  title?: string;
  className?: string;
}) {
  return (
    <div
      role="note"
      aria-label="Medical disclaimer"
      className={cn(
        "flex gap-3 rounded-2xl p-4 text-[13px] leading-relaxed sm:p-5",
        tone === "light"
          ? "border border-hairline bg-latte/35 text-subtle"
          : "border border-hairline-dark bg-white/[0.04] text-latte/80",
        className,
      )}
    >
      <Info
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", tone === "light" ? "text-brown" : "text-tan")}
      />
      <p>
        <strong className={cn("font-semibold", tone === "light" ? "text-ink" : "text-cream")}>
          {title}
        </strong>{" "}
        {DISCLAIMER}
      </p>
    </div>
  );
}
