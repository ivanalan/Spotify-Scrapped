"use client";

import type { SlidePattern } from "./types";

type Props = {
  pattern: SlidePattern;
  slideIndex: number;
  ink: string;
  muted: string;
};

const LIST_ROWS = [
  { n: "1", title: "Never again", artist: "Shelf artist" },
  { n: "2", title: "One-play wonder", artist: "Almost stuck" },
  { n: "3", title: "Fwd in 12s", artist: "Skip streak" },
  { n: "4", title: "Liked then left", artist: "Ghost town" },
  { n: "5", title: "Almost a habit", artist: "Fell off" },
];

/** Lightweight copy shells matching API deck patterns (placeholder spine). */
export function SlideMock({ pattern, slideIndex, ink, muted }: Props) {
  switch (pattern) {
    case "intro":
      return (
        <div
          className="flex h-full flex-col px-5 py-7 text-left"
          style={{ color: ink }}
        >
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-display">2026</p>
            <h1 className="text-display mt-1 italic">Scrapped</h1>
            <p className="text-body mt-5 max-w-[15rem]" style={{ color: muted }}>
              Scrapped is your <span className="italic">anti-wrapped</span>.
              Songs you ghosted and artists you left on read.
            </p>
            <div
              className="mt-8 inline-flex h-11 max-w-[11rem] items-center justify-center rounded-2xl px-6 text-sm font-semibold"
              style={{ background: ink, color: invertInk(ink) }}
            >
              Continue
            </div>
            <p className="text-caption mt-3" style={{ color: muted }}>
              Signed in to Spotify as You
            </p>
          </div>
          <p className="text-caption pb-2" style={{ color: muted }}>
            Created by Alan Matias
          </p>
        </div>
      );

    case "volume":
      return (
        <div
          className="flex h-full flex-col justify-center px-5 py-8 text-left"
          style={{ color: ink }}
        >
          <p className="text-display tabular-nums">1,284</p>
          <p className="text-title mt-3 max-w-[14rem] font-extrabold leading-tight">
            songs in your liked pile
          </p>
          <p className="text-body mt-4 max-w-[14rem]" style={{ color: muted }}>
            214 of them this year.
          </p>
        </div>
      );

    case "entity":
      return (
        <div
          className="flex h-full flex-col px-5 py-8 text-left"
          style={{ color: ink }}
        >
          <p
            className="font-sans text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: muted }}
          >
            {slideIndex === 5 ? "Left on read" : "Most ghosted"}
          </p>
          <div className="mt-6 flex flex-1 flex-col items-center justify-center">
            <div
              className="aspect-square w-[58%] max-w-[11rem] rounded-md"
              style={{ background: "rgba(128,128,128,0.28)" }}
            />
            <p className="mt-5 text-center font-sans text-lg font-extrabold leading-snug">
              {slideIndex === 5 ? "Shelf Circuit" : "Never again"}
            </p>
            <p className="mt-1 text-center text-sm" style={{ color: muted }}>
              {slideIndex === 5 ? "Artist you left on read" : "Song that stings most"}
            </p>
          </div>
        </div>
      );

    case "list":
      return (
        <div
          className="flex h-full flex-col px-5 py-7 text-left"
          style={{ color: ink }}
        >
          <p
            className="font-sans text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: muted }}
          >
            {listEyebrow(slideIndex)}
          </p>
          <h2 className="mt-2 font-sans text-[1.25rem] font-extrabold leading-tight tracking-tight">
            {listTitle(slideIndex)}
          </h2>
          <ul className="mt-5 flex-1 space-y-3">
            {LIST_ROWS.map((r) => (
              <li key={r.n} className="flex items-center gap-3">
                <span
                  className="w-4 font-mono text-sm tabular-nums"
                  style={{ color: muted }}
                >
                  {r.n}
                </span>
                <div
                  className="h-9 w-9 shrink-0 rounded-sm"
                  style={{ background: "rgba(128,128,128,0.28)" }}
                />
                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-bold">
                    {r.title}
                  </span>
                  <span
                    className="block truncate text-xs"
                    style={{ color: muted }}
                  >
                    {r.artist}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "reunion":
      return (
        <div
          className="flex h-full flex-col px-5 py-7 text-left"
          style={{ color: ink }}
        >
          <p className="text-title font-extrabold leading-tight">Plot twist.</p>
          <h2 className="mt-3 font-sans text-[1.25rem] font-extrabold leading-tight">
            The reunion setlist
          </h2>
          <ul className="mt-6 space-y-3">
            {LIST_ROWS.slice(0, 3).map((r) => (
              <li key={r.n} className="flex items-center gap-3">
                <span
                  className="w-4 font-mono text-sm tabular-nums"
                  style={{ color: muted }}
                >
                  {r.n}
                </span>
                <div
                  className="h-9 w-9 shrink-0 rounded-sm"
                  style={{ background: "rgba(128,128,128,0.28)" }}
                />
                <span className="min-w-0 truncate font-sans text-sm font-bold">
                  {r.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "close":
      return (
        <div
          className="flex h-full flex-col items-center justify-center px-6 py-8 text-center"
          style={{ color: ink }}
        >
          <p className="text-title max-w-[16rem] font-extrabold leading-snug">
            Thanks for sitting with the ghosted.
          </p>
          <p className="text-body mt-4 max-w-[14rem]" style={{ color: muted }}>
            See you when they get ghosted.
          </p>
        </div>
      );

    case "share":
      return (
        <div
          className="flex h-full flex-col items-center justify-center px-6 py-8 text-center"
          style={{ color: ink }}
        >
          <div
            className="w-full max-w-[14rem] rounded-xl px-4 py-5"
            style={{
              background: "rgba(255,255,255,0.88)",
              color: "#1c1c1c",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#6b6b6b]">
              Scrapped · 2026
            </p>
            <p className="mt-3 font-sans text-lg font-extrabold leading-snug tracking-tight">
              Ghosted songs & left on read
            </p>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Anti-wrapped, on purpose.
            </p>
          </div>
          <div
            className="mt-6 inline-flex h-10 items-center rounded-2xl px-6 text-sm font-semibold"
            style={{ background: ink, color: invertInk(ink) }}
          >
            Share this story
          </div>
        </div>
      );
  }
}

function listEyebrow(slideIndex: number) {
  if (slideIndex === 4) return "1 like";
  if (slideIndex === 6) return "Left on read";
  return "Ghosted songs";
}

function listTitle(slideIndex: number) {
  if (slideIndex === 4) return "Your 1 like artists";
  if (slideIndex === 6) return "Artists you left on read";
  return "Your ghosted songs";
}

function invertInk(ink: string) {
  const light = ink.toLowerCase().startsWith("#f") || ink === "#f5f5f5";
  return light ? "#1c1c1c" : "#f5f5f5";
}
