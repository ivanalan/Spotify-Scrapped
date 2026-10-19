"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WrappedEntityList } from "@/components/scrapped/wrapped/WrappedEntityList";
import {
  CASCADE_DEFAULTS,
  type ListMotionOverrides,
} from "@/lib/scrapped-list-motion";
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

type Beat = 0 | 1 | 2 | 3;

type TuneState = {
  titleY: number;
  titleFadeSec: number;
  titleTravelSec: number;
  subY: number;
  subTravelSec: number;
  titleHoldMs: number;
  subHoldMs: number;
  rowY: number;
  startDelaySec: number;
  staggerSec: number;
  durationBaseSec: number;
  durationStepSec: number;
  holdMs: number;
};

const DEFAULTS: TuneState = {
  titleY: 6,
  titleFadeSec: 0.4,
  titleTravelSec: 0.38,
  subY: 5,
  subTravelSec: 0.36,
  titleHoldMs: 120,
  subHoldMs: 140,
  rowY: CASCADE_DEFAULTS.rowY,
  startDelaySec: CASCADE_DEFAULTS.startDelaySec,
  staggerSec: CASCADE_DEFAULTS.staggerSec,
  durationBaseSec: CASCADE_DEFAULTS.durationBaseSec,
  durationStepSec: CASCADE_DEFAULTS.durationStepSec,
  holdMs: 1400,
};

type SliderDef = {
  key: keyof TuneState;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

const SLIDER_GROUPS: { title: string; sliders: SliderDef[] }[] = [
  {
    title: "Title",
    sliders: [
      { key: "titleY", label: "Rise (px)", min: 0, max: 24, step: 1 },
      {
        key: "titleFadeSec",
        label: "Fade (s)",
        min: 0.1,
        max: 1,
        step: 0.02,
        unit: "s",
      },
      {
        key: "titleTravelSec",
        label: "Travel (s)",
        min: 0.1,
        max: 1,
        step: 0.02,
        unit: "s",
      },
      {
        key: "titleHoldMs",
        label: "Hold before sub (ms)",
        min: 0,
        max: 1200,
        step: 20,
        unit: "ms",
      },
    ],
  },
  {
    title: "Subtitle",
    sliders: [
      { key: "subY", label: "Rise (px)", min: 0, max: 20, step: 1 },
      {
        key: "subTravelSec",
        label: "Travel (s)",
        min: 0.1,
        max: 1,
        step: 0.02,
        unit: "s",
      },
      {
        key: "subHoldMs",
        label: "Hold before list (ms)",
        min: 0,
        max: 1200,
        step: 20,
        unit: "ms",
      },
    ],
  },
  {
    title: "Row cascade",
    sliders: [
      { key: "rowY", label: "Rise (px)", min: 0, max: 32, step: 1 },
      {
        key: "startDelaySec",
        label: "Start delay (s)",
        min: 0,
        max: 0.4,
        step: 0.01,
        unit: "s",
      },
      {
        key: "staggerSec",
        label: "Stagger / row (s)",
        min: 0.02,
        max: 0.4,
        step: 0.01,
        unit: "s",
      },
      {
        key: "durationBaseSec",
        label: "Duration base (s)",
        min: 0.2,
        max: 1.2,
        step: 0.02,
        unit: "s",
      },
      {
        key: "durationStepSec",
        label: "Duration +/row (s)",
        min: 0,
        max: 0.4,
        step: 0.01,
        unit: "s",
      },
      {
        key: "holdMs",
        label: "Hold before loop (ms)",
        min: 400,
        max: 4000,
        step: 100,
        unit: "ms",
      },
    ],
  },
];

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: SliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  const display =
    def.unit === "ms"
      ? `${Math.round(value)}`
      : def.unit === "s"
        ? value.toFixed(2)
        : String(Math.round(value * 100) / 100);

  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{def.label}</span>
        <span className="font-mono tabular-nums text-foreground">
          {display}
          {def.unit === "ms" ? "ms" : def.unit === "s" ? "s" : ""}
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
    </label>
  );
}

function cycleTimingMs(tune: TuneState) {
  const overrides: ListMotionOverrides = {
    rowY: tune.rowY,
    startDelaySec: tune.startDelaySec,
    staggerSec: tune.staggerSec,
    durationBaseSec: tune.durationBaseSec,
    durationStepSec: tune.durationStepSec,
  };
  // Approximate settle from the same formulas cascade uses.
  const last = MOCK_ROWS.length - 1;
  const listSettle =
    (tune.startDelaySec +
      last * tune.staggerSec +
      tune.durationBaseSec +
      last * tune.durationStepSec) *
    1000;

  const titleAt = 40;
  const subAt = titleAt + tune.titleTravelSec * 1000 + tune.titleHoldMs;
  const listAt = subAt + tune.subTravelSec * 1000 + tune.subHoldMs;
  const restartAt = listAt + listSettle + tune.holdMs + 400;

  return { titleAt, subAt, listAt, restartAt, overrides };
}

