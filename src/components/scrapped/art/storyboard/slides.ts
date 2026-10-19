import type { DirectionMeta, StoryboardSlide } from "./types";

export const STORYBOARD_SLIDES: StoryboardSlide[] = [
  { index: 0, label: "Year open / welcome", pattern: "intro" },
  { index: 1, label: "Liked volume", pattern: "volume" },
  { index: 2, label: "#1 ghosted song", pattern: "entity" },
  { index: 3, label: "Ghosted songs top 5", pattern: "list" },
  { index: 4, label: "1-like artists", pattern: "list" },
  { index: 5, label: "#1 left-on-read artist", pattern: "entity" },
  { index: 6, label: "Left-on-read artists", pattern: "list" },
  { index: 7, label: "Reunion / second chance", pattern: "reunion" },
  { index: 8, label: "Soft close", pattern: "close" },
  { index: 9, label: "Share finale", pattern: "share" },
];

export const STORYBOARD_DIRECTIONS: DirectionMeta[] = [
  {
    id: "cascade-rings",
    label: "Cascade Rings",
    short: "A · Dark carnival",
    thesis:
      "Corner-anchored concentric rings and semis cascade in; each slide hard-cuts to a new saturated field.",
    register: "Dark / high chroma · near-white ink · large few shapes",
  },
  {
    id: "dot-orbit",
    label: "Dot Orbit",
    short: "B · Mid soft",
    thesis:
      "Dots are the atom; soft gradient washes sit under a quieter field. More merciful than carnival, still art-led.",
    register: "Mid tints · near-black ink · one accent hue per slide",
  },
  {
    id: "quarter-construct",
    label: "Quarter Construct",
    short: "C · Light conversational",
    thesis:
      "Flat light canvases with graphic quarters and semis as corner marks — geometry as accent, type still primary.",
    register: "Light solids · Bauhaus accents · no neon glow",
  },
];
