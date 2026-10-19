/**
 * Orbit Cascade card palette — production source of truth for `/scrapped`.
 * Research storyboard re-exports from here. See D-007.
 */

export const CARD_PALETTE = {
  ink: { bg: "#12101A", ink: "dark" as const, label: "ink" },
  orchid: { bg: "#9B4DE8", ink: "dark" as const, label: "orchid" },
  /** Liked-volume — flame soft orange, light theme (black ink). */
  ember: { bg: "#FF7A3A", ink: "light" as const, label: "ember" },
  mango: { bg: "#FF9F1C", ink: "light" as const, label: "mango" },
  gold: { bg: "#E8B84B", ink: "light" as const, label: "gold" },
  teal: { bg: "#1A7A6E", ink: "dark" as const, label: "teal" },
  rose: { bg: "#C9185B", ink: "dark" as const, label: "rose" },
} as const;

/** Ember sky — keep in sync with `data-wrapped-tone="ember"` in globals.css. */
export const EMBER_FIELD_GRADIENT =
  "linear-gradient(165deg, #FFC878 0%, #FF7A3A 45%, #E85018 100%)";

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
  "orchid", // 2 ghosted favs / #1 song
  "ink", // 3 ghosted songs list — sky/grass/ghosts (D-010)
  "teal", // 4 list
  "ink", // 5 #1 artist (orchid ladder on ink)
  "ink", // 6 list
  "mango", // 7 reunion
  "teal", // 8 soft close — bookend grow-in
  "ink", // 9 share — ink stage + teal card (D-012 / D-014 kit J8)
];

/**
 * Share finale inset density — locked from exploration (D-012).
 * Visual kit: D-014 (J8 · Ink / teal card).
 */
export const SHARE_FINALE_DENSITY = {
  gutterPx: 36,
  radiusPx: 12,
  cardActionsGapPx: 32,
  bodyTopPx: 28,
  bodyBottomPx: 16,
  heroBandPct: 52,
  heroSizePct: 65,
  listColGapPx: 18,
  listRowGapRem: 1.1,
  listPadXPx: 19,
  listPadYPx: 16,
  typeRem: 0.86,
  sharePadYPx: 12,
  actionsGapPx: 12,
} as const;

/**
 * Share finale visual kit — promoted from explore `j-ink-teal-card` (D-014).
 * Stage: ink + intro disks/star. Card: teal gradient + 2 ghosts framing hero.
 * Disks/star reuse INTRO_SHARED_GRADIENT / INTRO_STAR (same stops as the lock).
 */
export const SHARE_FINALE_KIT = {
  id: "j-ink-teal-card",
  /** Stage field swatch — drives slide chrome (dark theme). */
  stageSwatch: "ink" as const,
  cardBg: "linear-gradient(165deg, #5EEAD4 0%, #1A7A6E 50%, #0F4C5C 100%)",
  /** Light type on teal card. */
  cardInk: "#f5f5f5",
  cardMuted: "color-mix(in oklab, #f5f5f5 90%, transparent)",
  cardPanel: "color-mix(in oklab, #f5f5f5 14%, transparent)",
  ghostFill: "#f5f0ff",
  ghostEye: "#0F4C5C",
  brandLine: "MyScrapped.com",
  ghosts: {
    tl: { xPct: 6, yPct: 6, sizePx: 54 },
    br: { xPct: 76, yPct: 36, sizePx: 66 },
    bobPx: 10,
    /** Multiplier on rotate amp (1 = explore default). */
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

/** Near-ink secondary copy — soft hierarchy, not washed grey (D-007). */
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
 * One shared orchid sweep for the intro ladder — every disk paints
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

/** Intro BR star — warm mango→ember accent on the ink field. */
export const INTRO_STAR = {
  from: "#FFB04A",
  to: "#E85D2C",
} as const;

/**
 * #1 artist orbit — prototype kit F (D-008), ink-lean contrast retune.
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
 * Ghosted songs list clouds (D-010) — tweak here.
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

/** Active-slide chrome theme — brand, progress, and controls must match. */
export function slideChromeTheme(index: number): StoryChromeTheme {
  return cardForSlide(index).ink === "dark" ? "dark" : "light";
}

export function inkHex(mode: InkMode): string {
  return INK_HEX[mode];
}

export function inkMuted(mode: InkMode): string {
  return INK_MUTED[mode];
}

/** Accents per slide — short vibrant ladders that stay on-palette. */
export const SLIDE_ACCENTS: Record<
  number,
  { accent: string; accent2: string }
> = {
  0: { accent: "#C9A0F5", accent2: "#6B21A8" },
  /** Volume ocean — ice crest → deep teal (black ink on flame sky / water lip). */
  1: { accent: "#A5F3FC", accent2: "#075985" },
  /** Ghosted spiral — warm gold → aqua on orchid (Wrapped feast energy, no ribbons). */
  2: { accent: "#FFE66D", accent2: "#5EEAD4" },
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
