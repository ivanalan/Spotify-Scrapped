/**
 * Orbit Cascade card palette: production source of truth for `/scrapped`.
 * Research storyboard re-exports from here. See D-007.
 *
 * Parked alternate: striped tent kit lives in
 * `docs/mocks/story-color-presets.html` + [D-050](../../docs/decisions/D-050-striped-tent-deck-colors.md)
 * (not wired).
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
 * Scene 4 one-like field: volume ocean crest → deep (combo A / D-045).
 * Soft-close stays flat teal. Keep in sync with
 * `data-scrapped-field="one-like-nest"` in globals.css.
 */
export const ONE_LIKE_OCEAN_GRADIENT =
  "linear-gradient(165deg, #A5F3FC 0%, #0284C7 48%, #075985 100%)";

/** @deprecated Alias for storyboard; prefer ONE_LIKE_OCEAN_GRADIENT. */
export const TEAL_NEST_GRADIENT = ONE_LIKE_OCEAN_GRADIENT;

/**
 * Scene 4 heart + list floaters (combo A): intro circle / disk stops.
 * Hero rose; blooms hot → lilac → orchid. Share card 0 moon + card 2 floaters rhyme these.
 */
export const ONE_LIKE_HEART = {
  hero: "#C9185B",
  blooms: ["#E070FF", "#C9A0F5", "#9B4DE8"] as const,
  /** 5 perimeter floaters: bloom ladder + hero, then repeat hot. */
  floaters: ["#E070FF", "#C9A0F5", "#9B4DE8", "#C9185B", "#E070FF"] as const,
  oceanDeep: "#075985",
  oceanMid: "#0284C7",
  oceanIce: "#A5F3FC",
} as const;

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
  "teal", // 4 one-like; ocean field override (D-045); chrome stays dark
  "rose", // 5 left-on-read entity; rose field + ocean bloom (D-049)
  "rose", // 6 left-on-read list; rose field + ocean bloom (D-049)
  "ember", // 7 plot twist / reunion; same flame field as volume (D-046); film (D-016)
  "teal", // 8 soft close; ocean deep field + heart iris (D-047); chrome dark
  "ink", // 9 share; ink stage + rose card 0 (D-051)
];

/**
 * Share finale inset density: B2 explore lock (D-012 IA · D-033 art).
 * Card is always 9:16 (Wrapped share ritual): on screen and in the export PNG.
 *
 * Authored at a fixed design canvas (`designWidthPx` × `designHeightPx`); the
 * stage shell scales that poster uniformly so type/spacing match every viewport.
 */
export const SHARE_FINALE_DENSITY = {
  gutterPx: 36,
  /** Sharp corners: Wrapped-form share island, no radius. */
  radiusPx: 0,
  cardActionsGapPx: 32,
  /** Gap between share island and carousel dots (D-042). */
  dotsGapAfterCardPx: 14,
  /** Space between pagination dots. */
  dotsGapPx: 8,
  /** Visual dot diameter (hit target stays 40px). */
  dotSizePx: 6,
  bodyTopPx: 28,
  bodyBottomPx: 16,
  /** Portrait share island: Stories / Reels friendly (Wrapped 25-share-finale). */
  aspectRatio: "9 / 16",
  /**
   * Locked design width (phone density). Capture node is always this wide;
   * stage shell scales it to fit. Also caps shell max width (Share column).
   * Tuned lock: 300 (was 320).
   */
  maxWidthPx: 300,
  /** Design height for 9:16 at `maxWidthPx` (300 × 16/9). */
  designHeightPx: 533,
  /** Target PNG width; height follows design 9:16 via capture scale. */
  exportWidthPx: 1080,
  exportHeightPx: 1920,
  heroBandPct: 46,
  heroSizePct: 54,
  listColGapPx: 14,
  listRowGapRem: 0.51,
  listPadXPx: 16,
  listPadYPx: 0,
  listLabelGapRem: 0.55,
  /** Gap between list block and liked-metrics row (flow, not bottom %). */
  metricsGapAfterListPx: 29,
  /** Gap between liked-metrics row and brand line. */
  brandGapAfterMetricsPx: 39,
  /** Bottom padding under brand inside the card body. */
  brandPadBottomPx: 16,
  typeRem: 0.65,
  /** Metric number / label on the share card body. */
  metricNumberRem: 1.3,
  metricLabelRem: 0.72,
  actionsGapPx: 12,
} as const;

