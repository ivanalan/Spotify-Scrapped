"use client";

import { useReducedMotion } from "motion/react";
import { StoryChromeStage } from "@/components/scrapped/art/StoryChromeStage";
import { cn } from "@/lib/utils";
import {
  FunkyShareArt,
  type FunkyShareKind,
} from "./FunkyShapes";
import { CARD_PALETTE } from "./orbitCascade";
import { SlideMock } from "./SlideMocks";

export const SHARE_SHORTLIST: {
  id: FunkyShareKind;
  title: string;
  motion: string;
  bg: string;
  a: string;
  b: string;
  ink: "dark" | "light";
}[] = [
  {
    id: "orb-rain",
    title: "Orb rain frame",
    motion: "Four skewed orbs at corners — cascade then drift",
    bg: CARD_PALETTE.ink.bg,
    ink: CARD_PALETTE.ink.ink,
    a: "#ff4d8d",
    b: "#ffe66d",
  },
  {
    id: "double-stack",
    title: "Double stack bookend",
    motion: "Pill stack top + mirrored bottom",
    bg: CARD_PALETTE.orchid.bg,
    ink: CARD_PALETTE.orchid.ink,
    a: "#ff4d8d",
    b: "#ffe66d",
  },
  {
    id: "big-corner-orb",
    title: "Big corner orb",
    motion: "One loud skewed orb BR — screenshot safe",
    bg: CARD_PALETTE.mango.bg,
    ink: CARD_PALETTE.mango.ink,
    a: "#1B2A6B",
    b: "#ffe66d",
  },
  {
    id: "orb-row",
    title: "Orb row footer",
    motion: "Three orbs cascade under the card",
    bg: CARD_PALETTE.gold.bg,
    ink: CARD_PALETTE.gold.ink,
    a: "#9B4DE8",
    b: "#FF9F1C",
  },
  {
    id: "corner-rain",
    title: "Corner rain",
    motion: "Same rain verb — mango field",
    bg: CARD_PALETTE.mango.bg,
    ink: CARD_PALETTE.mango.ink,
    a: "#1B2A6B",
    b: "#ffe66d",
  },
];

type Props = {
  selected: FunkyShareKind;
  onSelect: (id: FunkyShareKind) => void;
};

/** Shortlist only — your picks for 07/09 peripheral art. */
export function FinaleIdeasGrid({ selected, onSelect }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="space-y-6 border-t border-border pt-12">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Shortlist · slides 07 / 08
        </p>
        <h2 className="max-w-[28ch] font-heading text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-tight text-foreground">
          Your funky picks
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Click a cell to apply it on soft close (08). Corner rain also lands on
          reunion (07). Slide 09 stays blank. Same skew-orb system —{" "}
          <span className="font-mono">hand-skew-orbs.png</span>.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {SHARE_SHORTLIST.map((idea) => {
          const active = selected === idea.id;
          return (
            <button
              key={idea.id}
              type="button"
              onClick={() => onSelect(idea.id)}
              className="space-y-2 text-left"
            >
              <div
                className={cn(
                  "rounded-2xl",
                  active && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
              >
                <StoryChromeStage
                  className="max-w-none w-full"
                  chrome={
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ background: idea.bg }}
                    >
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 360 640"
                        preserveAspectRatio="xMidYMid slice"
                        aria-hidden
                      >
                        <FunkyShareArt
                          kind={idea.id}
                          a={idea.a}
                          b={idea.b}
                          freeze={!!reduce}
                        />
                      </svg>
                    </div>
                  }
                >
                  <SlideMock
                    pattern={idea.id === "corner-rain" ? "reunion" : "close"}
                    slideIndex={idea.id === "corner-rain" ? 7 : 8}
                    ink={
                      idea.ink === "dark" ? "#f5f5f5" : "#1c1c1c"
                    }
                    muted={
                      idea.ink === "dark"
                        ? "rgba(245,245,245,0.9)"
                        : "rgba(28,28,28,0.88)"
                    }
                  />
                </StoryChromeStage>
              </div>
              <div className="px-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {idea.title}
                  {active ? " · live" : ""}
                </p>
                <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">
                  {idea.motion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
