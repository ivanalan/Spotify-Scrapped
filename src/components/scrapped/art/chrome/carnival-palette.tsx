/** Fixed carnival palette for art-lab chrome (not album-driven). */
export const CARNIVAL = {
  void: "#12081f",
  deep: "#1a0b3d",
  purple: "#2a1458",
  magenta: "#ff4d8d",
  orange: "#ff6b3d",
  yellow: "#ffe66d",
  gold: "#ffc93c",
  cyan: "#3de0ff",
  lime: "#7cff6b",
  violet: "#b44dff",
  ink: "#1c1c1c",
  card: "rgba(255,255,255,0.92)",
} as const;

export const PIXEL_COLORS = [
  CARNIVAL.yellow,
  CARNIVAL.cyan,
  CARNIVAL.magenta,
  CARNIVAL.violet,
  CARNIVAL.lime,
  CARNIVAL.orange,
] as const;

export function ContentCard({ inset = "13%" }: { inset?: string }) {
  return (
    <div
      className="absolute rounded-xl bg-white/92 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
      style={{ inset }}
    />
  );
}
