"use client";

import { cn } from "@/lib/utils";
import { OrbitCascadeArt } from "./OrbitCascadeArt";
import { SLIDE_SPECS } from "./orbitCascade";

export type OpeningSlideColors = {
  bg: string;
  ink: "dark" | "light";
  accent: string;
  accent2: string;
};

export type OpeningTrio = {
  id: string;
  title: string;
  note: string;
  /** Slides 00 · 01 · 02 */
  slides: [OpeningSlideColors, OpeningSlideColors, OpeningSlideColors];
};

/** Many opening-trio brainstorms — no white / paper. Click to apply on 00–02. */
export const OPENING_TRIOS: OpeningTrio[] = [
  {
    id: "current",
    title: "Current lock",
    note: "ink → orchid → mango (intro = ink·orchid)",
    slides: [
      { bg: "#12101A", ink: "dark", accent: "#C9A0F5", accent2: "#6B21A8" },
      { bg: "#9B4DE8", ink: "dark", accent: "#ffe66d", accent2: "#ff8c42" },
      { bg: "#FF9F1C", ink: "light", accent: "#1B2A6B", accent2: "#9B4DE8" },
    ],
  },
  {
    id: "teal-rose-gold",
    title: "Teal · rose · gold",
    note: "Cool open → hot middle → warm reveal",
    slides: [
      { bg: "#1A7A6E", ink: "dark", accent: "#ffe66d", accent2: "#ff4d8d" },
      { bg: "#C9185B", ink: "dark", accent: "#ffe66d", accent2: "#1B2A6B" },
      { bg: "#E8B84B", ink: "light", accent: "#5C1A7A", accent2: "#F05A3D" },
    ],
  },
  {
    id: "indigo-magenta-amber",
    title: "Indigo · magenta · amber",
    note: "Deep → loud → sun",
    slides: [
      { bg: "#243B8C", ink: "dark", accent: "#ff4d8d", accent2: "#ffc857" },
      { bg: "#B0125A", ink: "dark", accent: "#ffc857", accent2: "#5ad0ff" },
      { bg: "#F0A202", ink: "light", accent: "#1B2A6B", accent2: "#F05A3D" },
    ],
  },
  {
    id: "cobalt-violet-tangerine",
    title: "Cobalt · violet · tangerine",
    note: "Wrapped-card hard cuts",
    slides: [
      { bg: "#0E3A8A", ink: "dark", accent: "#ff6b9d", accent2: "#ffe66d" },
      { bg: "#6B1FA3", ink: "dark", accent: "#ff8c42", accent2: "#ffe66d" },
      { bg: "#FF6B2C", ink: "light", accent: "#1B2A6B", accent2: "#ffe66d" },
    ],
  },
  {
    id: "forest-wine-saffron",
    title: "Forest · wine · saffron",
    note: "Earthy anti-neon",
    slides: [
      { bg: "#1F4D3A", ink: "dark", accent: "#E8B84B", accent2: "#F05A3D" },
      { bg: "#6E1530", ink: "dark", accent: "#E8B84B", accent2: "#ff8c9a" },
      { bg: "#D4A017", ink: "light", accent: "#1F4D3A", accent2: "#6E1530" },
    ],
  },
  {
    id: "midnight-electric-lime",
    title: "Midnight · electric · lime",
    note: "Dark open, punch mid, acid #1",
    slides: [
      { bg: "#0B1638", ink: "dark", accent: "#5ad0ff", accent2: "#ff4d8d" },
      { bg: "#2F5BFF", ink: "dark", accent: "#ffe66d", accent2: "#ff4d8d" },
      { bg: "#B8E63B", ink: "light", accent: "#0B1638", accent2: "#2F5BFF" },
    ],
  },
  {
    id: "plum-coral-navy",
    title: "Plum · coral · navy",
    note: "Reorder the lock",
    slides: [
      { bg: "#5C1A7A", ink: "dark", accent: "#ff4d8d", accent2: "#ffe66d" },
      { bg: "#F05A3D", ink: "light", accent: "#1B2A6B", accent2: "#ffe66d" },
      { bg: "#1B2A6B", ink: "dark", accent: "#ff4d8d", accent2: "#ffe66d" },
    ],
  },
  {
    id: "rose-gold-teal",
    title: "Rose · gold · teal",
    note: "Warm pair then cool #1",
    slides: [
      { bg: "#C9185B", ink: "dark", accent: "#ffe66d", accent2: "#1B2A6B" },
      { bg: "#E8B84B", ink: "light", accent: "#5C1A7A", accent2: "#F05A3D" },
      { bg: "#1A7A6E", ink: "dark", accent: "#ffe66d", accent2: "#ff4d8d" },
    ],
  },
  {
    id: "ink-berry-peach",
    title: "Ink · berry · peach",
    note: "Near-black open (still not white)",
    slides: [
      { bg: "#1A1423", ink: "dark", accent: "#ff4d8d", accent2: "#ffe66d" },
      { bg: "#8B1E4A", ink: "dark", accent: "#ffc4a8", accent2: "#ffe66d" },
      { bg: "#F4A261", ink: "light", accent: "#1A1423", accent2: "#8B1E4A" },
    ],
  },
  {
    id: "azure-orchid-mango",
    title: "Azure · orchid · mango",
    note: "Alt open — azure field (intro lock is ink·orchid)",
    slides: [
      { bg: "#1E6FBA", ink: "dark", accent: "#FF6BCB", accent2: "#A855F7" },
      { bg: "#9B4DE8", ink: "dark", accent: "#ffe66d", accent2: "#ff8c42" },
      { bg: "#FF9F1C", ink: "light", accent: "#1B2A6B", accent2: "#9B4DE8" },
    ],
  },
  {
    id: "slate-crimson-butter",
    title: "Slate · crimson · butter",
    note: "Quiet → alarm → soft reveal",
    slides: [
      { bg: "#2C3E5A", ink: "dark", accent: "#ff6b9d", accent2: "#E8B84B" },
      { bg: "#C1121F", ink: "dark", accent: "#E8B84B", accent2: "#ffe6e6" },
      { bg: "#F2C94C", ink: "light", accent: "#2C3E5A", accent2: "#C1121F" },
    ],
  },
  {
    id: "ultramarine-fuchsia-chartreuse",
    title: "Ultramarine · fuchsia · chartreuse",
    note: "High-contrast Wrapped energy",
    slides: [
      { bg: "#1A1AFF", ink: "dark", accent: "#ff4d8d", accent2: "#d4ff4d" },
      { bg: "#E6007A", ink: "dark", accent: "#d4ff4d", accent2: "#1A1AFF" },
      { bg: "#C6FF3D", ink: "light", accent: "#1A1AFF", accent2: "#E6007A" },
    ],
  },
  {
    id: "pine-terracotta-cream-no",
    title: "Pine · terracotta · clay",
    note: "Muted craft — still solid fields",
    slides: [
      { bg: "#234E3A", ink: "dark", accent: "#E07A5F", accent2: "#F2CC8F" },
      { bg: "#C45C26", ink: "light", accent: "#1B2A6B", accent2: "#F2CC8F" },
      { bg: "#A67C52", ink: "light", accent: "#234E3A", accent2: "#C45C26" },
    ],
  },
  {
    id: "royal-hotpink-lemon",
    title: "Royal · hot pink · lemon",
    note: "Party without the ribbons",
    slides: [
      { bg: "#2A1A8C", ink: "dark", accent: "#ff2d95", accent2: "#fff15c" },
      { bg: "#FF2D95", ink: "dark", accent: "#fff15c", accent2: "#2A1A8C" },
      { bg: "#FFF15C", ink: "light", accent: "#2A1A8C", accent2: "#FF2D95" },
    ],
  },
  {
    id: "sea-grape-sunset",
    title: "Sea · grape · sunset",
    note: "Cool→warm ladder",
    slides: [
      { bg: "#0D5C63", ink: "dark", accent: "#E8B84B", accent2: "#F05A3D" },
      { bg: "#4A1942", ink: "dark", accent: "#F05A3D", accent2: "#E8B84B" },
      { bg: "#E36414", ink: "light", accent: "#0D5C63", accent2: "#4A1942" },
    ],
  },
  {
    id: "denim-punch-banana",
    title: "Denim · punch · banana",
    note: "Workwear carnival",
    slides: [
      { bg: "#2B4C7E", ink: "dark", accent: "#E63946", accent2: "#F4D35E" },
      { bg: "#E63946", ink: "dark", accent: "#F4D35E", accent2: "#2B4C7E" },
      { bg: "#F4D35E", ink: "light", accent: "#2B4C7E", accent2: "#E63946" },
    ],
  },
  {
    id: "eggplant-persimmon-sky",
    title: "Eggplant · persimmon · sky",
    note: "Unexpected #1 cool-down",
    slides: [
      { bg: "#3D1A4A", ink: "dark", accent: "#F05A3D", accent2: "#5ad0ff" },
      { bg: "#E85D04", ink: "light", accent: "#3D1A4A", accent2: "#5ad0ff" },
      { bg: "#4CC9F0", ink: "light", accent: "#3D1A4A", accent2: "#E85D04" },
    ],
  },
  {
    id: "charcoal-volt-coral",
    title: "Charcoal · volt · coral",
    note: "Dark stage, neon accent without glow",
    slides: [
      { bg: "#222222", ink: "dark", accent: "#CCFF00", accent2: "#F05A3D" },
      { bg: "#A8E10C", ink: "light", accent: "#222222", accent2: "#F05A3D" },
      { bg: "#F05A3D", ink: "light", accent: "#222222", accent2: "#CCFF00" },
    ],
  },
];

