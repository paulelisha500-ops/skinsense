import { Fragment } from "react";

/**
 * Renders a title from lib/content.ts, turning any *starred* part into the
 * brand gradient accent. "Photo in. *Plan out.*" → "Photo in. <gradient>Plan out.</gradient>"
 */
export function Accent({ text, tone = "light" }: { text: string; tone?: "light" | "dark" }) {
  const parts = text.split(/\*(.+?)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={tone === "light" ? "text-gradient" : "text-gradient-light"}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
