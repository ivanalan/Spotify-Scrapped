import { PixelFieldArt } from "./PixelFieldArt";
import { PerspectiveSlabsArt } from "./PerspectiveSlabsArt";
import { BauhausConstructArt } from "./BauhausConstructArt";
import { RoughSketchArt } from "./RoughSketchArt";
import { SoftCurvesArt } from "./SoftCurvesArt";
import { MotifGridArt } from "./MotifGridArt";
import { StripeForceArt } from "./StripeForceArt";
import { RibbonDriftArt } from "./RibbonDriftArt";
import { ConcentricBloomArt } from "./ConcentricBloomArt";
import { GlassSlabsArt } from "./GlassSlabsArt";
import type { DirectionId, DirectionMeta } from "./types";

export type { ArtSurface, DirectionArtProps, DirectionId, DirectionMeta } from "./types";

export const DIRECTIONS: DirectionMeta[] = [
  {
    id: "pixel-field",
    label: "Pixel field",
    thesis:
      "Chunked digital assembly; Wrapped stairs grammar meets uni Technology blocks. Cells are the atom; type sits on a paper plate.",
    when: "When Scrapped should feel like a broken UI reconstituting around the anti-Wrapped thesis.",
    libs: "Canvas 2D + motion (reduced-motion freeze)",
    swatch: { bg: "#12081f", a: "#ffe66d", b: "#3de0ff", c: "#ff4d8d" },
    Art: PixelFieldArt,
  },
  {
    id: "perspective-slabs",
    label: "Perspective slabs",
    thesis:
      "Fake-3D tumbling panels without WebGL. Uni orange Technology / PE energy; depth as carnival frame, not content.",
    when: "Your strongest carnival lane; opener energy before quieter list beats.",
    libs: "CSS perspective + motion",
    swatch: { bg: "#12081f", a: "#ff6b3d", b: "#ffc93c", c: "#3de0ff" },
    Art: PerspectiveSlabsArt,
  },
  {
    id: "bauhaus-construct",
    label: "Bauhaus construct",
    thesis:
      "Flat primaries, quarter-circles, diagonals, starbursts; Porto / Mexico City poster craft as a full-bleed tile field.",
    when: "Bold pattern without fake depth; reads as graphic design, not party neon.",
    libs: "SVG + motion stagger",
    swatch: { bg: "#141414", a: "#12c4b0", b: "#f05a3d", c: "#f5c518" },
    Art: BauhausConstructArt,
  },
  {
    id: "rough-sketch",
    label: "Rough sketch",
    thesis:
      "Hand-drawn notebook anti-Wrapped. Vectors literally draw start→finish; explanation energy, not polish.",
    when: "When honesty should feel sketched at a kitchen table, not produced in a brand studio.",
    libs: "roughjs + animejs createDrawable",
    swatch: { bg: "#f4f0e6", a: "#1c1c1c", b: "#e85d3a", c: "#2a6f6a" },
    Art: RoughSketchArt,
  },
  {
    id: "soft-curves",
    label: "Soft curves",
    thesis:
      "Soft Surfaces album language; saturated flats + thick organic strokes that pathLength-draw and drift.",
    when: "Music-object feel; softer than slabs, more graphic than ribbons alone.",
    libs: "SVG + motion pathLength",
    swatch: { bg: "#1a0f2e", a: "#ff6b9d", b: "#5ce1e6", c: "#c4f542" },
    Art: SoftCurvesArt,
  },
  {
    id: "motif-grid",
    label: "Motif grid",
    thesis:
      "One glyph, city-poster density (Nairobi / Berlin / Miami). Cascade fill tests stagger as brand.",
    when: "Pattern-as-identity; good A/B against Bauhaus tiles.",
    libs: "DOM grid + motion stagger",
    swatch: { bg: "#1f6b4a", a: "#f2a7c3", b: "#1f6b4a", c: "#f2a7c3" },
    Art: MotifGridArt,
  },
  {
    id: "stripe-force",
    label: "Stripe force",
    thesis:
      "Hard diagonal / chevron force fields; Music & Arts purple, Economy gold wipe-print motion.",
    when: "Maximum graphic force; use sparingly so copy still wins.",
    libs: "CSS + motion scaleY wipe",
    swatch: { bg: "#3a1560", a: "#f4efe8", b: "#c4a8ff", c: "#3a1560" },
    Art: StripeForceArt,
  },
  {
    id: "ribbon-drift",
    label: "Ribbon drift",
    thesis:
      "Organic Wrapped ribbon grammar in Scrapped palette; stroke-draw, then slow float. Form from Wrapped; meaning inverted.",
    when: "A/B against slabs when you want organic instead of planar.",
    libs: "SVG + motion pathLength",
    swatch: { bg: "#2a1458", a: "#ff4d8d", b: "#ffc93c", c: "#3de0ff" },
    Art: RibbonDriftArt,
  },
  {
    id: "concentric-bloom",
    label: "Concentric bloom",
    thesis:
      "Radial petal / fan; Rome and Hong Kong city posters. Scale+rotate from center as brand open.",
    when: "Ceremonial opener; softer than stripe force, more iconic than motif grid.",
    libs: "SVG + motion scale/rotate",
    swatch: { bg: "#4a9fd8", a: "#1f6b5a", b: "#f5e6c8", c: "#4a9fd8" },
    Art: ConcentricBloomArt,
  },
  {
    id: "glass-slabs",
    label: "Glass slabs",
    thesis:
      "Soft editorial translucent planes; University / Theology boards. Depth without carnival opacity.",
    when: "Closest to a quiet Scrapped that still has atmospheric art.",
    libs: "CSS perspective + motion",
    swatch: { bg: "#e8f4f6", a: "#5abed2", b: "#ffb4a0", c: "#c8d2ff" },
    Art: GlassSlabsArt,
  },
];

export function directionById(id: DirectionId): DirectionMeta {
  const found = DIRECTIONS.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown art direction: ${id}`);
  return found;
}
