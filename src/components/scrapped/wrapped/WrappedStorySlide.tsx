"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buildStoryLinePhases,
  countCopyLineBeats,
  estimateReadingMs,
  plainText,
  STORY_MOTION,
} from "@/lib/scrapped-story-motion";
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
  /**
   * Line-phase index for the scene (title → subtitle → aside are separate
   * beats; progressive within one narrative block).
   */
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

const enterEase = [0.33, 1, 0.68, 1] as const;
const exitEase = [0.4, 0, 0.6, 1] as const;
const timing = STORY_MOTION;

function softEnter(
  reduceMotion: boolean | null,
  options: {
    y: number;
    scale?: number;
    blurIn?: boolean;
    delay?: number;
    fadeSec: number;
    travelSec: number;
  },
) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }

  const scale = options.scale ?? 1;
  const delay = options.delay ?? 0;
  const blurIn = options.blurIn ?? false;

  return {
    initial: {
      opacity: 0,
      y: options.y,
      ...(scale !== 1 ? { scale } : null),
      ...(blurIn ? { filter: "blur(8px)" } : null),
    },
    animate: {
      opacity: 1,
      y: 0,
      ...(scale !== 1 ? { scale: 1 } : null),
      ...(blurIn ? { filter: "blur(0px)" } : null),
      transition: {
        delay,
        opacity: { duration: options.fadeSec, ease: "linear" },
        y: { duration: options.travelSec, ease: enterEase },
        ...(scale !== 1
          ? { scale: { duration: options.travelSec, ease: enterEase } }
          : null),
        ...(blurIn
          ? { filter: { duration: options.travelSec * 0.95, ease: enterEase } }
          : null),
      },
    },
  };
}

function beatExit(reduceMotion: boolean | null) {
  if (reduceMotion) {
    return { opacity: 0, transition: { duration: 0 } };
  }
  // Same move-up + fade as every other story beat.
  return {
    opacity: 0,
    y: timing.exitY,
    transition: {
      opacity: { duration: timing.exitFadeSec, ease: exitEase },
      y: { duration: timing.exitTravelSec, ease: exitEase },
    },
  };
}

