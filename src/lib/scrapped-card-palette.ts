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
  "gold", // 3 list
  "teal", // 4 list
  "rose", // 5 #1 artist
  "ink", // 6 list
  "mango", // 7 reunion
  "orchid", // 8 soft close
  "gold", // 9 share
];

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
 * #1 artist orbit — prototype kit A (D-008).
 * Center-aligned eccentric ovals; opaque linear gradients; independent spin.
 * Canvas stays rose (`CARD_PALETTE.rose`); bottom wash darkens the mid-band.
 */
export const ARTIST_ORBIT_A = {
  cx: 180,
  cy: 275,
  wash: "#8A1238",
  /** Inner → outer. Painted outer-first so inner sits on top. */
  rings: [
    { rx: 68, ry: 68, from: "#FFE66D", to: "#FF9F1C", dur: 26, reverse: false },
    { rx: 105, ry: 92, from: "#FF9F1C", to: "#F05A3D", dur: 38, reverse: true },
    { rx: 145, ry: 108, from: "#F05A3D", to: "#C9185B", dur: 50, reverse: false },
    { rx: 185, ry: 128, from: "#C9185B", to: "#8A1238", dur: 47, reverse: true },
    { rx: 225, ry: 150, from: "#8A1238", to: "#4A0A22", dur: 59, reverse: false },
  ],
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
  5: { accent: "#ffe66d", accent2: "#F05A3D" },
  6: { accent: "#ff4d8d", accent2: "#ffe66d" },
  7: { accent: "#1B2A6B", accent2: "#ffe66d" },
  8: { accent: "#ff4d8d", accent2: "#ffe66d" },
  9: { accent: "#1B2A6B", accent2: "#F05A3D" },
};

export function accentsForSlide(index: number) {
  return SLIDE_ACCENTS[index] ?? SLIDE_ACCENTS[0]!;
}
