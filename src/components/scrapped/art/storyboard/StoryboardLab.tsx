"use client";

import { useState } from "react";
import Link from "next/link";
import { StoryChromeStage } from "@/components/scrapped/art/StoryChromeStage";
import { cn } from "@/lib/utils";
import { FinaleIdeasGrid, SHARE_SHORTLIST } from "./FinaleIdeas";
import {
  OpeningPaletteBrainstorm,
  openingOverrideFor,
} from "./OpeningPaletteBrainstorm";
import {
  IntroSchemeBrainstorm,
  introSchemeById,
} from "./IntroSchemeBrainstorm";
import { OrbitCascadeArt } from "./OrbitCascadeArt";
import { CARD_PALETTE, ORBIT_CASCADE, SLIDE_SPECS } from "./orbitCascade";
import { SlideMock } from "./SlideMocks";
import type { FunkyShareKind } from "./FunkyShapes";

export function StoryboardLab() {
  const [active, setActive] = useState(0);
  const [shareKind, setShareKind] =
    useState<FunkyShareKind>("double-stack");
  const [openingTrio, setOpeningTrio] = useState("current");
  const [introSchemeId, setIntroSchemeId] = useState("ink-orchid");
  const introScheme = introSchemeById(introSchemeId);
  const baseSpec = SLIDE_SPECS[active] ?? SLIDE_SPECS[0];
  const opening = openingOverrideFor(openingTrio, active);
  // Intro scheme wins on slide 00 (bg + disk ladder); trio still owns 01–02.
  const slide0Override =
    active === 0 && introScheme
      ? {
          bg: introScheme.bg,
          ink: introScheme.ink,
          accent: introScheme.disks[0],
          accent2: introScheme.disks[5],
          diskColors: [...introScheme.disks],
        }
      : undefined;
  const merged = slide0Override ?? opening;
  const spec = merged
    ? {
        ...baseSpec,
        bg: merged.bg,
        ink: merged.ink,
        accent: merged.accent,
        accent2: merged.accent2,
      }
    : baseSpec;
  const paletteOverride = merged
    ? {
        bg: merged.bg,
        accent: merged.accent,
        accent2: merged.accent2,
        diskColors:
          "diskColors" in merged && Array.isArray(merged.diskColors)
            ? (merged.diskColors as string[])
            : undefined,
      }
    : undefined;
  const sharePalette =
    SHARE_SHORTLIST.find((s) => s.id === shareKind) ?? SHARE_SHORTLIST[0];
  const inkMode =
    (spec.pattern === "close" || spec.pattern === "reunion") && sharePalette
      ? sharePalette.ink
      : spec.ink;
  const ink =
    inkMode === "dark" ? ORBIT_CASCADE.inkDark : ORBIT_CASCADE.inkLight;
  const muted =
    inkMode === "dark"
      ? "rgba(245,245,245,0.9)"
      : "rgba(28,28,28,0.88)";

  function pickShare(id: FunkyShareKind) {
    setShareKind(id);
    setActive(id === "corner-rain" ? 7 : 8);
  }

  function pickOpening(id: string) {
    setOpeningTrio(id);
    if (active > 2) setActive(0);
  }

  function pickIntro(id: string) {
    setIntroSchemeId(id);
    setActive(0);
  }

  function overrideForSlide(index: number) {
    if (index === 0 && introScheme) {
      return {
        bg: introScheme.bg,
        accent: introScheme.disks[0],
        accent2: introScheme.disks[5],
        diskColors: [...introScheme.disks],
      };
    }
    return openingOverrideFor(openingTrio, index);
  }

  return (
    <div className="space-y-12">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">
          Scrapped · Art storyboard · research only
        </p>
        <h1 className="max-w-[24ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          {ORBIT_CASCADE.label}
        </h1>
        <p className="max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
          {ORBIT_CASCADE.thesis}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped/art"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Ten directions lab
          </Link>
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Scrapped
          </Link>
        </div>
      </header>

      <section className="grid gap-6 rounded-2xl border border-border bg-card/40 p-5 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Card palette · 6 swatches · no white
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.values(CARD_PALETTE).map((sw) => (
              <div key={sw.label} className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-md border border-border shadow-sm"
                  style={{ background: sw.bg }}
                  title={sw.bg}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {sw.label}
                  <br />
                  {sw.bg}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Atoms
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {ORBIT_CASCADE.atoms.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Verbs
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {ORBIT_CASCADE.verbs.map((v) => (
              <li key={v}>· {v}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Reject
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {ORBIT_CASCADE.reject.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground lg:col-span-3">
          <span className="font-semibold text-foreground">Wrapped borrow: </span>
          {ORBIT_CASCADE.wrappedBorrow}
        </p>
      </section>

      {/* Deck strip picker */}
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Deck · click a slide to deepen
        </p>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {SLIDE_SPECS.map((s) => (
            <button
              key={s.index}
              type="button"
              onClick={() => setActive(s.index)}
              className={cn(
                "w-[7.25rem] shrink-0 text-left transition-opacity",
                active === s.index ? "opacity-100" : "opacity-70 hover:opacity-100",
              )}
            >
              <div
                className={cn(
                  "relative aspect-[9/16] overflow-hidden rounded-lg border",
                  active === s.index
                    ? "border-foreground ring-2 ring-foreground/25"
                    : "border-border",
                )}
              >
                <OrbitCascadeArt
                  slideIndex={s.index}
                  pattern={s.pattern}
                  static
                  shareKind={shareKind}
                  funkyPalette={sharePalette}
                  paletteOverride={overrideForSlide(s.index)}
                />
              </div>
              <p className="mt-1.5 font-mono text-[0.65rem] text-muted-foreground">
                {String(s.index).padStart(2, "0")}
              </p>
              <p className="truncate text-xs font-semibold text-foreground">
                {s.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Deep dive */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
        <div className="mx-auto w-full max-w-[320px] lg:mx-0">
          <StoryChromeStage
            chrome={
              <OrbitCascadeArt
                slideIndex={spec.index}
                pattern={spec.pattern}
                shareKind={shareKind}
                funkyPalette={sharePalette}
                paletteOverride={paletteOverride}
              />
            }
          >
            <SlideMock
              pattern={spec.pattern}
              slideIndex={spec.index}
              ink={ink}
              muted={muted}
            />
          </StoryChromeStage>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Slide {String(spec.index).padStart(2, "0")} · {spec.pattern}
            </p>
            <h2 className="mt-1 font-heading text-2xl tracking-tight text-foreground">
              {spec.label}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{spec.bg}</span>
              {" · "}
              ink {spec.ink}
            </p>
          </div>

          <SpecBlock title="Hero" body={spec.hero} />
          <SpecBlock title="Motion" body={spec.motion} />
          <SpecBlock title="Composition" body={spec.composition} />
          <SpecBlock title="Why this" body={spec.why} />

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Iterate before shipping
            </p>
            <ul className="mt-3 space-y-2">
              {spec.iterations.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm leading-relaxed text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={active === 0}
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={active === SLIDE_SPECS.length - 1}
              onClick={() =>
                setActive((i) => Math.min(SLIDE_SPECS.length - 1, i + 1))
              }
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* Full journey table */}
      <section className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Color + verb journey
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-3 font-mono font-medium">#</th>
                <th className="px-2 py-2 font-medium">Slide</th>
                <th className="px-2 py-2 font-medium">Bg</th>
                <th className="px-2 py-2 font-medium">Hero verb</th>
              </tr>
            </thead>
            <tbody>
              {SLIDE_SPECS.map((s) => {
                const bg = overrideForSlide(s.index)?.bg ?? s.bg;
                return (
                <tr
                  key={s.index}
                  className={cn(
                    "cursor-pointer border-b border-border/60",
                    active === s.index && "bg-foreground/5",
                  )}
                  onClick={() => setActive(s.index)}
                >
                  <td className="py-3 pr-3 font-mono text-muted-foreground">
                    {String(s.index).padStart(2, "0")}
                  </td>
                  <td className="px-2 py-3 font-semibold text-foreground">
                    {s.label}
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-2 font-mono text-xs">
                      <span
                        className="inline-block h-3 w-3 rounded-sm border border-border"
                        style={{ background: bg }}
                      />
                      {bg}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{s.hero}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <FinaleIdeasGrid selected={shareKind} onSelect={pickShare} />

      <IntroSchemeBrainstorm
        selected={introSchemeId}
        onSelect={pickIntro}
      />

      <OpeningPaletteBrainstorm
        selected={openingTrio}
        onSelect={pickOpening}
      />
    </div>
  );
}

function SpecBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