function BeatBody({
  beat,
  reduceMotion,
  delayChildren,
  blurIn,
  linesVisible,
  /** Only the numbered-list beat pins to the top; setup uses the normal center. */
  pinTop = false,
}: {
  beat: WrappedStoryBeat;
  reduceMotion: boolean | null;
  delayChildren: number;
  blurIn: boolean;
  linesVisible: number;
  pinTop?: boolean;
}) {
  const align = beat.align ?? "start";
  const display = beat.display ?? "sentence";
  const isListBeat = Boolean(beat.children);
  // Layout springs title upward when subtitle/rows mount — same as other slides.
  const useLayout = !reduceMotion;
  const copyLineCount = countCopyLineBeats(beat);

  // Remount (parent key) resets this. Only delay if the beat clock jumped past
  // the title-only frame — normal 1→2 advances follow the deck clock.
  const [titleHoldDone, setTitleHoldDone] = useState(false);
  const sawTitleOnlyRef = useRef(false);
  useEffect(() => {
    if (linesVisible <= 1) {
      sawTitleOnlyRef.current = true;
      return;
    }
    if (titleHoldDone) return;

    // Already showed title-only — release subtitle with the clock (no re-hold).
    if (sawTitleOnlyRef.current) {
      setTitleHoldDone(true);
      return;
    }

    // Clock jumped past title-only on this mount — hold then catch up.
    const holdMs =
      estimateReadingMs(plainText(beat.headline)) +
      timing.titleTravelSec * 1000;
    const id = window.setTimeout(() => {
      setTitleHoldDone(true);
    }, holdMs);
    return () => window.clearTimeout(id);
  }, [linesVisible, beat.headline, titleHoldDone]);

  const shownLines =
    linesVisible <= 1 || !titleHoldDone ? 1 : linesVisible;

  const showSubline = Boolean(beat.subline) && shownLines >= 2;
  const showAside = Boolean(beat.aside) && shownLines >= 3;
  // List/footer is its own phase after copy — not simultaneous with the subline.
  const showSupport =
    Boolean(beat.children || beat.footer) && shownLines > copyLineCount;

  const layoutSpring = {
    type: "spring" as const,
    stiffness: timing.layoutStiffness,
    damping: timing.layoutDamping,
    mass: timing.layoutMass,
  };

  // Enter transitions live on `animate` (softEnter). Layout spring is scoped to
  // `layout` only so it doesn’t steal the subtitle’s fade/rise.
  const layoutOnlyTransition = useLayout
    ? { layout: layoutSpring }
    : undefined;

  const titleMotion = softEnter(reduceMotion, {
    y: timing.titleY,
    scale: timing.titleScaleFrom,
    blurIn,
    delay: delayChildren,
    fadeSec: timing.titleFadeSec,
    travelSec: timing.titleTravelSec,
  });
  const leadMotion = softEnter(reduceMotion, {
    y: timing.supportY,
    blurIn,
    delay: Math.max(0, delayChildren - 0.06),
    fadeSec: timing.followFadeSec,
    travelSec: timing.followTravelSec,
  });
  const followMotion = softEnter(reduceMotion, {
    y: timing.followY,
    fadeSec: timing.followFadeSec,
    travelSec: timing.followTravelSec,
  });
  const supportMotion = softEnter(reduceMotion, {
    y: timing.supportY,
    fadeSec: timing.followFadeSec,
    travelSec: timing.followTravelSec,
  });

  return (
    <motion.div
      className={cn(
        "z-10 mx-auto flex w-full max-w-xl flex-col",
        // List beat only: top-pin without changing section justify (setup stays centered).
        pinTop
          ? "absolute inset-x-0 top-24 px-7 md:px-14"
          : "relative",
        align === "center" ? "items-center" : "items-stretch",
        // List: 12px title→subtitle; rows add mt-3 for 24px subtitle→list.
        isListBeat ? "gap-3" : beat.lead ? "gap-8" : "gap-4",
      )}
      layout={useLayout ? "position" : false}
      transition={layoutOnlyTransition}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={beatExit(reduceMotion)}
    >
      {beat.lead ? (
        <motion.div
          className="w-full"
          initial={leadMotion.initial}
          animate={leadMotion.animate}
        >
          {beat.lead}
        </motion.div>
      ) : null}

      <motion.div
        layout={useLayout ? "position" : false}
        transition={layoutOnlyTransition}
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
        initial={titleMotion.initial}
        animate={titleMotion.animate}
      >
        {beat.headline}
      </motion.div>

      <AnimatePresence initial={false}>
        {showSubline ? (
          <motion.div
            key="subline"
            layout={useLayout ? "position" : false}
            transition={layoutOnlyTransition}
            className={cn(
              "max-w-md text-[1.05rem] leading-relaxed text-[var(--wrapped-muted)] md:text-[1.15rem]",
              align === "center" && "mx-auto w-full",
            )}
            initial={followMotion.initial}
            animate={followMotion.animate}
          >
            {beat.subline}
          </motion.div>
        ) : null}

        {showAside ? (
          <motion.div
            key="aside"
            layout={useLayout ? "position" : false}
            transition={layoutOnlyTransition}
            className={cn(
              "max-w-md text-[0.95rem] leading-relaxed text-[var(--wrapped-ink)]/75",
              align === "center" && "mx-auto w-full",
            )}
            initial={followMotion.initial}
            animate={followMotion.animate}
          >
            {beat.aside}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {beat.children && showSupport ? (
          <motion.div
            key="children"
            layout={useLayout ? "position" : false}
            transition={layoutOnlyTransition}
            className={cn("min-h-0 w-full", isListBeat && "mt-6")}
            // Rows own cascade; wrapper only participates in layout reflow.
            initial={isListBeat ? false : supportMotion.initial}
            animate={isListBeat ? { opacity: 1 } : supportMotion.animate}
          >
            {beat.children}
          </motion.div>
        ) : null}

        {beat.footer && showSupport ? (
          <motion.div
            key="footer"
            layout={useLayout ? "position" : false}
            transition={layoutOnlyTransition}
            className="pt-2 text-sm text-[var(--wrapped-muted)]"
            initial={supportMotion.initial}
            animate={supportMotion.animate}
          >
            {beat.footer}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function WrappedStorySlide({
  tone = "paper",
  active = false,
  beatIndex = 0,
  replayKey = 0,
  copyEnterDelaySec,
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

  const resolvedBeats: WrappedStoryBeat[] = useMemo(
    () =>
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
          ],
    [
      beats,
      headline,
      subline,
      aside,
      lead,
      children,
      footer,
      align,
      display,
    ],
  );

  const phases = useMemo(
    () =>
      buildStoryLinePhases(
        resolvedBeats.map((b) => ({
          headline: b.headline,
          subline: b.subline,
          aside: b.aside,
          hasSupport: Boolean(b.children || b.footer),
        })),
      ),
    [resolvedBeats],
  );
  const phase =
    phases[Math.min(Math.max(beatIndex, 0), phases.length - 1)] ??
    phases[0]!;
  const current = resolvedBeats[phase.narrativeIndex]!;
  const sceneAlign = current.align ?? align;
  const isListBeat = Boolean(current.children);
  const enterDelay = copyEnterDelaySec ?? timing.copyEnterDelaySec;
  // Stable for a narrative block’s lifetime (key’d on narrativeIndex) so
  // advancing title → subtitle doesn’t restart the title enter.
  const delayChildren =
    phase.narrativeIndex === 0 ? enterDelay : timing.copyEnterDelaySec;

  return (
    <section
      data-scrapped-slide
      data-wrapped-tone={tone}
      className={cn(
        "relative flex h-dvh min-h-dvh w-full min-w-full shrink-0 snap-start snap-always flex-col px-7 py-24 md:px-14",
        "bg-[var(--wrapped-canvas)] text-[var(--wrapped-ink)]",
        // Same centering as every other slide — list beat self-pins via pinTop.
        sceneAlign === "center" ? "justify-center text-center" : "justify-center",
        className,
      )}
      aria-hidden={!active}
    >
      {/* initial plays: BeatBody only mounts while active, so each scene gets enter. */}
      <AnimatePresence mode="wait">
        {active ? (
          <BeatBody
            key={`${replayKey}-${phase.narrativeIndex}`}
            beat={current}
            reduceMotion={reduceMotion}
            delayChildren={delayChildren}
            blurIn={Boolean(copyBlurIn && beatIndex <= 0)}
            linesVisible={phase.linesVisible}
            pinTop={isListBeat}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
