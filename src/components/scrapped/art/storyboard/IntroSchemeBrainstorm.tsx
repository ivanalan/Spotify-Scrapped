"use client";

import { cn } from "@/lib/utils";
import { OrbitCascadeArt } from "./OrbitCascadeArt";

export type IntroScheme = {
  id: string;
  title: string;
  note: string;
  bg: string;
  ink: "dark" | "light";
  disks: [string, string, string, string, string, string];
};

/** 40 intro brainstorms: bg field + short concentric ladder. No white paper. */
export const INTRO_SCHEMES: IntroScheme[] = [
  {
    id: "azure-magenta",
    title: "Azure · magenta",
    note: "Current lock",
    bg: "#1E6FBA",
    ink: "dark",
    disks: ["#FF6BCB", "#F54DB8", "#E83DA8", "#D946EF", "#C026D3", "#A855F7"],
  },
  {
    id: "azure-mango",
    title: "Azure · mango",
    note: "Cool field / warm rings",
    bg: "#1E6FBA",
    ink: "dark",
    disks: ["#FFE66D", "#FFD24A", "#FFC033", "#FFB01F", "#FF9F1C", "#F08A0E"],
  },
  {
    id: "azure-coral",
    title: "Azure · coral",
    note: "Classic card cut",
    bg: "#1E6FBA",
    ink: "dark",
    disks: ["#FF8A6B", "#FF7352", "#FF5C3A", "#F05A3D", "#E04A30", "#C83A24"],
  },
  {
    id: "azure-lime",
    title: "Azure · lime",
    note: "Acid punch",
    bg: "#1E6FBA",
    ink: "dark",
    disks: ["#E8FF5A", "#D4FF3D", "#C6FF3D", "#B8E63B", "#A8D62E", "#96C41F"],
  },
  {
    id: "orchid-gold",
    title: "Orchid · gold",
    note: "Middle-slide field as open",
    bg: "#9B4DE8",
    ink: "dark",
    disks: ["#FFE66D", "#FFD24A", "#FFC033", "#FFB01F", "#E8B84B", "#D4A017"],
  },
  {
    id: "orchid-cyan",
    title: "Orchid · cyan",
    note: "Electric cool rings",
    bg: "#9B4DE8",
    ink: "dark",
    disks: ["#7DF9FF", "#5AE8F5", "#3DD6EA", "#2BC4DE", "#1AB0CC", "#0E9AB8"],
  },
  {
    id: "orchid-mango",
    title: "Orchid · mango",
    note: "Purple stage / citrus stack",
    bg: "#9B4DE8",
    ink: "dark",
    disks: ["#FFCF70", "#FFB84A", "#FF9F1C", "#FF8C0A", "#F07A00", "#D96A00"],
  },
  {
    id: "mango-navy",
    title: "Mango · navy",
    note: "Bright field / deep rings",
    bg: "#FF9F1C",
    ink: "light",
    disks: ["#2A3A8C", "#243B8C", "#1E6FBA", "#1B5AA0", "#164A88", "#123A70"],
  },
  {
    id: "mango-orchid",
    title: "Mango · orchid",
    note: "Warm field / purple stack",
    bg: "#FF9F1C",
    ink: "light",
    disks: ["#C9A0F5", "#B87AED", "#A862E8", "#9B4DE8", "#8A3CD6", "#7A2EC4"],
  },
  {
    id: "mango-rose",
    title: "Mango · rose",
    note: "All-warm carnival",
    bg: "#FF9F1C",
    ink: "light",
    disks: ["#FF6BCB", "#F54DB8", "#E83DA8", "#D9187A", "#C9185B", "#B0124A"],
  },
  {
    id: "navy-hotpink",
    title: "Navy · hot pink",
    note: "Wrapped night open",
    bg: "#0E3A8A",
    ink: "dark",
    disks: ["#FF4D9A", "#FF2D95", "#F01A88", "#E6007A", "#D0006C", "#B8005E"],
  },
  {
    id: "navy-lemon",
    title: "Navy · lemon",
    note: "Deep / sun",
    bg: "#0E3A8A",
    ink: "dark",
    disks: ["#FFF15C", "#FFE66D", "#FFD83A", "#FFCC00", "#F0B800", "#D9A400"],
  },
  {
    id: "cobalt-tangerine",
    title: "Cobalt · tangerine",
    note: "Hard cut pair",
    bg: "#1A4DFF",
    ink: "dark",
    disks: ["#FF9F1C", "#FF8C0A", "#FF7A00", "#F06A00", "#E05A00", "#C84A00"],
  },
  {
    id: "cobalt-fuchsia",
    title: "Cobalt · fuchsia",
    note: "Double loud",
    bg: "#1A4DFF",
    ink: "dark",
    disks: ["#FF5AC8", "#FF3DB8", "#F02AA8", "#E6009A", "#D00088", "#B80078"],
  },
  {
    id: "teal-mango",
    title: "Teal · mango",
    note: "Sea / citrus",
    bg: "#1A7A6E",
    ink: "dark",
    disks: ["#FFE66D", "#FFD24A", "#FFC033", "#FF9F1C", "#F08A0E", "#D97800"],
  },
  {
    id: "teal-coral",
    title: "Teal · coral",
    note: "Cool / warm tug",
    bg: "#1A7A6E",
    ink: "dark",
    disks: ["#FF8A6B", "#FF7352", "#F05A3D", "#E04A30", "#C83A24", "#B02E1C"],
  },
  {
    id: "teal-pink",
    title: "Teal · pink",
    note: "Spa carnival",
    bg: "#0D5C63",
    ink: "dark",
    disks: ["#FF8CC8", "#FF6BCB", "#F54DB8", "#E83DA8", "#D42E98", "#C01E88"],
  },
  {
    id: "rose-gold",
    title: "Rose · gold",
    note: "Hot stage",
    bg: "#C9185B",
    ink: "dark",
    disks: ["#FFE66D", "#FFD24A", "#FFC033", "#E8B84B", "#D4A017", "#C09010"],
  },
  {
    id: "rose-azure",
    title: "Rose · azure",
    note: "Invert the open",
    bg: "#C9185B",
    ink: "dark",
    disks: ["#7EB8F0", "#5A9FE0", "#3A8AD4", "#1E6FBA", "#1860A8", "#145292"],
  },
  {
    id: "rose-lime",
    title: "Rose · lime",
    note: "Clash energy",
    bg: "#C9185B",
    ink: "dark",
    disks: ["#E8FF5A", "#D4FF3D", "#C6FF3D", "#B8E63B", "#A8D62E", "#90C01A"],
  },
  {
    id: "ink-volt",
    title: "Ink · volt",
    note: "Near-black / acid",
    bg: "#1A1423",
    ink: "dark",
    disks: ["#D4FF3D", "#C6FF3D", "#B8E63B", "#A8E10C", "#96CC00", "#82B000"],
  },
  {
    id: "ink-coral",
    title: "Ink · coral",
    note: "Dark room spotlight",
    bg: "#1A1423",
    ink: "dark",
    disks: ["#FF8A6B", "#FF7352", "#F05A3D", "#E04A30", "#C83A24", "#A82E1C"],
  },
  {
    id: "ink-orchid",
    title: "Ink · orchid",
    note: "Locked intro",
    bg: "#12101A",
    ink: "dark",
    disks: ["#C9A0F5", "#B87AED", "#A862E8", "#9B4DE8", "#8A3CD6", "#6B21A8"],
  },
  {
    id: "ultramarine-chartreuse",
    title: "Ultramarine · chartreuse",
    note: "Max Wrapped punch",
    bg: "#1A1AFF",
    ink: "dark",
    disks: ["#D4FF3D", "#C6FF3D", "#B8FF2A", "#A8E10C", "#96CC00", "#7AB000"],
  },
  {
    id: "ultramarine-hot",
    title: "Ultramarine · hot",
    note: "Blue / magenta stack",
    bg: "#1A1AFF",
    ink: "dark",
    disks: ["#FF4D9A", "#FF2D95", "#F01A88", "#E6007A", "#D0006C", "#B8005E"],
  },
  {
    id: "forest-saffron",
    title: "Forest · saffron",
    note: "Earthy still loud",
    bg: "#1F4D3A",
    ink: "dark",
    disks: ["#FFCF70", "#FFB84A", "#E8B84B", "#D4A017", "#C09010", "#A8780C"],
  },
  {
    id: "forest-coral",
    title: "Forest · coral",
    note: "Craft carnival",
    bg: "#234E3A",
    ink: "dark",
    disks: ["#FF8A6B", "#E07A5F", "#F05A3D", "#E04A30", "#C45C26", "#A8481C"],
  },
  {
    id: "wine-butter",
    title: "Wine · butter",
    note: "Deep red / soft gold",
    bg: "#6E1530",
    ink: "dark",
    disks: ["#FFE6A0", "#FFE66D", "#FFD24A", "#E8B84B", "#D4A017", "#B88810"],
  },
  {
    id: "wine-sky",
    title: "Wine · sky",
    note: "Unexpected cool rings",
    bg: "#6E1530",
    ink: "dark",
    disks: ["#7DF0FF", "#5AD0FF", "#3AB8F0", "#2A9FD8", "#1A88C0", "#1070A8"],
  },
  {
    id: "persimmon-navy",
    title: "Persimmon · navy",
    note: "Sunset open",
    bg: "#E85D04",
    ink: "light",
    disks: ["#1B2A6B", "#1E3A8A", "#243B8C", "#1E6FBA", "#1860A8", "#0E3A8A"],
  },
  {
    id: "persimmon-orchid",
    title: "Persimmon · orchid",
    note: "Warm / purple",
    bg: "#E85D04",
    ink: "light",
    disks: ["#C9A0F5", "#B87AED", "#9B4DE8", "#8A3CD6", "#7A2EC4", "#6B21A8"],
  },
  {
    id: "sky-magenta",
    title: "Sky · magenta",
    note: "Light cool / hot stack",
    bg: "#4CC9F0",
    ink: "light",
    disks: ["#FF6BCB", "#F54DB8", "#E83DA8", "#D9187A", "#C9185B", "#A01248"],
  },
  {
    id: "sky-navy",
    title: "Sky · navy",
    note: "Soft field / deep rings",
    bg: "#4CC9F0",
    ink: "light",
    disks: ["#1B2A6B", "#1E3A8A", "#243B8C", "#0E3A8A", "#0A2E70", "#082458"],
  },
  {
    id: "lemon-orchid",
    title: "Lemon · orchid",
    note: "Sun stage",
    bg: "#FFF15C",
    ink: "light",
    disks: ["#C9A0F5", "#B87AED", "#9B4DE8", "#8A3CD6", "#7A2EC4", "#5C1A7A"],
  },
  {
    id: "lemon-navy",
    title: "Lemon · navy",
    note: "High-key open",
    bg: "#FFF15C",
    ink: "light",
    disks: ["#1B2A6B", "#1E3A8A", "#243B8C", "#1A4DFF", "#0E3A8A", "#0A2E70"],
  },
  {
    id: "denim-punch",
    title: "Denim · punch",
    note: "Workwear carnival",
    bg: "#2B4C7E",
    ink: "dark",
    disks: ["#FF6B7A", "#E63946", "#D62839", "#C1121F", "#A80E18", "#900C14"],
  },
  {
    id: "denim-banana",
    title: "Denim · banana",
    note: "Blue jean / fruit",
    bg: "#2B4C7E",
    ink: "dark",
    disks: ["#FFE66D", "#F4D35E", "#E8B84B", "#D4A017", "#C09010", "#A8780C"],
  },
  {
    id: "eggplant-mango",
    title: "Eggplant · mango",
    note: "Deep purple / citrus",
    bg: "#3D1A4A",
    ink: "dark",
    disks: ["#FFCF70", "#FFB84A", "#FF9F1C", "#FF8C0A", "#F07A00", "#D96A00"],
  },
  {
    id: "eggplant-cyan",
    title: "Eggplant · cyan",
    note: "Royal cool",
    bg: "#3D1A4A",
    ink: "dark",
    disks: ["#7DF9FF", "#5AE8F5", "#3DD6EA", "#2BC4DE", "#1AB0CC", "#0E9AB8"],
  },
  {
    id: "volt-ink",
    title: "Volt · ink",
    note: "Invert; acid field",
    bg: "#A8E10C",
    ink: "light",
    disks: ["#1A1423", "#222222", "#2A1A3A", "#3D1A4A", "#1B2A6B", "#12101A"],
  },
];

