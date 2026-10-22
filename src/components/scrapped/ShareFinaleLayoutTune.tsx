"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  SHARE_FINALE_DENSITY as D,
  SHARE_FINALE_KIT as SF,
} from "@/lib/scrapped-card-palette";
import { cn } from "@/lib/utils";

/**
 * Share finale footer slot layout (D-033).
 * Absolute % placement inside the 9:16 card for liked metrics + brand.
 */

export type ShareFinaleFooterSlot = {
  /** % from the card’s left edge. */
  leftPct: number;
  /** % from the card’s bottom edge. */
  bottomPct: number;
};

export type ShareFinaleFooterLayout = {
  likedSongs: ShareFinaleFooterSlot;
  likedYear: ShareFinaleFooterSlot;
  brand: ShareFinaleFooterSlot & {
    /** `end` = right edge of text at leftPct (BR default). */
    anchor: "start" | "end";
  };
};

/** Locked footer slots: liked metrics + myscrapped.com. */
export const SHARE_FINALE_FOOTER_DEFAULT: ShareFinaleFooterLayout = {
  likedSongs: { leftPct: 4.4, bottomPct: 15 },
  likedYear: { leftPct: 52, bottomPct: 14.8 },
  brand: { leftPct: 91, bottomPct: 4, anchor: "end" },
};

export type ShareFinaleMoonTune = {
  sizePx: number;
  insetXPx: number;
  insetYPx: number;
  opacity: number;
};

export type ShareFinaleGhostTune = {
  xPct: number;
  yPct: number;
  sizePx: number;
  rotDeg: number;
  opacity: number;
  z: "above" | "below";
};

export type ShareFinaleTuneState = {
  maxWidthPx: number;
  heroBandPct: number;
  heroSizePct: number;
  typeRem: number;
  listRowGapRem: number;
  listColGapPx: number;
  listPadXPx: number;
  listLabelGapRem: number;
  metricNumberRem: number;
  metricLabelRem: number;
  likedSongsLeftPct: number;
  likedSongsBottomPct: number;
  likedYearLeftPct: number;
  likedYearBottomPct: number;
  brandLeftPct: number;
  brandBottomPct: number;
  brandAnchor: "start" | "end";
  brandSizeRem: number;
  brandLetterSpacingEm: number;
  moon: ShareFinaleMoonTune;
  ghosts: [ShareFinaleGhostTune, ShareFinaleGhostTune, ShareFinaleGhostTune];
};

export function shareFinaleTuneDefaults(): ShareFinaleTuneState {
  const g = SF.ghosts;
  return {
    maxWidthPx: D.maxWidthPx,
    heroBandPct: D.heroBandPct,
    heroSizePct: D.heroSizePct,
    typeRem: D.typeRem,
    listRowGapRem: D.listRowGapRem,
    listColGapPx: D.listColGapPx,
    listPadXPx: D.listPadXPx,
    listLabelGapRem: 0.55,
    metricNumberRem: D.metricNumberRem,
    metricLabelRem: D.metricLabelRem,
    likedSongsLeftPct: SHARE_FINALE_FOOTER_DEFAULT.likedSongs.leftPct,
    likedSongsBottomPct: SHARE_FINALE_FOOTER_DEFAULT.likedSongs.bottomPct,
    likedYearLeftPct: SHARE_FINALE_FOOTER_DEFAULT.likedYear.leftPct,
    likedYearBottomPct: SHARE_FINALE_FOOTER_DEFAULT.likedYear.bottomPct,
    brandLeftPct: SHARE_FINALE_FOOTER_DEFAULT.brand.leftPct,
    brandBottomPct: SHARE_FINALE_FOOTER_DEFAULT.brand.bottomPct,
    brandAnchor: SHARE_FINALE_FOOTER_DEFAULT.brand.anchor,
    brandSizeRem: SF.brand.sizeRem,
    brandLetterSpacingEm: SF.brand.letterSpacingEm,
    moon: {
      sizePx: SF.moon.sizePx,
      insetXPx: SF.moon.insetXPx,
      insetYPx: SF.moon.insetYPx,
      opacity: SF.moon.opacity,
    },
    ghosts: [
      {
        xPct: g[0].xPct,
        yPct: g[0].yPct,
        sizePx: g[0].sizePx,
        rotDeg: g[0].rotDeg,
        opacity: g[0].opacity,
        z: g[0].z,
      },
      {
        xPct: g[1].xPct,
        yPct: g[1].yPct,
        sizePx: g[1].sizePx,
        rotDeg: g[1].rotDeg,
        opacity: g[1].opacity,
        z: g[1].z,
      },
      {
        xPct: g[2].xPct,
        yPct: g[2].yPct,
        sizePx: g[2].sizePx,
        rotDeg: g[2].rotDeg,
        opacity: g[2].opacity,
        z: g[2].z,
      },
    ],
  };
}

