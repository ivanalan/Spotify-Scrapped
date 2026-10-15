"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type WrappedSlideTone =
  | "paper"
  | "mist"
  | "sand"
  | "blush"
  | "sage"
  | "sky"
  | "cream"
  | "slate";

export type WrappedStoryBeat = {
  /** Large conversational line (or year / name). */
  headline: ReactNode;
  /** Softer follow-up that lands after the headline. */
  subline?: ReactNode;
  /** Optional third beat (micro-stat, CTA nudge). */
  aside?: ReactNode;
  /** Optional media / placeholder above the copy. */
  lead?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Centered brand/open beats vs left-aligned story beats. */
  align?: "start" | "center";
  /** Emphasize headline as a display numeral / title. */
  display?: "sentence" | "hero" | "year";
};

type Props = {
  tone?: WrappedSlideTone;
  active?: boolean;
  /** Which beat is on stage when the scene has multiple sequential lines. */
  beatIndex?: number;
  /** Remount key so revisiting a scene replays enter motion. */
  replayKey?: number;
  /**
   * Extra delay before copy enters (seconds). Used on the open slide so the
   * soundtrack can catch up while the canvas sits empty.
   */
  copyEnterDelaySec?: number;
  /** Soft blur-in on copy (open slide). Ignored when reduced-motion. */
  copyBlurIn?: boolean;
  className?: string;
  /** Multi-beat scene (same canvas; text enters then exits). */
  beats?: WrappedStoryBeat[];
  /** Single-beat shorthand — same as one entry in `beats`. */
  headline?: ReactNode;
  subline?: ReactNode;
  aside?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  align?: "start" | "center";
  display?: "sentence" | "hero" | "year";
};

const enterEase = [0.22, 1, 0.36, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

function beatContainerVariants(delayChildren: number) {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.14,
        delayChildren,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1 as const,
      },
    },
  };
}

function lineVariants(
  reduceMotion: boolean | null,
  options: { blurIn: boolean },
) {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  return {
    hidden: {
      opacity: 0,
      y: 28,
      scale: 0.97,
      ...(options.blurIn ? { filter: "blur(12px)" } : null),
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      ...(options.blurIn ? { filter: "blur(0px)" } : null),
      transition: { duration: options.blurIn ? 0.7 : 0.55, ease: enterEase },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.99,
      ...(options.blurIn ? { filter: "blur(8px)" } : null),
      transition: { duration: 0.38, ease: exitEase },
    },
  };
}

function BeatBody({
  beat,
  reduceMotion,
  delayChildren,
  blurIn,
}: {
  beat: WrappedStoryBeat;
  reduceMotion: boolean | null;
  delayChildren: number;
  blurIn: boolean;
}) {
  const align = beat.align ?? "start";
  const display = beat.display ?? "sentence";
  const variants = lineVariants(reduceMotion, { blurIn });
  const container = beatContainerVariants(
    reduceMotion ? 0 : delayChildren,
  );

  return (
    <motion.div
      className={cn(
        "relative z-10 mx-auto flex w-full max-w-xl flex-col",
        align === "center" ? "items-center" : "items-stretch",
        beat.children || beat.lead ? "gap-8" : "gap-5",
      )}
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {beat.lead ? (
        <motion.div variants={variants} className="w-full">
          {beat.lead}
        </motion.div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4",
          align === "center" && "items-center",
        )}
      >
        <motion.div
          variants={variants}
          className={cn(
            "font-sans font-extrabold tracking-[-0.04em] text-[var(--wrapped-ink)]",
            display === "year" &&
              "text-[clamp(4.5rem,18vw,8rem)] leading-none",
            display === "hero" &&
              "max-w-[16ch] text-[clamp(2.5rem,9vw,4.25rem)] leading-[0.95]",
            display === "sentence" &&
              "max-w-[20ch] text-[clamp(1.85rem,6.5vw,3rem)] leading-[1.05]",
            align === "center" && display === "year" && "max-w-none",
            align === "center" && display === "hero" && "max-w-[22ch]",
          )}
        >
          {beat.headline}
        </motion.div>

        {beat.subline ? (
          <motion.div
            variants={variants}
            className={cn(
              "max-w-md text-[1.05rem] leading-relaxed text-[var(--wrapped-muted)] md:text-[1.15rem]",
              align === "center" && "mx-auto",
            )}
          >
            {beat.subline}
          </motion.div>
        ) : null}

        {beat.aside ? (
          <motion.div
            variants={variants}
            className={cn(
              "max-w-md text-[0.95rem] leading-relaxed text-[var(--wrapped-ink)]/75",
              align === "center" && "mx-auto",
            )}
          >
            {beat.aside}
          </motion.div>
        ) : null}
      </div>

      {beat.children ? (
        <motion.div variants={variants} className="min-h-0 w-full">
          {beat.children}
        </motion.div>
      ) : null}

      {beat.footer ? (
        <motion.div
          variants={variants}
          className="pt-2 text-sm text-[var(--wrapped-muted)]"
        >
          {beat.footer}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function WrappedStorySlide({
  tone = "paper",
  active = false,
  beatIndex = 0,
  replayKey = 0,
  copyEnterDelaySec = 0.04,
  copyBlurIn = false,
  className,
  beats,
  headline,
  subline,
  aside,
  lead,
  children,
  footer,
  align = "start",
  display = "sentence",
}: Props) {
  const reduceMotion = useReducedMotion();

  const resolvedBeats: WrappedStoryBeat[] =
    beats && beats.length > 0
      ? beats
      : [
          {
            headline: headline ?? null,
            subline,
            aside,
            lead,
            children,
            footer,
            align,
            display,
          },
        ];

  const safeIndex = Math.min(
    Math.max(beatIndex, 0),
    resolvedBeats.length - 1,
  );
  const current = resolvedBeats[safeIndex]!;
  const sceneAlign = current.align ?? align;
  // Only hold the first beat of a scene for soundtrack catch-up.
  const delayChildren =
    safeIndex === 0 ? copyEnterDelaySec : 0.04;

  return (
    <section
      data-scrapped-slide
      data-wrapped-tone={tone}
      className={cn(
        "relative flex h-dvh min-h-dvh w-full min-w-full shrink-0 snap-start snap-always flex-col px-7 py-24 md:px-14",
        "bg-[var(--wrapped-canvas)] text-[var(--wrapped-ink)]",
        sceneAlign === "center" ? "justify-center text-center" : "justify-center",
        className,
      )}
      aria-hidden={!active}
    >
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <BeatBody
            key={`${replayKey}-${safeIndex}`}
            beat={current}
            reduceMotion={reduceMotion}
            delayChildren={delayChildren}
            blurIn={copyBlurIn && safeIndex === 0}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