type Props = {
  selected: string;
  onSelect: (id: string) => void;
};

export function IntroSchemeBrainstorm({ selected, onSelect }: Props) {
  return (
    <section className="space-y-6 border-t border-border pt-12">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Brainstorm · slide 00 · 40 schemes
        </p>
        <h2 className="max-w-[32ch] font-heading text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-tight text-foreground">
          Intro bg + circles
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each cell is a background field plus a short concentric ladder. Click to
          apply on slide 00. Solid colors only: no white paper.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {INTRO_SCHEMES.map((scheme) => {
          const active = selected === scheme.id;
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => onSelect(scheme.id)}
              className={cn(
                "space-y-2 rounded-xl border p-2 text-left transition-colors",
                active
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-border">
                <OrbitCascadeArt
                  slideIndex={0}
                  pattern="intro"
                  static
                  paletteOverride={{
                    bg: scheme.bg,
                    accent: scheme.disks[0],
                    accent2: scheme.disks[5],
                    diskColors: scheme.disks,
                  }}
                />
              </div>
              <div className="flex items-center gap-1 px-0.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm border border-border"
                  style={{ background: scheme.bg }}
                />
                <div className="flex min-w-0 flex-1 gap-0.5 overflow-hidden">
                  {scheme.disks.map((c, i) => (
                    <span
                      key={i}
                      className="h-2.5 min-w-0 flex-1 rounded-[1px]"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="px-0.5">
                <p className="truncate text-xs font-semibold text-foreground">
                  {scheme.title}
                </p>
                <p className="truncate text-[0.65rem] text-muted-foreground">
                  {scheme.note}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function introSchemeById(id: string): IntroScheme | undefined {
  return INTRO_SCHEMES.find((s) => s.id === id);
}
