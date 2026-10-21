"use client";

import { useState } from "react";
import Link from "next/link";
import { StoryChromeStage } from "@/components/scrapped/art/StoryChromeStage";
import { OrbitCascadeArt } from "@/components/scrapped/art/storyboard/OrbitCascadeArt";
import { SlideMock } from "@/components/scrapped/art/storyboard/SlideMocks";
import {
  OCEAN_FISH_CAP,
  OCEAN_FISH_SIZE_DEFAULT,
} from "@/components/scrapped/art/storyboard/ShapeKit";
import { ORBIT_CASCADE, SLIDE_SPECS } from "@/components/scrapped/art/storyboard/orbitCascade";
import { cn } from "@/lib/utils";

type TuneState = {
  fishCount: number;
  fishSizeScale: number;
};

const DEFAULTS: TuneState = {
  fishCount: OCEAN_FISH_CAP,
  fishSizeScale: OCEAN_FISH_SIZE_DEFAULT,
};

type SliderDef = {
  key: keyof TuneState;
  label: string;
  min: number;
  max: number;
  step: number;
};

const SLIDERS: SliderDef[] = [
  {
    key: "fishCount",
    label: "Fish count (cap)",
    min: 0,
    max: OCEAN_FISH_CAP,
    step: 1,
  },
  {
    key: "fishSizeScale",
    label: "Size scale",
    min: 0.5,
    max: 2.5,
    step: 0.05,
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
    def.key === "fishSizeScale"
      ? value.toFixed(2)
      : String(Math.round(value));

  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{def.label}</span>
        <span className="font-mono tabular-nums text-foreground">
          {display}
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

/**
 * Research lab for liked-volume ocean fish (slide 01).
 * Live deck keeps shipped defaults until values are promoted.
 */
export function VolumeFishTuneLab() {
  const [tune, setTune] = useState<TuneState>(DEFAULTS);
  const [replayKey, setReplayKey] = useState(0);
  const spec = SLIDE_SPECS[1];
  const ink =
    spec.ink === "dark" ? ORBIT_CASCADE.inkDark : ORBIT_CASCADE.inkLight;
  const muted =
    spec.ink === "dark"
      ? "rgba(245,245,245,0.9)"
      : "rgba(28,28,28,0.88)";

  const setField = (key: keyof TuneState, value: number) => {
    setTune((t) => ({ ...t, [key]: value }));
    setReplayKey((k) => k + 1);
  };

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">
          Scrapped · Slide 01 volume fish tune
        </p>
        <h1 className="max-w-[18ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Liked volume ocean
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Cap is {OCEAN_FISH_CAP} (1 like = 1 fish). High tide locked so the
          school stays visible. Live deck uses shipped size defaults until you
          promote a scale.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped/art/storyboard"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Storyboard
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
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              School
            </p>
            <div className="space-y-4">
              {SLIDERS.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={tune[def.key]}
                  onChange={(v) => setField(def.key, v)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setTune(DEFAULTS);
                setReplayKey((k) => k + 1);
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40"
            >
              Replay tide
            </button>
          </div>

          <pre
            className={cn(
              "overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground",
            )}
          >
            {JSON.stringify(
              {
                OCEAN_FISH_CAP,
                fishCount: tune.fishCount,
                fishSizeScale: Number(tune.fishSizeScale.toFixed(2)),
              },
              null,
              2,
            )}
          </pre>
        </aside>

        <div className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[360px]">
            <StoryChromeStage
              key={replayKey}
              chrome={
                <OrbitCascadeArt
                  slideIndex={1}
                  pattern="volume"
                  tide="high"
                  fishCount={tune.fishCount}
                  fishSizeScale={tune.fishSizeScale}
                />
              }
            >
              <SlideMock
                pattern="volume"
                slideIndex={1}
                ink={ink}
                muted={muted}
              />
            </StoryChromeStage>
          </div>
        </div>
      </div>
    </div>
  );
}
