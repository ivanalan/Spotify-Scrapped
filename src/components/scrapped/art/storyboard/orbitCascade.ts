import type { SlidePattern } from "./types";
import {
  CARD_PALETTE,
  SLIDE_SWATCH,
  accentsForSlide,
  cardForSlide,
  type CardSwatch,
} from "@/lib/scrapped-card-palette";

/**
 * Orbit Cascade — research storyboard specs.
 * Production tokens: `src/lib/scrapped-card-palette.ts` (D-007).
 */

export { CARD_PALETTE, SLIDE_SWATCH };
export type { CardSwatch };

export const ORBIT_CASCADE = {
  id: "orbit-cascade",
  label: "Orbit Cascade",
  thesis:
    "Oval vocabulary on a card palette (ink · orchid · ember · mango · gold · teal · rose), plus a volume ocean-wave exception. Hard color cuts; no white canvases. Soft easing inside each beat.",
  atoms: [
    "filled concentric ovals",
    "gradient concentric ovals",
    "ocean wave band (volume)",
    "2-stop gradient cloud",
    "2-stop gradient oval orb",
    "skewed gradient pill (funky)",
  ],
  verbs: [
    "cascade-breathe",
    "ocean roll + tide rise",
    "spiral cascade → drift",
    "clouds drift across top",
    "orb enter (bottom-left)",
    "skew / rotate / scale warp",
  ],
  reject: [
    "ArcStroke gap-close (reunion)",
    "lonely single-ring soft close",
    "quarter-construct as primary",
    "neon ribbon / chaos collage",
    "unmotivated arc+dot soup (AI peripheral tell)",
    "dead-center symmetrical decoration",
    "equal busy-ness in every band",
    "white / cream / mist paper backgrounds",
    "perfect circles (always oval via OVAL sx/sy)",
  ],
  wrappedBorrow:
    "Card-cut color fields from a short reused palette · peripheral art only. Do not borrow ribbons, Sound Town, or white letterbox fills.",
  inkDark: "#f5f5f5",
  inkLight: "#1c1c1c",
  palette: CARD_PALETTE,
} as const;

export type SlideSpec = {
  index: number;
  label: string;
  pattern: SlidePattern;
  bg: string;
  ink: "dark" | "light";
  accent: string;
  accent2: string;
  hero: string;
  motion: string;
  composition: string;
  why: string;
  iterations: string[];
};

function card(index: number) {
  return cardForSlide(index);
}

function accents(index: number) {
  return accentsForSlide(index);
}

