"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import {
  collectSoundtrackUris,
  DeckSoundtrack,
  getSlideSoundtrackUri,
} from "@/components/scrapped/DeckSoundtrack";
import { ShareRecapCard } from "@/components/scrapped/ShareRecapCard";
import { StorySlide } from "@/components/scrapped/StorySlide";
import { RankBars } from "@/components/scrapped/visuals/RankBars";
import {
  formatDateRange,
  formatPct,
  type ScrappedReport,
} from "@/lib/scrapped";
import { cn } from "@/lib/utils";

type Props = {
  report: ScrappedReport;
};

const SLIDE_COUNT = 10;

function trackBars<
  T extends {
    spotify_track_uri: string;
    track_name: string | null;
    artist_name: string | null;
  },
>(
  rows: T[],
  value: (row: T, i: number) => number,
  display: (row: T, i: number) => string,
) {
  return rows.map((row, i) => ({
    id: row.spotify_track_uri,
    label: row.track_name ?? "Unknown track",
    sublabel: row.artist_name,
    value: value(row, i),
    display: display(row, i),
  }));
}

export function ScrappedDeck({ report }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { summary } = report;
  const topSong = report.topSkippedByCount[0] ?? null;
  const topArtist = report.abandonedArtists[0] ?? null;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scrapped-slide]"),
    );
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = slides.indexOf(visible.target as HTMLElement);
        if (idx >= 0) setActive(idx);
      },
      { root, threshold: [0.55, 0.7] },
    );

    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, []);

  const activeRef = useRef(0);
  activeRef.current = active;

  function goTo(index: number) {
    const root = scrollerRef.current;
    if (!root) return;
    const slides = root.querySelectorAll<HTMLElement>("[data-scrapped-slide]");
    const next = Math.min(Math.max(index, 0), slides.length - 1);
    slides[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        goTo(0);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== " ") return;
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? -1 : 1;
      goTo(activeRef.current + delta);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const soundtrackUri = getSlideSoundtrackUri(report, active);
  const soundtrackPreload = useMemo(
    () =>
      collectSoundtrackUris(
        (i) => getSlideSoundtrackUri(report, i),
        SLIDE_COUNT,
      ),
    [report],
  );

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="h-[calc(100dvh-3.75rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      >
        <StorySlide
          index="00"
          title="Scrapped Plus"
          blurb={`Anti-Wrapped for ${summary.year} — the skips, the ghosted, and the songs that earned a rematch.`}
          active={active === 0}
          footer={
            <>
              {formatDateRange(summary.firstTs, summary.lastTs)}
              {" · "}
              <Link
                href="/scrapped/lab"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Scrapped Lab
              </Link>
            </>
          }
        >
          <p className="font-heading text-3xl tracking-[-0.02em] text-warn sm:text-4xl">
            Not everything stuck. Some things grew back.
          </p>
        </StorySlide>

        {/* 1 */}
        <StorySlide
          index="01"
          title="Times skipped"
          blurb="How often you bounced — every forward, early end, back, or under-30s bail in 2026."
          active={active === 1}
          footer={`${formatPct(summary.skipRate)} of ${summary.playCount.toLocaleString()} track plays`}
        >
          <p className="font-mono text-[clamp(3.5rem,12vw,6rem)] leading-none tracking-tight text-warn tabular-nums">
            {summary.skipCount.toLocaleString()}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">skips this year</p>
        </StorySlide>

        {/* 2 */}
        <StorySlide
          index="02"
          title="Most skipped song"
          blurb="The one track that collected the most skips — Wrapped’s top-song beat, inverted."
          active={active === 2}
        >
          {topSong ? (
            <div className="space-y-4">
              <p className="font-heading text-[clamp(2.25rem,7vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {topSong.track_name ?? "Unknown track"}
              </p>
              <p className="text-lg text-muted-foreground">
                {topSong.artist_name ?? "—"}
              </p>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Skips</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-warn">
                    {topSong.skips.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Skip rate</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-foreground">
                    {formatPct(topSong.skip_rate)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skip leader yet.</p>
          )}
        </StorySlide>

        {/* 3 */}
        <StorySlide
          index="03"
          title="Top skipped songs"
          blurb="The short list that kept showing up and kept getting the fast-forward."
          active={active === 3}
        >
          <RankBars
            items={trackBars(
              report.topSkippedByCount,
              (row) => row.skips,
              (row) => `${row.skips} skips · ${formatPct(row.skip_rate)}`,
            )}
          />
        </StorySlide>

        {/* 4 */}
        <StorySlide
          index="04"
          title="Top skipped artist"
          blurb="The artist you kept starting and kept leaving — one name."
          active={active === 4}
        >
          {topArtist ? (
            <div className="space-y-4">
              <p className="font-heading text-[clamp(2.5rem,8vw,4rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {topArtist.artist_name}
              </p>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Skip rate</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-warn">
                    {formatPct(topArtist.skip_rate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Skips</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-foreground">
                    {topArtist.skips.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Plays</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-foreground">
                    {topArtist.appearances.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not enough artist plays to crown one.
            </p>
          )}
        </StorySlide>

        {/* 5 */}
        <StorySlide
          index="05"
          title="Top skipped artists"
          blurb="Skip volume weighted by how often you bail — the artists that got ghosted."
          active={active === 5}
        >
          <RankBars
            items={report.abandonedArtists.map((row) => ({
              id: row.artist_name,
              label: row.artist_name,
              sublabel: `${row.skips} skips · ${row.appearances} plays`,
              value: row.score,
              display: formatPct(row.skip_rate),
            }))}
          />
        </StorySlide>

        {/* 6 */}
        <StorySlide
          index="06"
          title="Liked but scrapped"
          blurb={
            report.likedConnected
              ? "You kept the heart. Your skips didn’t."
              : "Sign in to Spotify to cross-check Liked Songs against this year’s skips."
          }
          active={active === 6}
          footer={
            !report.likedConnected ? (
              <a
                href="/api/spotify/login"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Sign in to Spotify
              </a>
            ) : report.likedButScrapped.length === 0 ? (
              "No liked tracks cleared the skip bar in this window."
            ) : null
          }
        >
          {report.likedConnected ? (
            <RankBars
              items={trackBars(
                report.likedButScrapped,
                (row) => row.skips,
                (row) => `${row.skips} skips · ${formatPct(row.skip_rate)}`,
              )}
            />
          ) : (
            <p className="font-heading text-2xl tracking-[-0.02em] text-muted-foreground">
              Library context unlocks this slide.
            </p>
          )}
        </StorySlide>

        {/* 7 */}
        <StorySlide
          index="07"
          title="Second-chance heroes"
          blurb="Hard no in the first half. Actually finished later."
          active={active === 7}
          footer={
            report.secondChanceHeroes.length === 0
              ? "No tracks cleared the H1-skip → H2-finish gates."
              : undefined
          }
        >
          <RankBars
            items={report.secondChanceHeroes.map((row) => ({
              id: row.spotify_track_uri,
              label: row.track_name ?? "Unknown track",
              sublabel: `${row.artist_name ?? "—"} · ${row.detail}`,
              value: row.late_metric,
              display: formatPct(row.late_metric),
            }))}
            maxValue={1}
          />
        </StorySlide>

        {/* 8 */}
        <StorySlide
          index="08"
          title="Songs you stayed for"
          blurb="Among songs you played a lot — these are the ones you let end."
          active={active === 8}
        >
          <RankBars
            items={report.actuallyFinished.map((row) => ({
              id: row.spotify_track_uri,
              label: row.track_name ?? "Unknown track",
              sublabel: `${row.artist_name ?? "—"} · ${row.appearances} plays`,
              value: row.finish_rate,
              display: formatPct(row.finish_rate),
            }))}
            maxValue={1}
          />
        </StorySlide>

        {/* 9 — shareable Wrapped-style recap */}
        <section
          data-scrapped-slide
          className="flex h-[calc(100dvh-3.75rem)] min-h-[calc(100dvh-3.75rem)] w-full snap-start snap-always flex-col items-center justify-center px-6 py-10 md:px-10"
          aria-hidden={active !== 9}
        >
          <ShareRecapCard
            year={summary.year}
            skipCount={summary.skipCount}
            active={active === 9}
            skipped={report.topSkippedByCount.slice(0, 5).map((row) => ({
              id: row.spotify_track_uri,
              title: row.track_name ?? "Unknown track",
              artist: row.artist_name ?? "—",
            }))}
            stayed={report.actuallyFinished.slice(0, 5).map((row) => ({
              id: row.spotify_track_uri,
              title: row.track_name ?? "Unknown track",
              artist: row.artist_name ?? "—",
            }))}
          />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Screenshot to share
            {" · "}
            <Link
              href="/scrapped/lab"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Scrapped Lab →
            </Link>
          </p>
        </section>
      </div>

      <DeckSoundtrack uri={soundtrackUri} preloadUris={soundtrackPreload} />

      <div className="pointer-events-none absolute inset-y-0 right-3 flex flex-col items-center justify-center gap-2 md:right-5">
        <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-border bg-background/80 px-2 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active <= 0}
            className="pressable text-muted-foreground disabled:opacity-30"
            aria-label="Previous slide"
          >
            <Icon icon={chevronUpOutline} className="h-4 w-4" />
          </button>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-[var(--duration-fast)]",
                i === active ? "bg-warn" : "bg-muted-foreground/40",
              )}
            />
          ))}
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active >= SLIDE_COUNT - 1}
            className="pressable text-muted-foreground disabled:opacity-30"
            aria-label="Next slide"
          >
            <Icon icon={chevronDownOutline} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
