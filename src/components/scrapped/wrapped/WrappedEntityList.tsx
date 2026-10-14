"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export type WrappedEntityRow = {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string | null;
};

type Props = {
  items: WrappedEntityRow[];
  active?: boolean;
  empty?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Mock-style numbered rows: index · cover · title / artist. */
export function WrappedEntityList({
  items,
  active = false,
  empty = "Nobody in this window. Suspicious loyalty.",
}: Props) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <p className="text-[0.95rem] leading-relaxed text-[var(--wrapped-muted)]">
        {empty}
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          className="flex items-center gap-3.5"
          initial={false}
          animate={
            active
              ? { opacity: 1, y: 0 }
              : {
                  opacity: reduceMotion ? 0.85 : 0.2,
                  y: reduceMotion ? 0 : 14,
                }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            delay: active && !reduceMotion ? 0.12 + i * 0.07 : 0,
            ease,
          }}
        >
          <span className="w-5 shrink-0 font-sans text-lg font-bold tabular-nums text-[var(--wrapped-ink)]">
            {i + 1}
          </span>
          <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-[var(--wrapped-panel)] sm:size-14">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                // List mounts inside an opacity animation; Safari skips lazy imgs.
                loading="eager"
              />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-sans text-base font-bold tracking-tight text-[var(--wrapped-ink)] sm:text-lg">
              {item.label}
            </span>
            {item.sublabel ? (
              <span className="block truncate text-sm text-[var(--wrapped-muted)]">
                {item.sublabel}
              </span>
            ) : null}
          </span>
        </motion.li>
      ))}
    </ol>
  );
}
