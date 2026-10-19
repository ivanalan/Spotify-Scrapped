"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WrappedEntityList } from "@/components/scrapped/wrapped/WrappedEntityList";
import {
  LIST_MOTION_GROUPS,
  allListMotionStyles,
  listMotionSettleSec,
  type ListMotionId,
} from "@/lib/scrapped-list-motion";
import { STORY_MOTION } from "@/lib/scrapped-story-motion";
import { cn } from "@/lib/utils";

const MOCK_ROWS = [
  { id: "1", label: "Disco", sublabel: "Surf Curse", coverColor: "#5b4a8a" },
  {
    id: "2",
    label: "Mi Bello Angel",
    sublabel: "Natanael Cano",
    coverColor: "#3d6ea8",
  },
  {
    id: "3",
    label: "Hereditary",
    sublabel: "Isaiah Rashad",
    coverColor: "#6b5344",
  },
  {
    id: "4",
    label: "Star-Crossed",
    sublabel: "Grey Dugan",
    coverColor: "#c47a9a",
  },
  {
    id: "5",
    label: "Underworld",
    sublabel: "Alice Phoebe Lou",
    coverColor: "#a63d3d",
  },
];

const HEADLINE = "The reunion setlist";
const SUBLINE =
  "Old multi-year favorites — or old likes — back in your 4-week tops after a gap.";

const ease = [0.33, 1, 0.68, 1] as const;

/** Progressive beat: 0 blank → 1 title → 2 +sub → 3 +list. */
type Beat = 0 | 1 | 2 | 3;

function cycleTimingMs(motionId: ListMotionId, reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      titleAt: 40,
      subAt: 200,
      listAt: 360,
      restartAt: 1600,
    };
  }

  const titleHold = 120;
  const subHold = 140;
  const listSettle = listMotionSettleSec(motionId, MOCK_ROWS.length) * 1000;
  const hold = 1400;
  const gap = 480;

  const titleAt = 40;
  const subAt = titleAt + STORY_MOTION.titleTravelSec * 1000 + titleHold;
  const listAt = subAt + STORY_MOTION.followTravelSec * 1000 + subHold;
  const restartAt = listAt + listSettle + hold + gap;

  return { titleAt, subAt, listAt, restartAt };
}

function ReunionListMock({
  motionId,
  cycleKey,
}: {
  motionId: ListMotionId;
  cycleKey: number;
}) {
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState<Beat>(0);
  const [listActive, setListActive] = useState(false);

  useEffect(() => {
    setBeat(0);
    setListActive(false);
    const t = cycleTimingMs(motionId, Boolean(reduceMotion));
    const timers = [
      window.setTimeout(() => setBeat(1), t.titleAt),
      window.setTimeout(() => setBeat(2), t.subAt),
      window.setTimeout(() => setBeat(3), t.listAt),
      // Mount dimmed, then arm enter so row stagger actually plays.
      window.setTimeout(() => setListActive(true), t.listAt + 40),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [cycleKey, motionId, reduceMotion]);

  const titleEnter = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: STORY_MOTION.titleY, scale: STORY_MOTION.titleScaleFrom };
  const followEnter = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: STORY_MOTION.followY };
  const supportEnter = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: STORY_MOTION.supportY };

  return (
    <div
      className="wrapped-story flex h-full flex-col justify-start px-5 py-7 text-left"
      data-wrapped-tone="sage"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {beat >= 1 ? (
          <motion.h2
            key={`title-${cycleKey}`}
            className="max-w-[20ch] font-sans text-[clamp(1.85rem,6.5vw,2.35rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--wrapped-ink)]"
            initial={titleEnter}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduceMotion ? 0 : STORY_MOTION.titleTravelSec,
              ease,
            }}
          >
            {HEADLINE}
          </motion.h2>
        ) : (
          <div
            className="h-[clamp(1.85rem,6.5vw,2.35rem)]"
            aria-hidden
          />
        )}

        {beat >= 2 ? (
          <motion.p
            key={`sub-${cycleKey}`}
            className="max-w-sm text-[0.95rem] leading-relaxed text-[var(--wrapped-muted)]"
            initial={followEnter}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : STORY_MOTION.followTravelSec,
              ease,
            }}
          >
            {SUBLINE}
          </motion.p>
        ) : null}

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-y-contain [container-type:size]">
          {beat >= 3 ? (
            <motion.div
              key={`list-wrap-${cycleKey}`}
              initial={supportEnter}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : STORY_MOTION.followTravelSec,
                ease,
              }}
            >
              <WrappedEntityList
                key={`list-${motionId}-${cycleKey}`}
                motion={motionId}
                active={listActive}
                items={MOCK_ROWS}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ListMotionLab() {
  const reduceMotion = useReducedMotion();
  const [motionId, setMotionId] = useState<ListMotionId>("cascade");
  const [cycleKey, setCycleKey] = useState(0);
  const meta = allListMotionStyles().find((s) => s.id === motionId)!;

  const restart = () => setCycleKey((k) => k + 1);

  useEffect(() => {
    const { restartAt } = cycleTimingMs(motionId, Boolean(reduceMotion));
    const id = window.setTimeout(() => {
      setCycleKey((k) => k + 1);
    }, restartAt);
    return () => window.clearTimeout(id);
  }, [cycleKey, motionId, reduceMotion]);

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">Scrapped · List motion lab</p>
        <h1 className="max-w-[18ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Five-song enter
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Full beat loop: title → subline → rows, then hard-restart from blank.
          Live deck uses Cascade on every numbered entity list.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped/art"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Chrome lab
          </Link>
          <Link
            href="/scrapped/art/list/tune"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Slide 08 sliders →
          </Link>
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Scrapped
          </Link>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-8">
          {LIST_MOTION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {group.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{group.note}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {group.styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setMotionId(s.id);
                      setCycleKey((k) => k + 1);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      motionId === s.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-transparent text-foreground hover:border-foreground/40",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={restart}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40"
          >
            Restart from top
          </button>

          <dl className="space-y-3 border-t border-border pt-4 text-sm">
            <div>
              <dt className="font-mono text-xs text-muted-foreground">
                Technique
              </dt>
              <dd className="mt-1 text-foreground">{meta.technique}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted-foreground">When</dt>
              <dd className="mt-1 text-muted-foreground">{meta.when}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted-foreground">Id</dt>
              <dd className="mt-1 font-mono text-foreground">{meta.id}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted-foreground">Loop</dt>
              <dd className="mt-1 text-muted-foreground">
                Title → sub → list → blank restart
              </dd>
            </div>
          </dl>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Respects{" "}
            <span className="font-mono">prefers-reduced-motion</span>. Default
            is{" "}
            <span className="font-mono">cascade</span> via{" "}
            <span className="font-mono">DEFAULT_LIST_MOTION</span>.
          </p>
        </aside>

        <div className="flex justify-center lg:justify-start">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)]">
            <ReunionListMock motionId={motionId} cycleKey={cycleKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
