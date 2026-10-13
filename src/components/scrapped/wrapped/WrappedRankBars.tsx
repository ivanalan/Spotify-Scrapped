"use client";

import { motion, useReducedMotion } from "motion/react";
import type { RankBarItem } from "@/components/scrapped/visuals/RankBars";

type Props = {
  items: RankBarItem[];
  active?: boolean;
  maxValue?: number;
};

export function WrappedRankBars({ items, active = false, maxValue }: Props) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--wrapped-muted)]">
        Not enough signal in this window.
      </p>
    );
  }

  const max = maxValue ?? Math.max(...items.map((i) => i.value), 0.0001);

  return (
    <ol className="divide-y divide-[var(--wrapped-ink)]/12 border border-[var(--wrapped-ink)]/20">
      {items.map((item, i) => {
        const width = Math.max(4, (item.value / max) * 100);
        return (
          <li key={item.id} className="px-3 py-3">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold uppercase tracking-tight text-[var(--wrapped-ink)]">
                  <span className="mr-2 font-mono text-xs text-[var(--wrapped-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </p>
                {item.sublabel ? (
                  <p className="truncate pl-7 text-xs text-[var(--wrapped-muted)]">
                    {item.sublabel}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--wrapped-accent)]">
                {item.display}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden bg-[var(--wrapped-ink)]/10">
              <motion.div
                className="h-full bg-[var(--wrapped-accent)]"
                initial={false}
                animate={
                  active
                    ? { width: `${width}%`, opacity: 1 }
                    : {
                        width: reduceMotion ? `${width}%` : "0%",
                        opacity: reduceMotion ? 1 : 0.35,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.45,
                  delay: active && !reduceMotion ? i * 0.04 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
