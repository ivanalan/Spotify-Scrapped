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
      "Layered swell trains: continuous linear phase scroll (dispersion, no ping-pong) + soft bob; high tide crest rises ~4.2s; kit-C oval fish = likedThisYear (1:1, cap 50) fade in below copy",
    composition:
      "High tide waterline above centered copy; fish school from subtitle → viewport bottom (y≈390–630, even strata); aqua crest under black type; deck chrome matches light theme",
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
    hero: "Ridge grass · S9 4-point glow stars · one cover-TR blob ghost (no moon)",
    motion: "Grass rise-from-soil cascade (near→mid→far) + flow sway; star glow pulse; ghost bob at cover TR",
    composition:
      "Ink field; purple→ember accents; grass floor; mid clear for cover + copy (D-018)",
    why: "Ground haunt first — sky (moon + enter-float ghosts) arrives on the list.",
    iterations: [
      "C1 — Orchid + gold/aqua spiral (displaced)",
      "C2 — Ink night · moon · stars · one BL ghost (D-017 N4 · displaced)",
      "C3 — Grass · cover-TR haunt · S9 stars · no moon (current · D-018)",
    ],
  },
  {
    index: 3,
    label: "Ghosted songs top 5",
    pattern: "list",
    bg: card(3).bg,
    ink: card(3).ink,
    ...accents(3),
    hero: "TR-inset silver→ember moon (no halo) · quiet S9 stars · 5 enter-float ghosts",
    motion:
      "Moon settle; quiet star glow; ghosts stagger-enter then independent bob",
    composition:
      "Ink field; no grass/clouds; moon TR-inset + inset edge ghosts; mid clear for list (D-018); C8 chrome scrim",
    why: "Sky chorus after the ground haunt — bright moon with chrome scrim.",
    iterations: [
      "D1 — Two drifting clouds + BL orb (displaced)",
      "D2 — Sky/grass pack (D-010 · displaced)",
      "D3 — Hard-TR moon · S9 · rising ghosts · C8 scrim (displaced)",
      "D4 — TR-inset moon · 5 enter-float ghosts · quiet stars (current · D-018)",
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
    hero: "Typing pin (5I bloom) · orchid corner wash (D-019 B1)",
    motion: "Pin settle + typing-dot bob; freeze on reduced motion",
    composition: "Ink + B1 wash; pin mid-left clear of artwork (D-017 T1 / D-019)",
    why: "One→many with list edge bubbles — same grammar as hearts/ghosts.",
    iterations: [
      "F1 — D-008 orchid ladder (displaced on live deck)",
      "F2 — 5I dual skew bloom hero (displaced)",
      "F3 — Compact TL typing pin (D-017)",
      "F4 — B1 orchid corners + pin place (current · D-019)",
    ],
  },
  {
    index: 6,
    label: "Left-on-read artists",
    pattern: "list",
    bg: card(6).bg,
    ink: card(6).ink,
    ...accents(6),
    hero: "Softer large edge chat (quiet → frame) · B1 wash",
    motion: "Same bubble bloom as pin fill; edge frame only (D-015)",
    composition: "Ink + B1 wash; chat frames edges; mid clear for list (D-019)",
    why: "List half of typing-pin pair — mini chorus, not a second pin.",
    iterations: [
      "G1 — Classic orb + cloud (displaced on live deck)",
      "G2 — Edge chat frame (D-016 / D-017)",
      "G3 — B1 wash + softer large frame (current · D-019)",
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
    hero: "Intro disks + star on ink stage; teal card; BL corner moon + 2 ghosts (D-014)",
    motion: "Intro cascade-breathe + star grow-spin; moon settle/glow; ghost float on card",
    composition:
      "Ink stage gutters; opaque teal card in front; Share/Replay below; MyScrapped.com",
    why: "Wrapped-form inset IA (D-012) + kit J8 visual promote (D-014).",
    iterations: [
      "J1 — Blank on gold (displaced by D-012)",
      "J2 — Ember stage + ink card (D-012, displaced by D-014)",
      "J3 — Ink stage + teal card + framing ghosts (D-014)",
      "J3b — + large BL gold→mango→rose sphere (current / D-014)",
    ],
  },
];