function Slide8Preview({
  tune,
  cycleKey,
}: {
  tune: TuneState;
  cycleKey: number;
}) {
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState<Beat>(0);
  const [listActive, setListActive] = useState(false);
  const { titleAt, subAt, listAt, overrides } = cycleTimingMs(tune);

  useEffect(() => {
    setBeat(0);
    setListActive(false);
    const timers = [
      window.setTimeout(() => setBeat(1), reduceMotion ? 40 : titleAt),
      window.setTimeout(() => setBeat(2), reduceMotion ? 200 : subAt),
      window.setTimeout(() => setBeat(3), reduceMotion ? 360 : listAt),
      window.setTimeout(
        () => setListActive(true),
        reduceMotion ? 400 : listAt + 40,
      ),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [cycleKey, titleAt, subAt, listAt, reduceMotion]);

  return (
    <div
      className="wrapped-story flex h-full flex-col justify-start px-7 py-10 text-left"
      data-wrapped-tone="sage"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {beat >= 1 ? (
          <motion.h2
            key={`title-${cycleKey}`}
            className="max-w-[20ch] font-sans text-[clamp(1.85rem,6.5vw,2.35rem)] font-extrabold leading-[1.15] tracking-[-0.04em] text-[var(--wrapped-ink)]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: tune.titleY }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : tune.titleTravelSec,
              opacity: {
                duration: reduceMotion ? 0 : tune.titleFadeSec,
                ease: "linear",
              },
              ease,
            }}
          >
            {HEADLINE}
          </motion.h2>
        ) : (
          <div className="h-[clamp(1.85rem,6.5vw,2.35rem)]" aria-hidden />
        )}

        {beat >= 2 ? (
          <motion.p
            key={`sub-${cycleKey}`}
            className="max-w-sm text-[0.95rem] leading-relaxed text-[var(--wrapped-muted)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: tune.subY }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : tune.subTravelSec,
              ease,
            }}
          >
            {SUBLINE}
          </motion.p>
        ) : null}

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-y-contain [container-type:size]">
          {beat >= 3 ? (
            <WrappedEntityList
              key={`list-${cycleKey}`}
              motion="cascade"
              motionOverrides={overrides}
              active={listActive}
              items={MOCK_ROWS}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ListSlideTuneLab() {
  const reduceMotion = useReducedMotion();
  const [tune, setTune] = useState<TuneState>(DEFAULTS);
  const [cycleKey, setCycleKey] = useState(0);

  const setField = (key: keyof TuneState, value: number) => {
    setTune((t) => ({ ...t, [key]: value }));
    setCycleKey((k) => k + 1);
  };

  useEffect(() => {
    const { restartAt } = cycleTimingMs(tune);
    const id = window.setTimeout(
      () => setCycleKey((k) => k + 1),
      reduceMotion ? 1600 : restartAt,
    );
    return () => window.clearTimeout(id);
  }, [cycleKey, tune, reduceMotion]);

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">
          Scrapped · Slide 08 tune lab
        </p>
        <h1 className="max-w-[18ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Reunion setlist
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Direct view of slide 08 (list beat). Sliders retune title, subtitle,
          and cascade — loops from blank. Live deck stays on shipped defaults
          until you promote values.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped/art/list"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Preset lab
          </Link>
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Scrapped
          </Link>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-8">
          {SLIDER_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-4">
                {group.sliders.map((def) => (
                  <SliderRow
                    key={def.key}
                    def={def}
                    value={tune[def.key]}
                    onChange={(v) => setField(def.key, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setTune(DEFAULTS);
                setCycleKey((k) => k + 1);
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={() => setCycleKey((k) => k + 1)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40"
            >
              Restart from top
            </button>
          </div>

          <pre
            className={cn(
              "overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground",
            )}
          >
            {JSON.stringify(
              {
                titleY: tune.titleY,
                titleFadeSec: tune.titleFadeSec,
                titleTravelSec: tune.titleTravelSec,
                titleHoldMs: tune.titleHoldMs,
                subY: tune.subY,
                subTravelSec: tune.subTravelSec,
                subHoldMs: tune.subHoldMs,
                ...{
                  rowY: tune.rowY,
                  startDelaySec: tune.startDelaySec,
                  staggerSec: tune.staggerSec,
                  durationBaseSec: tune.durationBaseSec,
                  durationStepSec: tune.durationStepSec,
                },
              },
              null,
              2,
            )}
          </pre>
        </aside>

        <div className="flex justify-center lg:justify-start">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)]">
            <Slide8Preview tune={tune} cycleKey={cycleKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
