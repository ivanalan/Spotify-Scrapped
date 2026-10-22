/**
 * Orbit Cascade card palette: production source of truth for `/scrapped`.
 * Research storyboard re-exports from here. See D-007.
 */

export const CARD_PALETTE = {
  ink: { bg: "#12101A", ink: "dark" as const, label: "ink" },
  orchid: { bg: "#9B4DE8", ink: "dark" as const, label: "orchid" },
  /** Liked-volume: flame soft orange, light theme (black ink). */
  ember: { bg: "#FF7A3A", ink: "light" as const, label: "ember" },
  mango: { bg: "#FF9F1C", ink: "light" as const, label: "mango" },
  gold: { bg: "#E8B84B", ink: "light" as const, label: "gold" },
  teal: { bg: "#1A7A6E", ink: "dark" as const, label: "teal" },
  rose: { bg: "#C9185B", ink: "dark" as const, label: "rose" },
} as const;

/** Ember sky: keep in sync with `data-wrapped-tone="ember"` in globals.css. */
export const EMBER_FIELD_GRADIENT =
  "linear-gradient(165deg, #FFC878 0%, #FF7A3A 45%, #E85018 100%)";

/**
 * Teal nest: ice → canvas → deep (165deg).
 * Share finale card + scene 4 one-like field (C0). Soft-close stays flat teal.
 * Keep in sync with `data-scrapped-field="one-like-nest"` in globals.css.
 */
export const TEAL_NEST_GRADIENT =
  "linear-gradient(165deg, #5EEAD4 0%, #1A7A6E 50%, #0F4C5C 100%)";

export type CardSwatch = keyof typeof CARD_PALETTE;
/**
 * Ink mode on a swatch = story theme:
 * - `dark` → dark theme (light foreground `#f5f5f5`)
 * - `light` → light theme (dark foreground `#1c1c1c`)
 * Deck chrome (wordmark, progress, controls) must follow the active slide.
 */
export type InkMode = "dark" | "light";
export type StoryChromeTheme = "dark" | "light";

/** Slide index → palette swatch (10-beat API deck). */
export const SLIDE_SWATCH: CardSwatch[] = [
  "ink", // 0 intro
  "ember", // 1 volume (ocean)
  "ink", // 2 most ghosted song; night rhyme w/ list (D-017)
  "ink", // 3 ghosted songs list; sky/grass/ghosts (D-010)
  "teal", // 4 list
  "ink", // 5 left-on-read entity; chat bloom (D-016)
  "ink", // 6 left-on-read list; chat frame (D-016)
  "mango", // 7 plot twist / reunion; film letterbox (D-016)
  "teal", // 8 soft close; mono teal iris (D-016)
  "ink", // 9 share; ink stage + teal nest / orchid wash (D-012 / D-021)
];

/**
 * Share finale inset density: locked from exploration (D-012).
 * Visual kit: D-021 (teal nest · orchid corners · lilac-rim moon).
 * Card is always 9:16 (Wrapped share ritual): on screen and in the export PNG.
 */
export const SHARE_FINALE_DENSITY = {
  gutterPx: 36,
  radiusPx: 4,
  cardActionsGapPx: 32,
  bodyTopPx: 28,
  bodyBottomPx: 16,
  /** Portrait share island: Stories / Reels friendly (Wrapped 25-share-finale). */
  aspectRatio: "9 / 16",
  /** Target PNG width; height follows on-screen 9:16 via capture scale. */
  exportWidthPx: 1080,
  exportHeightPx: 1920,
  /** Hero band + art sized so the square never overflows into MyScrapped.com. */
  heroBandPct: 46,
  heroSizePct: 48,
  listColGapPx: 18,
  listRowGapRem: 0.85,
  listPadXPx: 19,
  listPadYPx: 16,
  typeRem: 0.62,
  actionsGapPx: 12,
} as const;

/**
 * Share finale visual kit: D-021 · C6 teal + B1 orchid corners + M4 lilac-rim moon.
 * Stage: ink + intro disks/star. Card: teal nest + orchid corner wash +
 * white→lilac moon + framing ghosts. Disks/star reuse INTRO_* tokens.
 */