type Props = {
  selected: string;
  onSelect: (id: string) => void;
};

export function OpeningPaletteBrainstorm({ selected, onSelect }: Props) {
  return (
    <section className="space-y-6 border-t border-border pt-12">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Brainstorm · slides 00 / 01 / 02
        </p>
        <h2 className="max-w-[32ch] font-heading text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-tight text-foreground">
          Opening trio palettes
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Click a row to apply backgrounds + accents on the first three slides.
          Solid fields only — no white / cream / mist. Live deck strip updates
          immediately.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {OPENING_TRIOS.map((trio) => {
          const active = selected === trio.id;
          return (
            <button
              key={trio.id}
              type="button"
              onClick={() => onSelect(trio.id)}
              className={cn(
                "space-y-3 rounded-2xl border p-3 text-left transition-colors",
                active
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <div className="flex gap-2">
                {trio.slides.map((s, i) => {
                  const base = SLIDE_SPECS[i]!;
                  return (
                    <div
                      key={trio.id + i}
                      className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative aspect-[9/16] w-full">
                        <OrbitCascadeArt
                          slideIndex={i}
                          pattern={base.pattern}
                          static
                          paletteOverride={s}
                        />
                        <span className="absolute bottom-1 left-1 font-mono text-[0.55rem] text-white/80 drop-shadow">
                          {String(i).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start justify-between gap-2 px-0.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {trio.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {trio.note}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 pt-0.5">
                  {trio.slides.map((s, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-sm border border-border"
                      style={{ background: s.bg }}
                      title={s.bg}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function openingOverrideFor(
  trioId: string,
  slideIndex: number,
): OpeningSlideColors | undefined {
  if (slideIndex > 2) return undefined;
  const trio = OPENING_TRIOS.find((t) => t.id === trioId) ?? OPENING_TRIOS[0];
  return trio?.slides[slideIndex as 0 | 1 | 2];
}