export function footerLayoutFromTune(
  tune: ShareFinaleTuneState,
): ShareFinaleFooterLayout {
  return {
    likedSongs: {
      leftPct: tune.likedSongsLeftPct,
      bottomPct: tune.likedSongsBottomPct,
    },
    likedYear: {
      leftPct: tune.likedYearLeftPct,
      bottomPct: tune.likedYearBottomPct,
    },
    brand: {
      leftPct: tune.brandLeftPct,
      bottomPct: tune.brandBottomPct,
      anchor: tune.brandAnchor,
    },
  };
}

/** CSS custom properties for scene 9 host + card density. */
export function shareFinaleCssVars(tune: ShareFinaleTuneState): CSSProperties {
  return {
    "--share-hero-band": `${tune.heroBandPct}%`,
    "--share-hero-size": `${tune.heroSizePct}%`,
    "--share-list-col-gap": `${tune.listColGapPx}px`,
    "--share-list-row-gap": `${tune.listRowGapRem}rem`,
    "--share-list-pad-x": `${tune.listPadXPx}px`,
    "--share-list-pad-y": `${D.listPadYPx}px`,
    "--share-list-label-gap": `${tune.listLabelGapRem}rem`,
    "--share-type-size": `${tune.typeRem}rem`,
    "--share-metric-number": `${tune.metricNumberRem}rem`,
    "--share-metric-label": `${tune.metricLabelRem}rem`,
    "--share-card-radius": `${D.radiusPx}px`,
    paddingTop: `calc(3.5rem + ${D.bodyTopPx}px)`,
    paddingBottom: `${D.bodyBottomPx}px`,
    paddingInline: `${D.gutterPx}px`,
  } as CSSProperties;
}

export function shareFinaleRecipe(tune: ShareFinaleTuneState) {
  return {
    kit: SF.id,
    density: {
      maxWidthPx: tune.maxWidthPx,
      heroBandPct: tune.heroBandPct,
      heroSizePct: tune.heroSizePct,
      typeRem: tune.typeRem,
      listRowGapRem: tune.listRowGapRem,
      listColGapPx: tune.listColGapPx,
      listPadXPx: tune.listPadXPx,
      listLabelGapRem: tune.listLabelGapRem,
      metricNumberRem: tune.metricNumberRem,
      metricLabelRem: tune.metricLabelRem,
    },
    footer: footerLayoutFromTune(tune),
    brand: {
      sizeRem: tune.brandSizeRem,
      letterSpacingEm: tune.brandLetterSpacingEm,
    },
    moon: { ...tune.moon, anchor: "tr" as const },
    ghosts: tune.ghosts.map((g) => ({ ...g })),
  };
}

type SliderDef = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  get: (t: ShareFinaleTuneState) => number;
  set: (t: ShareFinaleTuneState, v: number) => ShareFinaleTuneState;
};

type SliderGroup = { title: string; sliders: SliderDef[] };