export const SHARE_FINALE_KIT = {
  id: "c-teal-m-lilac-rim",
  /** Stage field swatch: drives slide chrome (dark theme). */
  stageSwatch: "ink" as const,
  cardBg: TEAL_NEST_GRADIENT,
  /** Light type on teal card. */
  cardInk: "#f5f5f5",
  cardMuted: "color-mix(in oklab, #f5f5f5 90%, transparent)",
  cardPanel: "color-mix(in oklab, #f5f5f5 14%, transparent)",
  /**
   * B1 orchid corners wash over the teal nest (D-019 recipe · D-021).
   * Stays inside the card island: no edge bleed (D-013).
   */
  orchidWash: {
    opacity: 0.75,
    /** spread = 1 → default radial sizes */
    background: [
      "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, #6B21A8 55%, transparent) 0%, transparent 58%)",
      "radial-gradient(100% 70% at 100% 100%, color-mix(in oklab, #3B0764 45%, transparent) 0%, transparent 55%)",
    ].join(", "),
  },
  ghostFill: "#f5f0ff",
  ghostEye: "#2a2433",
  brandLine: "MyScrapped.com",
  /**
   * BL moon sphere: center on the card’s bottom-left corner (quarter peeks in).
   * sizePx = diameter. White → lilac → orchid rim (M4). Sphere only.
   */
  moon: {
    /** Center pinned to this card corner. */
    anchor: "bl" as const,
    sizePx: 260,
    /** Radial stops: highlight → mid → rim (always a gradient). */
    stops: [
      { offset: "0%", color: "#FFFFFF" },
      { offset: "28%", color: "#F4EBFF" },
      { offset: "62%", color: "#C9A0F5" },
      { offset: "100%", color: "#6B21A8" },
    ],
    opacity: 0.88,
  },
  ghosts: {
    tl: { xPct: 6, yPct: 6, sizePx: 46 },
    br: { xPct: 76, yPct: 36, sizePx: 56 },
    bobPx: 10,
    /** Multiplier on rotate amp (1 = default). */
    wiggle: 1,
    durationSec: 4.3,
    opacity: 0.85,
    /** Delay between TL and BR float cycles. */
    phaseSec: 1.2,
  },
} as const;

/** Deep field → light text; bright field → dark text. */
export const INK_HEX = {
  dark: "#f5f5f5",
  light: "#1c1c1c",
} as const;

/** Near-ink secondary copy: soft hierarchy, not washed grey (D-007). */
export const INK_MUTED = {
  dark: "color-mix(in oklab, #f5f5f5 90%, transparent)",
  light: "color-mix(in oklab, #1c1c1c 88%, transparent)",
} as const;

/** Locked intro concentric ladder (orchid family on ink). */
export const INTRO_DISK_COLORS = [
  "#C9A0F5",
  "#B87AED",
  "#A862E8",
  "#9B4DE8",
  "#8A3CD6",
  "#6B21A8",
] as const;

/**
 * One shared orchid sweep for the intro ladder: every disk paints
 * `url(#…)` from this stop list. Wide range: near-white lilac → hot
 * magenta → near-ink purple.
 */
export const INTRO_SHARED_GRADIENT = {
  stops: [
    { offset: "0%", color: "#FBEAFF" },
    { offset: "28%", color: "#E070FF" },
    { offset: "58%", color: "#C9185B" },
    { offset: "100%", color: "#3B0764" },
  ],
} as const;

/** Intro BR star: warm mango→ember accent on the ink field. */
export const INTRO_STAR = {
  from: "#FFB04A",
  to: "#E85D2C",
} as const;

/**
 * Intro / gate field: A3 orchid corners (B1 recipe baked into the field).
 * Gate + slide 0 only; other ink slides stay flat or use their own washes.
 * Keep in sync with `data-scrapped-field="intro-dusk"` in globals.css.
 */
export const INTRO_FIELD_GRADIENT =
  "radial-gradient(125% 85% at 0% 0%, color-mix(in oklab, #6B21A8 22%, transparent) 0%, transparent 68%), radial-gradient(105% 75% at 100% 100%, color-mix(in oklab, #3B0764 16%, transparent) 0%, transparent 65%), #12101A";