export const SLIDE_SPECS: SlideSpec[] = [
  {
    index: 0,
    label: "Year open / welcome",
    pattern: "intro",
    bg: card(0).bg,
    ink: card(0).ink,
    ...accents(0),
    hero: "Filled concentric ovals cascading from TL (not stroke rings)",
    motion:
      "cascade-breathe: each disk settles at peak, then idle shrinks (~0.945) staggered outer→inner",
    composition:
      "Large disk stack anchored top-left; copy left-aligned in clear field; Continue as solid ink chip",
    why: "Ink open — orchid oval ladder (vibrant short range on near-black field).",
    iterations: [
      "A1 — Orchid ladder on ink",
      "A2 — Single-hue orchid with opacity steps only",
      "A3 — Whisper idle breathe after settle (current)",
      "A4 — Origin TL vs slightly inset (x=40,y=40) for less crop on desktop",
    ],
  },
  {
    index: 1,
    label: "Liked volume",
    pattern: "volume",
    bg: card(1).bg,
    ink: card(1).ink,
    ...accents(1),
    hero: "Bottom ocean wave — ice→deep teal on flame ember; light theme (black ink)",
    motion:
      "Layered swell trains: continuous linear phase scroll (dispersion, no ping-pong) + soft bob; high tide crest rises ~4.2s",
    composition:
      "High tide waterline above centered copy; aqua crest under black type; deck chrome matches light theme",
    why: "Likes as rising water on a hot orange field — dark-theme chrome + copy travel with the slide.",
    iterations: [
      "B1 — Bottom semi + linear gradient + enter-breathe",
      "B2 — Ice→deep teal ocean on flame ember; tide rises on joined beat (current)",
      "B3 — Stronger multi-crest foam line",
      "B4 — Tide keyed to subline instead of narrative beat",
    ],
  },
  {
    index: 2,
    label: "#1 ghosted song",
    pattern: "entity",
    bg: card(2).bg,
    ink: card(2).ink,
    ...accents(2),
    hero: "Cover clear · perimeter spiral of ~32 small 2-stop gradient orbs",
    motion: "Orbs cascade in-place along the spiral (slow fade/scale), then drift",
    composition: "Orchid field; gold→aqua orbs hugged to edges; clear mid for copy/cover",
    why: "Wrapped feast purple energy without ribbons — peripheral GradOrb spiral.",
    iterations: [
      "C1 — Mango + navy/orchid orbs (displaced)",
      "C2 — Orchid field + gold/aqua perimeter spiral-in (current)",
      "C3 — Group drift only",
      "C4 — Cascade once, then freeze",
    ],
  },
  {
    index: 3,
    label: "Ghosted songs top 5",
    pattern: "list",
    bg: card(3).bg,
    ink: card(3).ink,
    ...accents(3),
    hero: "Seamless marquee clouds · spiky wind grass · perimeter blob ghosts",
    motion:
      "Cloud marquee 32s (no jump); grass gust windStrength 0.4 / 5s; ghosts float",
    composition:
      "Ink field; purple→ember accents; sky top / grass floor / ghosts on edges; mid clear for list (D-010)",
    why: "Ghosted theme as weather + characters — not a BL orb on gold.",
    iterations: [
      "D1 — Two drifting clouds + BL orb (displaced)",
      "D2 — Sky/grass HTML explore",
      "D3 — Ink + purple→ember + blob ghosts perimeter (current / D-010)",
    ],
  },
  {
    index: 4,
    label: "1-like artists",
    pattern: "list",
    bg: card(4).bg,
    ink: card(4).ink,
    ...accents(4),
    hero: "Same orb + drifting clouds — gold→pink on teal",
    motion: "Identical motif verbs; palette only",
    composition: "Identical grammar as slide 3",
    why: "Reuse motifs; retint only within the 6-swatch system.",
    iterations: [
      "E1 — Teal field (current)",
      "E2 — Smaller orb",
    ],
  },
  {
    index: 5,
    label: "#1 left-on-read artist",
    pattern: "entity",
    bg: card(5).bg,
    ink: card(5).ink,
    ...accents(5),
    hero: "Eccentric opaque ovals · ink-lean orchid ladder · independent spin",
    motion: "Slow per-ring CW/CCW spin (D-008 kit F); freeze on reduced motion",
    composition:
      "Ink field; deep orchid orbit frames cover slot; clear center for art",
    why: "Ink-lean orchid spin on ink — mid-band readable; clearer than rose cascade.",
    iterations: [
      "F1 — Rose cascade (displaced)",
      "F2 — Bright orchid ladder (displaced — type contrast)",
      "F3 — Ink-lean orchid ladder (current / D-008)",
      "F4 — Stroke rings with gradient stroke instead of fills",
    ],
  },
  {
    index: 6,
    label: "Left-on-read artists",
    pattern: "list",
    bg: card(6).bg,
    ink: card(6).ink,
    ...accents(6),
    hero: "Orb + cloud · pink→gold on ink",
    motion: "Same motif verbs as other lists",
    composition: "Third list beat; keep corner grammar identical",
    why: "Toolkit scales via gradient retint only — ink recycled from open.",
    iterations: [
      "G1 — Ink recycle (current)",
      "G2 — Crop orb lower if rows feel crowded",
    ],
  },
  {
    index: 7,
    label: "Reunion / second chance",
    pattern: "reunion",
    bg: card(7).bg,
    ink: card(7).ink,
    ...accents(7),
    hero: "Corner rain — skewed orbs cascade then drift",
    motion: "Four corner orbs enter with stagger, slow idle drift",
    composition: "Mango field; mid clear for reunion list; rain at edges",
    why: "Shortlist pick — same funky orb atom as soft-close variants.",
    iterations: [
      "H1 — Corner rain (locked from shortlist)",
      "H2 — Swap to another shortlist cell via storyboard",
    ],
  },
  {
    index: 8,
    label: "Soft close",
    pattern: "close",
    bg: card(8).bg,
    ink: card(8).ink,
    ...accents(8),
    hero: "Shortlist funky art — default double stack bookend",
    motion: "Click shortlist to swap: rain / stack / corner orb / row",
    composition: "Soft-close copy centered; funky frame from shortlist",
    why: "Thank-you as the art beat — orchid recycle (volume moved to ember ocean).",
    iterations: [
      "I1 — Double stack bookend (default)",
      "I2 — Orb rain frame",
      "I3 — Big corner orb",
      "I4 — Orb row footer",
    ],
  },
  {
    index: 9,
    label: "Share finale",
    pattern: "share",
    bg: card(9).bg,
    ink: card(9).ink,
    ...accents(9),
    hero: "Intro disks + star on ink stage; teal gradient card; 2 ghosts frame hero (D-014)",
    motion: "Intro cascade-breathe + star grow-spin; ghost float on card",
    composition:
      "Ink stage gutters; opaque teal card in front; Share/Replay below; MyScrapped.com",
    why: "Wrapped-form inset IA (D-012) + kit J8 visual promote (D-014).",
    iterations: [
      "J1 — Blank on gold (displaced by D-012)",
      "J2 — Ember stage + ink card (D-012, displaced by D-014)",
      "J3 — Ink stage + teal card + framing ghosts (current / D-014)",
    ],
  },
];