function ghostSliders(index: 0 | 1 | 2): SliderDef[] {
  const label = `Ghost ${index + 1}`;
  return [
    {
      key: `g${index}-x`,
      label: `${label} X %`,
      min: -20,
      max: 100,
      step: 1,
      unit: "%",
      get: (t) => t.ghosts[index].xPct,
      set: (t, v) => {
        const ghosts = [...t.ghosts] as ShareFinaleTuneState["ghosts"];
        ghosts[index] = { ...ghosts[index], xPct: v };
        return { ...t, ghosts };
      },
    },
    {
      key: `g${index}-y`,
      label: `${label} Y %`,
      min: -20,
      max: 100,
      step: 1,
      unit: "%",
      get: (t) => t.ghosts[index].yPct,
      set: (t, v) => {
        const ghosts = [...t.ghosts] as ShareFinaleTuneState["ghosts"];
        ghosts[index] = { ...ghosts[index], yPct: v };
        return { ...t, ghosts };
      },
    },
    {
      key: `g${index}-size`,
      label: `${label} size`,
      min: 16,
      max: 96,
      step: 1,
      unit: "px",
      get: (t) => t.ghosts[index].sizePx,
      set: (t, v) => {
        const ghosts = [...t.ghosts] as ShareFinaleTuneState["ghosts"];
        ghosts[index] = { ...ghosts[index], sizePx: v };
        return { ...t, ghosts };
      },
    },
    {
      key: `g${index}-rot`,
      label: `${label} rot`,
      min: -40,
      max: 40,
      step: 1,
      unit: "°",
      get: (t) => t.ghosts[index].rotDeg,
      set: (t, v) => {
        const ghosts = [...t.ghosts] as ShareFinaleTuneState["ghosts"];
        ghosts[index] = { ...ghosts[index], rotDeg: v };
        return { ...t, ghosts };
      },
    },
  ];
}