/**
 * Share finale visual kit: D-051 · left-on-read rose · ocean moon ·
 * three hero ghosts (mixed z) · liked metrics · myscrapped.com centered.
 * Stage: ink + intro disks/star. Plain rose card; ocean ice→deep moon.
 * Field rhymes scenes 5→6 ([D-049]); moon rhymes volume / one-like water.
 * No year digits on the card. Density still D-033 / D-012.
 */
export const SHARE_FINALE_KIT = {
  id: "b2-share-finale",
  /** Stage field swatch: drives slide chrome (dark theme). */
  stageSwatch: "ink" as const,
  /** Plain rose (left-on-read field); gradients reserved for moon. */
  cardBg: CARD_PALETTE.rose.bg,
  cardInk: "#f5f5f5",
  cardMuted: "color-mix(in oklab, #f5f5f5 90%, transparent)",
  cardPanel: "color-mix(in oklab, #f5f5f5 14%, transparent)",
  ghostFill: "#FBEAFF",
  ghostEye: "#2a2433",
  brandLine: "myscrapped.com",
  brand: {
    position: "center" as const,
    sizeRem: 0.72,
    letterSpacingEm: -0.015,
  },
  /**
   * TR moon in the hero band: inset from top-right (negative = outside edge).
   * Ocean ice → mid → deep (volume / one-like water). Sphere only.
   */
  moon: {
    anchor: "tr" as const,
    sizePx: 164,
    insetXPx: -44,
    insetYPx: -52,
    stops: [
      { offset: "0%", color: "#FFFFFF" },
      { offset: "22%", color: ONE_LIKE_HEART.oceanIce },
      { offset: "55%", color: ONE_LIKE_HEART.oceanMid },
      { offset: "100%", color: ONE_LIKE_HEART.oceanDeep },
    ],
    opacity: 1,
  },
  /**
   * Hero-band ghosts. `z: below` under cover; `z: above` over cover.
   * Positions are % of the hero band.
   */
  ghosts: [
    { xPct: 14, yPct: 4, sizePx: 46, rotDeg: -14, opacity: 1, z: "below" as const },
    { xPct: 73, yPct: 24, sizePx: 38, rotDeg: 8, opacity: 1, z: "above" as const },
    { xPct: 59, yPct: 74, sizePx: 48, rotDeg: -3, opacity: 1, z: "above" as const },
  ],
  ghostMotion: {
    bobPx: 10,
    wiggle: 1,
    durationSec: 4.3,
    phaseSec: 1.2,
  },
} as const;

/**
 * Share finale card 1: All time favs · G3 cinema film · centered brand (D-043).
 * Same 300×533 canvas as D-033; yellow field; black letterbox; cover above film.
 * Explore: `docs/mocks/share-all-time-favs.html`.
 */
export const SHARE_ALL_TIME_FAVS_KIT = {
  id: "g3-center-brand",
  cardBg: "#F0B429",
  cardInk: "#1c1c1c",
  cardMuted: "color-mix(in oklab, #1c1c1c 72%, transparent)",
  cardPanel: "color-mix(in oklab, #1c1c1c 10%, transparent)",
  brandLine: "myscrapped.com",
  listLabel: "All time favs",
  /** Match card 0 (D-033) cover size + centered hero band. */
  heroBandPct: SHARE_FINALE_DENSITY.heroBandPct,
  heroSizePct: SHARE_FINALE_DENSITY.heroSizePct,
  listWidthPct: 64,
  listPadXPx: 16,
  /**
   * Pull the list up into the empty yellow under the centered cover
   * without moving the art (negative body margin).
   */
  listPullUpPx: 16,
  listRowGapRem: 0.51,
  listLabelGapRem: 0.55,
  listLabelRem: 0.72,
  typeRem: 0.85,
  /** Liked metrics removed; brand sits in that slot under the list. */
  showMetrics: false,
  brandGapAfterListPx: 55,
  listColGapPx: 14,
  /** Body pad under brand so content clears the bottom rail. */
  bodyPadBottomExtraPx: 12,
  brand: {
    position: "center" as const,
    sizeRem: SHARE_FINALE_KIT.brand.sizeRem,
    letterSpacingEm: SHARE_FINALE_KIT.brand.letterSpacingEm,
  },
  film: {
    bg: "#0A0A0A",
    hole: "#F0B429",
    railHeightPx: 64,
    sprocketPx: 16,
    sprocketGapPx: 15,
    sprocketPadXPx: 12,
    scrollTopSec: 36,
    scrollBotSec: 42,
    perfCount: 32,
  },
} as const;

