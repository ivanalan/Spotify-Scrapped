/**
 * Orbit Cascade card palette — production source of truth for `/scrapped`.
 * Research storyboard re-exports from here. See D-007.
 */

export const CARD_PALETTE = {
  ink: { bg: "#12101A", ink: "dark" as const, label: "ink" },
  orchid: { bg: "#9B4DE8", ink: "dark" as const, label: "orchid" },
  /** Liked-volume — bright orange, light theme (black ink). */
  ember: { bg: "#FFB04A", ink: "light" as const, label: "ember" },
  mango: { bg: "#FF9F1C", ink: "light" as const, label: "mango" },
  gold: { bg: "#E8B84B", ink: "light" as const, label: "gold" },
  teal: { bg: "#1A7A6E", ink: "dark" as const, label: "teal" },
  rose: { bg: "#C9185B", ink: "dark" as const, label: "rose" },
} as const;

/** Ember sky — keep in sync with `data-wrapped-tone="ember"` in globals.css. */
export const EMBER_FIELD_GRADIENT =
  "linear-gradient(165deg, #FFD08A 0%, #FFB04A 45%, #FF8F2A 100%)";

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

export const INK_MUTED = {
  dark: "color-mix(in oklab, #f5f5f5 62%, transparent)",
  light: "color-mix(in oklab, #1c1c1c 55%, transparent)",
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
  /** Volume ocean — aqua crest → deep blue (black ink on bright ember / water lip). */
  1: { accent: "#5EEAD4", accent2: "#1D4ED8" },
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