const SLIDER_GROUPS: SliderGroup[] = [
  {
    title: "Island / hero",
    sliders: [
      {
        key: "maxWidth",
        label: "Max width",
        min: 240,
        max: 420,
        step: 4,
        unit: "px",
        get: (t) => t.maxWidthPx,
        set: (t, v) => ({ ...t, maxWidthPx: v }),
      },
      {
        key: "heroBand",
        label: "Hero band",
        min: 35,
        max: 62,
        step: 1,
        unit: "%",
        get: (t) => t.heroBandPct,
        set: (t, v) => ({ ...t, heroBandPct: v }),
      },
      {
        key: "heroSize",
        label: "Cover size",
        min: 40,
        max: 80,
        step: 1,
        unit: "%",
        get: (t) => t.heroSizePct,
        set: (t, v) => ({ ...t, heroSizePct: v }),
      },
    ],
  },
  {
    title: "Lists",
    sliders: [
      {
        key: "type",
        label: "Type size",
        min: 0.55,
        max: 1.1,
        step: 0.02,
        unit: "rem",
        get: (t) => t.typeRem,
        set: (t, v) => ({ ...t, typeRem: v }),
      },
      {
        key: "rowGap",
        label: "Row gap",
        min: 0.15,
        max: 0.9,
        step: 0.02,
        unit: "rem",
        get: (t) => t.listRowGapRem,
        set: (t, v) => ({ ...t, listRowGapRem: v }),
      },
      {
        key: "colGap",
        label: "Col gap",
        min: 6,
        max: 28,
        step: 1,
        unit: "px",
        get: (t) => t.listColGapPx,
        set: (t, v) => ({ ...t, listColGapPx: v }),
      },
      {
        key: "padX",
        label: "Pad X",
        min: 6,
        max: 28,
        step: 1,
        unit: "px",
        get: (t) => t.listPadXPx,
        set: (t, v) => ({ ...t, listPadXPx: v }),
      },
      {
        key: "labelGap",
        label: "Label gap",
        min: 0.2,
        max: 1,
        step: 0.05,
        unit: "rem",
        get: (t) => t.listLabelGapRem,
        set: (t, v) => ({ ...t, listLabelGapRem: v }),
      },
    ],
  },
  {
    title: "Metrics",
    sliders: [
      {
        key: "metricNum",
        label: "Number size",
        min: 0.9,
        max: 2.2,
        step: 0.05,
        unit: "rem",
        get: (t) => t.metricNumberRem,
        set: (t, v) => ({ ...t, metricNumberRem: v }),
      },
      {
        key: "metricLab",
        label: "Label size",
        min: 0.5,
        max: 1.1,
        step: 0.02,
        unit: "rem",
        get: (t) => t.metricLabelRem,
        set: (t, v) => ({ ...t, metricLabelRem: v }),
      },
      {
        key: "likedL",
        label: "Liked songs L",
        min: 0,
        max: 60,
        step: 0.2,
        unit: "%",
        get: (t) => t.likedSongsLeftPct,
        set: (t, v) => ({ ...t, likedSongsLeftPct: v }),
      },
      {
        key: "likedB",
        label: "Liked songs B",
        min: 2,
        max: 28,
        step: 0.2,
        unit: "%",
        get: (t) => t.likedSongsBottomPct,
        set: (t, v) => ({ ...t, likedSongsBottomPct: v }),
      },
      {
        key: "yearL",
        label: "Liked year L",
        min: 30,
        max: 80,
        step: 0.2,
        unit: "%",
        get: (t) => t.likedYearLeftPct,
        set: (t, v) => ({ ...t, likedYearLeftPct: v }),
      },
      {
        key: "yearB",
        label: "Liked year B",
        min: 2,
        max: 28,
        step: 0.2,
        unit: "%",
        get: (t) => t.likedYearBottomPct,
        set: (t, v) => ({ ...t, likedYearBottomPct: v }),
      },
    ],
  },
  {
    title: "Brand",
    sliders: [
      {
        key: "brandSize",
        label: "Size",
        min: 0.5,
        max: 1.2,
        step: 0.02,
        unit: "rem",
        get: (t) => t.brandSizeRem,
        set: (t, v) => ({ ...t, brandSizeRem: v }),
      },
      {
        key: "brandTrack",
        label: "Letter spacing",
        min: -0.06,
        max: 0.12,
        step: 0.005,
        unit: "em",
        get: (t) => t.brandLetterSpacingEm,
        set: (t, v) => ({ ...t, brandLetterSpacingEm: v }),
      },
      {
        key: "brandL",
        label: "Left",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        get: (t) => t.brandLeftPct,
        set: (t, v) => ({ ...t, brandLeftPct: v }),
      },
      {
        key: "brandB",
        label: "Bottom",
        min: 0,
        max: 16,
        step: 0.2,
        unit: "%",
        get: (t) => t.brandBottomPct,
        set: (t, v) => ({ ...t, brandBottomPct: v }),
      },
    ],
  },
  {
    title: "Moon",
    sliders: [
      {
        key: "moonSize",
        label: "Size",
        min: 80,
        max: 240,
        step: 2,
        unit: "px",
        get: (t) => t.moon.sizePx,
        set: (t, v) => ({ ...t, moon: { ...t.moon, sizePx: v } }),
      },
      {
        key: "moonX",
        label: "Inset X",
        min: -100,
        max: 40,
        step: 2,
        unit: "px",
        get: (t) => t.moon.insetXPx,
        set: (t, v) => ({ ...t, moon: { ...t.moon, insetXPx: v } }),
      },
      {
        key: "moonY",
        label: "Inset Y",
        min: -100,
        max: 40,
        step: 2,
        unit: "px",
        get: (t) => t.moon.insetYPx,
        set: (t, v) => ({ ...t, moon: { ...t.moon, insetYPx: v } }),
      },
      {
        key: "moonOp",
        label: "Opacity",
        min: 0.2,
        max: 1,
        step: 0.02,
        get: (t) => t.moon.opacity,
        set: (t, v) => ({ ...t, moon: { ...t.moon, opacity: v } }),
      },
    ],
  },
  {
    title: "Ghosts",
    sliders: [...ghostSliders(0), ...ghostSliders(1), ...ghostSliders(2)],
  },
];