/**
 * #1 artist orbit: prototype kit F (D-008), ink-lean contrast retune.
 * Center-aligned eccentric ovals; opaque linear gradients; independent spin.
 * Canvas is ink (`CARD_PALETTE.ink`); deep orchid cascade (no near-white / hot magenta).
 */
export const ARTIST_ORBIT = {
  cx: 180,
  cy: 275,
  wash: "#0A0810",
  /** Wash rect top in viewBox Y; gradient mid stop % + opacity. */
  washY: 360,
  washMid: 35,
  washMidOpacity: 0.88,
  /** Inner → outer. Painted outer-first so inner sits on top. */
  rings: [
    { rx: 68, ry: 68, from: "#9B4DE8", to: "#7A3CC8", dur: 26, reverse: false },
    { rx: 105, ry: 92, from: "#7A3CC8", to: "#6B21A8", dur: 38, reverse: true },
    { rx: 145, ry: 108, from: "#6B21A8", to: "#4C1D95", dur: 50, reverse: false },
    { rx: 185, ry: 128, from: "#4C1D95", to: "#3B0764", dur: 47, reverse: true },
    { rx: 225, ry: 150, from: "#3B0764", to: "#1A0A2E", dur: 59, reverse: false },
  ],
} as const;

/**
 * Ghosted songs list clouds (D-010): tweak here.
 * Scales are × classic list cloud sizes (lane A 1.15 / lane B 0.78).
 * `yOffset` is viewBox px down from the sky baseline (positive = lower).
 */
export const GHOSTED_LIST_CLOUDS = {
  /** 1 = original list cloud size; 0.75 = three-quarters. */
  scale: 0.75,
  /** Positive nudges the strip down toward the headline. */
  yOffset: 10,
} as const;

export type SlideArtPattern =
  | "intro"
  | "volume"
  | "entity-song"
  | "list"
  | "entity-artist"
  | "reunion"
  | "close"
  | "share";

export const SLIDE_ART_PATTERN: SlideArtPattern[] = [
  "intro",
  "volume",
  "entity-song",
  "list",
  "list",
  "entity-artist",
  "list",
  "reunion",
  "close",
  "share",
];

export function slideSwatch(index: number): CardSwatch {
  return SLIDE_SWATCH[index] ?? "ink";
}

export function slideTone(index: number): CardSwatch {
  return slideSwatch(index);
}

export function cardForSlide(index: number) {
  return CARD_PALETTE[slideSwatch(index)];
}

/** Active-slide chrome theme: brand, progress, and controls must match. */
export function slideChromeTheme(index: number): StoryChromeTheme {
  return cardForSlide(index).ink === "dark" ? "dark" : "light";
}

export function inkHex(mode: InkMode): string {
  return INK_HEX[mode];
}

export function inkMuted(mode: InkMode): string {
  return INK_MUTED[mode];
}

/** Accents per slide: short vibrant ladders that stay on-palette. */
export const SLIDE_ACCENTS: Record<
  number,
  { accent: string; accent2: string }
> = {
  0: { accent: "#C9A0F5", accent2: "#6B21A8" },
  /** Volume ocean: ice crest → deep teal (black ink on flame sky / water lip). */
  1: { accent: "#A5F3FC", accent2: "#075985" },
  /** Ghosted night (entity) + list: purple → ember (D-010 / D-017). */
  2: { accent: "#5C1A7A", accent2: "#F05A3D" },
  3: { accent: "#5C1A7A", accent2: "#F05A3D" },
  4: { accent: "#ffe66d", accent2: "#ff6b9d" },
  5: { accent: "#C9A0F5", accent2: "#6B21A8" },
  6: { accent: "#ff4d8d", accent2: "#ffe66d" },
  7: { accent: "#1B2A6B", accent2: "#ffe66d" },
  8: { accent: "#ff4d8d", accent2: "#ffe66d" },
  9: { accent: "#1B2A6B", accent2: "#F05A3D" },
};

export function accentsForSlide(index: number) {
  return SLIDE_ACCENTS[index] ?? SLIDE_ACCENTS[0]!;
}
