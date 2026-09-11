"use client";

import { motion } from "framer-motion";

type Props = {
  points: number[];
  label: string;
  title: string;
  note: string;
};

const W = 320;
const H = 120;
const PAD = 10;
const MIN = 40;
const MAX = 80;

/** Illustrative check-in history line chart that draws itself on scroll. */
export function ProgressChart({ points, label, title, note }: Props) {
  const xs = points.map((_, i) => PAD + (i * (W - 2 * PAD)) / Math.max(1, points.length - 1));
  const ys = points.map((v) => H - PAD - ((v - MIN) / (MAX - MIN)) * (H - 2 * PAD));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-tan">{label}</p>
        <span className="rounded-full border border-hairline-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-latte/75">
          Illustration
        </span>
      </div>
      <p className="mt-3 text-sm text-latte/85">{title}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-auto w-full overflow-visible"
        role="img"
        aria-label={`Illustrative line chart: confidence easing from ${first}% to ${last}% over ${points.length} check-ins. Not real data.`}
      >
        <defs>
          <linearGradient id="progress-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C8A27C" stopOpacity="0.32" />
            <stop offset="1" stopColor="#C8A27C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            x2={W}
            y1={H * t}
            y2={H * t}
            stroke="#F3E8DA"
            strokeOpacity="0.1"
            strokeDasharray="3 5"
          />
        ))}
        <motion.path
          d={area}
          fill="url(#progress-area)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#C8A27C"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {xs.map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy={ys[i]}
            r={3.25}
            fill="#3B2A20"
            stroke="#F3E8DA"
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.12 }}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-latte/65">
        <span>Check-in 1 · {first}%</span>
        <span>
          Check-in {points.length} · {last}%
        </span>
      </div>
      <figcaption className="mt-3 text-xs text-latte/70">{note}</figcaption>
    </figure>
  );
}
