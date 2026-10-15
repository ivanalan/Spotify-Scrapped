"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { StoryChromeStage } from "@/components/scrapped/art/StoryChromeStage";
import { RibbonsChrome } from "@/components/scrapped/art/chrome/RibbonsChrome";
import { PerspectiveSlabsChrome } from "@/components/scrapped/art/chrome/PerspectiveSlabsChrome";
import { SlabTunnelChrome } from "@/components/scrapped/art/chrome/SlabTunnelChrome";
import { SlabRailsChrome } from "@/components/scrapped/art/chrome/SlabRailsChrome";
import { SlabFanChrome } from "@/components/scrapped/art/chrome/SlabFanChrome";
import { SlabGlassChrome } from "@/components/scrapped/art/chrome/SlabGlassChrome";
import { SlabHelixChrome } from "@/components/scrapped/art/chrome/SlabHelixChrome";
import { PixelStairsChrome } from "@/components/scrapped/art/chrome/PixelStairsChrome";
import { PixelBorderCrawlChrome } from "@/components/scrapped/art/chrome/PixelBorderCrawlChrome";
import { PixelMosaicChrome } from "@/components/scrapped/art/chrome/PixelMosaicChrome";
import { PixelTiltChrome } from "@/components/scrapped/art/chrome/PixelTiltChrome";
import { cn } from "@/lib/utils";

type StyleId =
  | "slabs-orbit"
  | "slabs-rails"
  | "slabs-tunnel"
  | "slabs-fan"
  | "slabs-glass"
  | "slabs-helix"
  | "pixels-stairs"
  | "pixels-crawl"
  | "pixels-mosaic"
  | "pixels-tilt"
  | "ribbons";

type ContentId = "opener" | "list" | "share";

type StyleMeta = {
  id: StyleId;
  label: string;
  technique: string;
  when: string;
};

const GROUPS: { title: string; note: string; styles: StyleMeta[] }[] = [
  {
    title: "Perspective slabs",
    note: "Your favorite lane — fake-3D panels without WebGL.",
    styles: [
      {
        id: "slabs-orbit",
        label: "Orbit",
        technique: "Large gradient panels tumbling in CSS perspective",
        when: "Original slab preset — bold corner energy",
      },
      {
        id: "slabs-rails",
        label: "Rails",
        technique: "Thick parallelogram bands wrapping the frame",
        when: "Closest to Wrapped ribbon-as-slab frame dressing",
      },
      {
        id: "slabs-tunnel",
        label: "Tunnel",
        technique: "Nested frames receding in Z toward the card",
        when: "Depth cue that pulls the eye into the beat",
      },
      {
        id: "slabs-fan",
        label: "Fan deck",
        technique: "Stacked cards fanned behind content",
        when: "Story-as-deck metaphor; good for openers",
      },
      {
        id: "slabs-glass",
        label: "Glass",
        technique: "Translucent overlapping panes",
        when: "Softer carnival — color without opaque blocks",
      },
      {
        id: "slabs-helix",
        label: "Helix",
        technique: "Thin horizontal bands twisting around the card",
        when: "More motion density, less mass",
      },
    ],
  },
  {
    title: "Pixel",
    note: "Secondary lane — digital / stair language.",
    styles: [
      {
        id: "pixels-stairs",
        label: "Stairs",
        technique: "Corner stair steps with staggered bounce",
        when: "Classic Wrapped pixel-border corners",
      },
      {
        id: "pixels-crawl",
        label: "Border crawl",
        technique: "Full perimeter cells pulsing in sequence",
        when: "Living frame without filling the corners only",
      },
      {
        id: "pixels-mosaic",
        label: "Mosaic corners",
        technique: "Irregular block clusters of mixed sizes",
        when: "Messier, more collage than grid",
      },
      {
        id: "pixels-tilt",
        label: "Tilt stairs",
        technique: "Pixel stairs on perspective rails",
        when: "Bridge between slabs + pixels",
      },
    ],
  },
  {
    title: "Other",
    note: "Kept for contrast — not the focus.",
    styles: [
      {
        id: "ribbons",
        label: "Ribbons",
        technique: "SVG stroke ribbons with gradient drifts",
        when: "Organic Wrapped ribbons (for A/B against slabs)",
      },
    ],
  },
];

