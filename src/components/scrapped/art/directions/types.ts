import type { ComponentType } from "react";

export type ArtSurface = "overview" | "story" | "share";

export type DirectionArtProps = {
  surface: ArtSurface;
};

export type DirectionId =
  | "pixel-field"
  | "perspective-slabs"
  | "bauhaus-construct"
  | "rough-sketch"
  | "soft-curves"
  | "motif-grid"
  | "stripe-force"
  | "ribbon-drift"
  | "concentric-bloom"
  | "glass-slabs";

export type DirectionMeta = {
  id: DirectionId;
  label: string;
  thesis: string;
  when: string;
  libs: string;
  /** Mood-board thumbnail swatches */
  swatch: { bg: string; a: string; b: string; c: string };
  Art: ComponentType<DirectionArtProps>;
};

export function isOverview(surface: ArtSurface) {
  return surface === "overview";
}

/** Paper plate inset — quieter surfaces leave more room for copy. */
export function contentInset(surface: ArtSurface) {
  if (surface === "overview") return "12%";
  if (surface === "story") return "9%";
  return "13%";
}
