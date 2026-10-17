"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { StoryChromeStage } from "@/components/scrapped/art/StoryChromeStage";
import {
  DIRECTIONS,
  directionById,
  type ArtSurface,
  type DirectionId,
} from "@/components/scrapped/art/directions/registry";
import { cn } from "@/lib/utils";

const SURFACES: { id: ArtSurface; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "story", label: "Story" },
  { id: "share", label: "Share" },
];

function OverviewMock() {
  return (
    <div className="flex h-full flex-col px-5 py-7 text-left text-[#1c1c1c]">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-display">2026</p>
        <h1 className="text-display mt-1 italic">Scrapped</h1>
        <p className="text-body mt-5 max-w-[14rem]">
          Scrapped is your <span className="italic">anti-wrapped</span>. Songs
          you hated and artists you skipped.
        </p>
        <div className="mt-8 inline-flex h-11 max-w-[12rem] items-center justify-center rounded-2xl bg-[#1c1c1c] px-6 text-sm font-semibold text-white">
          Continue
        </div>
        <p className="text-caption mt-3 text-[#6b6b6b]">
          Signed in to Spotify as You
        </p>
      </div>
      <p className="text-caption pb-2 text-[#6b6b6b]">Created by Alan Matias</p>
    </div>
  );
}

function StoryMock() {
  const rows = [
    { n: "1", title: "Never again", artist: "Shelf artist" },
    { n: "2", title: "One-play wonder", artist: "Almost stuck" },
    { n: "3", title: "Fwd in 12s", artist: "Skip streak" },
  ];
  return (
    <div className="flex h-full flex-col px-5 py-7 text-left text-[#1c1c1c]">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]">
        Affinity dip
      </p>
      <h2 className="mt-2 font-sans text-[1.35rem] font-extrabold leading-tight tracking-tight">
        These almost made your tops
      </h2>
      <ul className="mt-6 flex-1 space-y-3">
        {rows.map((r) => (
          <li
            key={r.n}
            className="flex items-baseline gap-3 border-b border-black/10 pb-3"
          >
            <span className="w-4 font-mono text-sm tabular-nums text-[#6b6b6b]">
              {r.n}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-sans text-base font-bold">
                {r.title}
              </span>
              <span className="block truncate text-sm text-[#6b6b6b]">
                {r.artist}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShareMock() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center text-[#1c1c1c]">
      <div className="w-full max-w-[14rem] rounded-xl border border-black/10 bg-[#f6f4ef] px-4 py-5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#6b6b6b]">
          Scrapped · 2026
        </p>
        <p className="mt-3 font-sans text-lg font-extrabold leading-snug tracking-tight">
          You skipped more than you saved
        </p>
        <p className="mt-2 text-sm text-[#6b6b6b]">Anti-wrapped, on purpose.</p>
      </div>
      <div className="mt-6 inline-flex h-10 items-center rounded-2xl bg-[#1c1c1c] px-6 text-sm font-semibold text-white">
        Share this story
      </div>
    </div>
  );
}

function contentFor(id: ArtSurface): ReactNode {
  switch (id) {
    case "overview":
      return <OverviewMock />;
    case "story":
      return <StoryMock />;
    case "share":
      return <ShareMock />;
  }
}

function DirectionThumb({
  swatch,
  active,
}: {
  swatch: { bg: string; a: string; b: string; c: string };
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-lg border",
        active ? "border-foreground ring-2 ring-foreground/30" : "border-border",
      )}
      style={{ background: swatch.bg }}
    >
      <div
        className="absolute left-[-10%] top-[12%] h-[28%] w-[70%] rotate-[-18deg] rounded-md opacity-90"
        style={{ background: swatch.a }}
      />
      <div
        className="absolute right-[-8%] top-[38%] h-[22%] w-[55%] rotate-[12deg] rounded-md opacity-85"
        style={{ background: swatch.b }}
      />
      <div
        className="absolute bottom-[10%] left-[15%] h-[18%] w-[60%] rotate-[-6deg] rounded-full opacity-80"
        style={{ background: swatch.c }}
      />
    </div>
  );
}

export function ArtMotionLab() {
  const [direction, setDirection] = useState<DirectionId>("perspective-slabs");
  const [surface, setSurface] = useState<ArtSurface>("overview");
  const meta = directionById(direction);
  const Art = meta.Art;

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">Scrapped · Art direction lab</p>
        <h1 className="max-w-[20ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Ten directions
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Research surface — click a direction, then preview Overview (looping
          load-in), Story, and Share. Live{" "}
          <span className="font-mono">/scrapped</span> stays text-first until
          you promote one.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Scrapped
          </Link>
          <Link
            href="/scrapped/art/list"
            className="text-foreground underline-offset-2 hover:underline"
          >
            List motion →
          </Link>
          <Link
            href="/scrapped/lab"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Metrics Lab →
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Directions
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DIRECTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDirection(d.id)}
              className={cn(
                "group text-left transition-opacity",
                direction === d.id ? "opacity-100" : "opacity-80 hover:opacity-100",
              )}
            >
              <DirectionThumb
                swatch={d.swatch}
                active={direction === d.id}
              />
              <p className="mt-2 font-sans text-sm font-semibold text-foreground">
                {d.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SURFACES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSurface(s.id)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  surface === s.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/40",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center lg:justify-start">
            <StoryChromeStage chrome={<Art surface={surface} />}>
              {contentFor(surface)}
            </StoryChromeStage>
          </div>
        </div>

        <aside className="space-y-5 rounded-2xl border border-border bg-card/40 p-5 text-sm">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Thesis
            </p>
            <p className="mt-2 leading-relaxed text-foreground">{meta.thesis}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              When
            </p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {meta.when}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Libraries
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-foreground">
              {meta.libs}
            </p>
          </div>
          <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Overview loops a load-in / transform. Story and Share quiet the same
            system for readability. Freezes under{" "}
            <span className="font-mono">prefers-reduced-motion</span>. Refs:{" "}
            <span className="font-mono">docs/mocks/art-refs/</span>.
          </p>
        </aside>
      </div>
    </div>
  );
}
