"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  DEFAULT_LIST_MOTION,
  planListRowMotion,
  type ListMotionId,
  type ListMotionOverrides,
} from "@/lib/scrapped-list-motion";

export type WrappedEntityRow = {
  id: string;
  label: string;
  sublabel?: ReactNode;
  imageUrl?: string | null;
  /** Solid cover fill when there is no image (labs / empty art). */
  coverColor?: string;
};

type Props = {
  items: WrappedEntityRow[];
  active?: boolean;
  empty?: string;
  /** Discrete enter style — see List Motion Lab. */
  motion?: ListMotionId;
  /** Optional cascade tuning (labs). */
  motionOverrides?: ListMotionOverrides;
};

/** Mock-style numbered rows: index · cover · title / artist. */
export function WrappedEntityList({
  items,
  active = false,
  empty = "Nobody in this window. Suspicious loyalty.",
  motion: motionId = DEFAULT_LIST_MOTION,
  motionOverrides,
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
    // Natural height inside a sized @container parent so rows can overflow and
    // scroll instead of flex-shrinking away. Preferred gap (cqh) is what phones use.
    <ol className="flex w-full flex-col gap-10">
        {items.map((item, i) => {
          const plan = planListRowMotion(motionId, i, {
            active: true,
            reduceMotion: Boolean(reduceMotion),
            overrides: motionOverrides,
          });
          // Always enter from the plan’s initial state so cascade plays on mount
          // (initial={false} was skipping enter when the list appeared already active).
          const rowTarget = active ? plan.row.animate : plan.row.inactive;

          return (
            <motion.li
              key={item.id}
              className="flex shrink-0 items-center gap-3.5"
              initial={plan.row.initial}
              animate={rowTarget}
              transition={{
                duration: active ? plan.row.duration : reduceMotion ? 0 : 0.25,
                delay: active ? plan.row.delay : 0,
                ease: plan.row.ease,
              }}
            >
              <motion.span
                className="w-5 shrink-0 font-sans text-lg font-bold tabular-nums text-[var(--wrapped-ink)]"
                initial={plan.index?.initial ?? false}
                animate={
                  plan.index
                    ? active
                      ? plan.index.animate
                      : plan.index.initial
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={
                  plan.index
                    ? {
                        duration: active ? plan.index.duration : 0,
                        delay: active ? plan.index.delay : 0,
                        ease: plan.row.ease,
                      }
                    : { duration: 0 }
                }
              >
                {i + 1}
              </motion.span>
              <motion.span
                className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-[var(--wrapped-panel)]"
                style={
                  !item.imageUrl && item.coverColor
                    ? { backgroundColor: item.coverColor }
                    : undefined
                }
                initial={plan.cover?.initial ?? false}
                animate={
                  plan.cover
                    ? active
                      ? plan.cover.animate
                      : plan.cover.initial
                    : { opacity: 1, scale: 1, y: 0 }
                }
                transition={
                  plan.cover
                    ? {
                        duration: active ? plan.cover.duration : 0,
                        delay: active ? plan.cover.delay : 0,
                        ease: plan.row.ease,
                      }
                    : { duration: 0 }
                }
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                    // List mounts inside an opacity animation; Safari skips lazy imgs.
                    loading="eager"
                  />
                ) : null}
              </motion.span>
              <motion.span
                className="min-w-0"
                initial={plan.text?.initial ?? false}
                animate={
                  plan.text
                    ? active
                      ? plan.text.animate
                      : plan.text.initial
                    : { opacity: 1, y: 0 }
                }
                transition={
                  plan.text
                    ? {
                        duration: active ? plan.text.duration : 0,
                        delay: active ? plan.text.delay : 0,
                        ease: plan.row.ease,
                      }
                    : { duration: 0 }
                }
              >
                <span className="block truncate font-sans text-base font-bold tracking-tight text-[var(--wrapped-ink)] sm:text-lg">
                  {item.label}
                </span>
                {item.sublabel ? (
                  <span className="block truncate text-sm text-[var(--wrapped-muted)]">
                    {item.sublabel}
                  </span>
                ) : null}
              </motion.span>
            </motion.li>
          );
        })}
    </ol>
  );
}