const CONTENT: { id: ContentId; label: string }[] = [
  { id: "opener", label: "Opener" },
  { id: "list", label: "List beat" },
  { id: "share", label: "Share" },
];

function OpenerMock() {
  return (
    <div className="flex h-full flex-col px-6 py-8 text-center text-[#1c1c1c]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="font-sans text-[clamp(1.75rem,8vw,2.5rem)] font-bold leading-none tracking-tight">
          2026
        </p>
        <h1 className="mt-1 font-sans text-[clamp(1.6rem,7vw,2.25rem)] font-bold italic leading-none tracking-tight">
          Scrapped
        </h1>
        <p className="mt-5 max-w-[14rem] font-sans text-sm leading-relaxed">
          Scrapped is your <span className="italic">anti-wrapped</span>. Songs
          you hated and artists you skipped.
        </p>
        <div className="mt-8 inline-flex h-11 items-center justify-center rounded-2xl bg-[#1c1c1c] px-8 text-sm font-semibold text-white">
          Start
        </div>
      </div>
      <p className="pb-2 font-sans text-xs text-[#6b6b6b]">Created by Alan Matias</p>
    </div>
  );
}

function ListMock() {
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
          <li key={r.n} className="flex items-baseline gap-3 border-b border-black/10 pb-3">
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

function contentFor(id: ContentId): ReactNode {
  switch (id) {
    case "opener":
      return <OpenerMock />;
    case "list":
      return <ListMock />;
    case "share":
      return <ShareMock />;
  }
}

function chromeFor(id: StyleId): ReactNode {
  switch (id) {
    case "slabs-orbit":
      return <PerspectiveSlabsChrome />;
    case "slabs-rails":
      return <SlabRailsChrome />;
    case "slabs-tunnel":
      return <SlabTunnelChrome />;
    case "slabs-fan":
      return <SlabFanChrome />;
    case "slabs-glass":
      return <SlabGlassChrome />;
    case "slabs-helix":
      return <SlabHelixChrome />;
    case "pixels-stairs":
      return <PixelStairsChrome />;
    case "pixels-crawl":
      return <PixelBorderCrawlChrome />;
    case "pixels-mosaic":
      return <PixelMosaicChrome />;
    case "pixels-tilt":
      return <PixelTiltChrome />;
    case "ribbons":
      return <RibbonsChrome />;
  }
}

function allStyles(): StyleMeta[] {
  return GROUPS.flatMap((g) => g.styles);
}

export function ArtMotionLab() {
  const [style, setStyle] = useState<StyleId>("slabs-rails");
  const [content, setContent] = useState<ContentId>("opener");
  const meta = allStyles().find((s) => s.id === style)!;

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">Scrapped · Art motion lab</p>
        <h1 className="max-w-[18ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Carnival chrome
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Shared frame dressing around story-shaped beats. Slabs first, pixels
          second — live deck unchanged until you promote a style.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Scrapped
          </Link>
          <Link
            href="/scrapped/lab"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Metrics Lab →
          </Link>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-8">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Content mock
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTENT.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setContent(c.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    content === c.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground/40",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {group.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{group.note}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {group.styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      style === s.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-transparent text-foreground hover:border-foreground/40",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <dl className="space-y-3 border-t border-border pt-4 text-sm">
            <div>
              <dt className="font-mono text-xs text-muted-foreground">
                Technique
              </dt>
              <dd className="mt-1 text-foreground">{meta.technique}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted-foreground">When</dt>
              <dd className="mt-1 text-muted-foreground">{meta.when}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted-foreground">Deps</dt>
              <dd className="mt-1 text-foreground">motion (already in repo)</dd>
            </div>
          </dl>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Loops freeze under{" "}
            <span className="font-mono">prefers-reduced-motion</span>. Rive still
            reserved for a later designer-authored pass.
          </p>
        </aside>

        <div className="flex justify-center lg:justify-start">
          <StoryChromeStage chrome={chromeFor(style)}>
            {contentFor(content)}
          </StoryChromeStage>
        </div>
      </div>
    </div>
  );
}