function formatSliderValue(def: SliderDef, value: number): string {
  if (def.unit === "rem" || def.unit === "em") {
    return `${value.toFixed(def.step < 0.01 ? 3 : 2)}${def.unit}`;
  }
  if (def.unit === "%") return `${Math.round(value * 10) / 10}%`;
  if (def.unit === "px") return `${Math.round(value)}px`;
  if (def.unit === "°") return `${Math.round(value)}°`;
  if (def.step < 1) return value.toFixed(2);
  return String(Math.round(value));
}

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: SliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[0.65rem]">
        <span className="text-white/70">{def.label}</span>
        <span className="font-mono tabular-nums text-[#C9A0F5]">
          {formatSliderValue(def, value)}
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#C9A0F5]"
      />
    </label>
  );
}

type Props = {
  tune: ShareFinaleTuneState;
  onChange: (next: ShareFinaleTuneState) => void;
  onReset: () => void;
};

/**
 * On-story layout knobs for the share finale (scene 9).
 * Mount only when `?tune=share` and the finale is active.
 */
export function ShareFinaleLayoutTune({ tune, onChange, onReset }: Props) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const recipe = useMemo(() => shareFinaleRecipe(tune), [tune]);
  const recipeJson = useMemo(() => JSON.stringify(recipe, null, 2), [recipe]);

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(recipeJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked; recipe stays visible below.
    }
  };

  return (
    <div
      className="pointer-events-auto absolute top-14 right-2 z-[60] flex max-h-[min(78dvh,36rem)] w-[min(18.5rem,calc(100vw-1rem))] flex-col"
      data-share-finale-tune
    >
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-white/20 bg-[#1c1c1c]/92 px-2.5 py-1.5 font-mono text-[0.65rem] font-semibold tracking-wide text-[#f5f5f5] backdrop-blur-sm"
        >
          {open ? "Hide tune" : "Tune finale"}
        </button>
        {open ? (
          <>
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-white/15 bg-black/50 px-2 py-1.5 text-[0.65rem] font-medium text-white/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => void copyRecipe()}
              className="rounded-md border border-white/15 bg-black/50 px-2 py-1.5 text-[0.65rem] font-medium text-white/80"
            >
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </>
        ) : null}
      </div>

      {open ? (
        <div
          className={cn(
            "mt-2 min-h-0 flex-1 overflow-y-auto rounded-md border border-white/15 bg-[#1a1624]/95 p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
          )}
        >
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/45">
            Share finale · D-033 tune
          </p>

          <div className="mb-3 flex gap-1">
            <button
              type="button"
              aria-pressed={tune.brandAnchor === "end"}
              onClick={() => onChange({ ...tune, brandAnchor: "end" })}
              className={cn(
                "flex-1 rounded border px-1.5 py-1 text-[0.62rem] font-semibold",
                tune.brandAnchor === "end"
                  ? "border-[#C9A0F5] text-[#f5f5f5]"
                  : "border-white/10 text-white/55",
              )}
            >
              Brand end
            </button>
            <button
              type="button"
              aria-pressed={tune.brandAnchor === "start"}
              onClick={() => onChange({ ...tune, brandAnchor: "start" })}
              className={cn(
                "flex-1 rounded border px-1.5 py-1 text-[0.62rem] font-semibold",
                tune.brandAnchor === "start"
                  ? "border-[#C9A0F5] text-[#f5f5f5]"
                  : "border-white/10 text-white/55",
              )}
            >
              Brand start
            </button>
          </div>

          <div className="space-y-4">
            {SLIDER_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/50">
                  {group.title}
                </p>
                <div className="space-y-2.5">
                  {group.sliders.map((def) => (
                    <SliderRow
                      key={def.key}
                      def={def}
                      value={def.get(tune)}
                      onChange={(v) => onChange(def.set(tune, v))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <pre className="mt-3 overflow-x-auto rounded border border-white/10 bg-black/40 p-2 font-mono text-[0.58rem] leading-relaxed text-white/55">
            {recipeJson}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