/**
 * Share finale card 2: `"1 like" artists` · ocean nest + rising hearts (D-048).
 * Same 300×533 canvas; liked metrics hidden; centered brand under list.
 * Field + floaters rhyme scene 4 (D-045). IA / density stay D-044.
 */
export const SHARE_ONE_LIKE_ARTISTS_KIT = {
  id: "b1-float-cover",
  /** Scene 4 ocean nest (crest → deep); light ink on blue. */
  cardBg: ONE_LIKE_OCEAN_GRADIENT,
  cardInk: "#f5f5f5",
  cardMuted: "color-mix(in oklab, #f5f5f5 90%, transparent)",
  cardPanel: "color-mix(in oklab, #f5f5f5 14%, transparent)",
  brandLine: "myscrapped.com",
  /** Quoted product label + artists (D-006 “1 like”). */
  listLabel: '"1 like" artists',
  heroBandPct: SHARE_FINALE_DENSITY.heroBandPct,
  heroSizePct: SHARE_FINALE_DENSITY.heroSizePct,
  listWidthPct: 62,
  listPadXPx: SHARE_FINALE_DENSITY.listPadXPx,
  listPullUpPx: 16,
  listRowGapRem: 0.9,
  listLabelGapRem: 1,
  listLabelRem: 0.85,
  typeRem: 0.85,
  showMetrics: false,
  metricNumberRem: SHARE_FINALE_DENSITY.metricNumberRem,
  metricLabelRem: SHARE_FINALE_DENSITY.metricLabelRem,
  metricsGapAfterListPx: 48,
  /** Brand sits under the list when metrics are hidden. */
  brandGapAfterListPx: 55,
  brandPadBottomPx: SHARE_FINALE_DENSITY.brandPadBottomPx,
  listColGapPx: SHARE_FINALE_DENSITY.listColGapPx,
  brand: {
    position: "center" as const,
    sizeRem: SHARE_FINALE_KIT.brand.sizeRem,
    letterSpacingEm: SHARE_FINALE_KIT.brand.letterSpacingEm,
  },
  floaters: {
    count: 5,
    /** Same ladder as scene 4 list floaters (ONE_LIKE_HEART / D-045). */
    colors: ONE_LIKE_HEART.floaters,
    sizesPx: [28, 22, 20, 26, 30] as const,
    leftPct: [5, 20, 46, 68, 84] as const,
    dxPx: [-18, -28, 0, 30, 22] as const,
    durationSec: [14, 15, 13.5, 14.5, 15.5] as const,
    delaySec: [-8, -4, -6, -9.5, -11] as const,
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
  /** One-like: circle hot + orchid (D-045 combo A). */
  4: { accent: "#E070FF", accent2: "#9B4DE8" },
  5: { accent: "#C9A0F5", accent2: "#6B21A8" },
  6: { accent: "#ff4d8d", accent2: "#ffe66d" },
  7: { accent: "#1B2A6B", accent2: "#ffe66d" },
  8: { accent: "#ff4d8d", accent2: "#ffe66d" },
  9: { accent: "#1B2A6B", accent2: "#F05A3D" },
};

export function accentsForSlide(index: number) {
  return SLIDE_ACCENTS[index] ?? SLIDE_ACCENTS[0]!;
}
