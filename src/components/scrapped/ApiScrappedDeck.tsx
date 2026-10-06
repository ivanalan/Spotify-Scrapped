"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { DeckSoundtrack } from "@/components/scrapped/DeckSoundtrack";
import { ShareRecapCard } from "@/components/scrapped/ShareRecapCard";
import { StorySlide } from "@/components/scrapped/StorySlide";
import { RankBars } from "@/components/scrapped/visuals/RankBars";
import type {
  ApiMetricCard,
  ApiMetricItem,
  ScrappedApiReport,
} from "@/lib/scrapped-api";
import { cn } from "@/lib/utils";

type Props = {
  report: ScrappedApiReport;
};

const SLIDE_COUNT = 9;

function cardById(
  report: ScrappedApiReport,
  id: string,
): ApiMetricCard | undefined {
  return report.cards.find((c) => c.id === id);
}

function trackUri(item: ApiMetricItem | undefined): string | null {
  return item?.trackId ? `spotify:track:${item.trackId}` : null;
}

function getApiSlideSoundtrackUri(
  report: ScrappedApiReport,
  slideIndex: number,
): string | null {
  const leftLong = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const fallen = cardById(report, "fallen-rotation");
  const secondChance = cardById(report, "second-chance");
  const lead = trackUri(leftLong?.items[0]) ?? trackUri(fallen?.items[0]);
  const reunion = trackUri(secondChance?.items[0]) ?? lead;

  switch (slideIndex) {
    case 0:
    case 1:
    case 2:
    case 3:
      return lead;
    case 4:
    case 5:
      // Song credited to the top artist who left the long run.
      return trackUri(leftLongArtists?.items[0]) ?? lead;
    case 6:
    case 7:
    case 8:
      // Soft-launch hero through wrap-up — keep the reunion track playing.
      return reunion;
    default:
      return null;
  }
}

function metricBars(items: ApiMetricItem[]) {
  return items.map((item) => ({
    id: item.id,
    trackId: item.trackId,
    label: item.label,
    sublabel: item.sublabel,
    value: item.value,
    display: item.detail,
  }));
}

export function ApiScrappedDeck({ report }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const leftLongHeadline = report.headlines.find((h) => h.id === "left-long");
  const leftLongSongs = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const secondChance = cardById(report, "second-chance");

  const topSong = leftLongSongs?.items[0] ?? null;
  const topArtist = leftLongArtists?.items[0] ?? null;
  const reunionSong = secondChance?.items[0] ?? null;

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
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== " ") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? -1 : 1;
      goTo(activeRef.current + delta);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const soundtrackUri = getApiSlideSoundtrackUri(report, active);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="h-[calc(100dvh-3.75rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      >
        <StorySlide
          index="00"
          title="API Scrapped"
          blurb={`Your tops, but make it a situationship recap. Live affinity windows only — no homework, no export. ${report.year}.`}
          active={active === 0}
          footer={
            <>
              {report.profileName ? `${report.profileName} · ` : null}
              4 weeks · 6 months · several years
              {" · "}
              <Link
                href="/scrapped/lab"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Metrics lab
              </Link>
            </>
          }
        >
          <p className="font-heading text-3xl tracking-[-0.02em] text-warn sm:text-4xl">
            Your algorithm has commitment issues.
          </p>
        </StorySlide>

        {/* 1 */}
        <StorySlide
          index="01"
          title="Ghosted the hall of fame"
          blurb="How many of your multi-year top songs you haven’t texted back — missing from both the last 6 months and the last 4 weeks."
          active={active === 1}
          footer={leftLongHeadline?.detail}
        >
          <p className="font-mono text-[clamp(3.5rem,12vw,6rem)] leading-none tracking-tight text-warn tabular-nums">
            {leftLongHeadline?.percent == null
              ? "—"
              : `${leftLongHeadline.percent}%`}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            of your long-run favorites are currently on “seen”
          </p>
        </StorySlide>

        {/* 2 */}
        <StorySlide
          index="02"
          title="Main character, left on read"
          blurb="Your highest multi-year favorite that isn’t in the 6-month or 4-week tops. Peak lore. Zero recent replies."
          active={active === 2}
        >
          {topSong ? (
            <div className="space-y-4">
              <p className="font-heading text-[clamp(2.25rem,7vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {topSong.label}
              </p>
              <p className="text-lg text-muted-foreground">
                {topSong.sublabel ?? "—"}
              </p>
              <p className="font-mono text-sm tabular-nums text-warn">
                {topSong.detail}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Wow — you actually still talk to your old favorites.
            </p>
          )}
        </StorySlide>

        {/* 3 */}
        <StorySlide
          index="03"
          title="The muted group chat"
          blurb="Multi-year top songs you quietly stopped opening. Still in the chat. Just… not checking it."
          active={active === 3}
          footer={
            (leftLongSongs?.items.length ?? 0) === 0
              ? "Nobody to mute. Suspicious loyalty."
              : undefined
          }
        >
          <RankBars items={metricBars(leftLongSongs?.items ?? [])} />
        </StorySlide>

        {/* 4 */}
        <StorySlide
          index="04"
          title="Filed a missing-person report"
          blurb="The multi-year artist most entitled to ask where you’ve been."
          active={active === 4}
        >
          {topArtist ? (
            <div className="space-y-4">
              <p className="font-heading text-[clamp(2.5rem,8vw,4rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {topArtist.label}
              </p>
              <p className="font-mono text-sm tabular-nums text-warn">
                {topArtist.detail}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No missing artists. Your loyalty program is weirdly intact.
            </p>
          )}
        </StorySlide>

        {/* 5 */}
        <StorySlide
          index="05"
          title="On sabbatical (from you)"
          blurb="Multi-year top artists who slipped out of both recent windows. They’re fine. They’re just busy not being pressed by you."
          active={active === 5}
          footer={
            (leftLongArtists?.items.length ?? 0) === 0
              ? "Empty sabbatical list. Touch grass? Or don’t."
              : undefined
          }
        >
          <RankBars items={metricBars(leftLongArtists?.items ?? [])} />
        </StorySlide>

        {/* 6 */}
        <StorySlide
          index="06"
          title="The soft launch reunion"
          blurb="An old multi-year favorite that skipped the 6-month era and slid back into your 4-week tops. We don’t have to talk about it."
          active={active === 6}
        >
          {reunionSong ? (
            <div className="space-y-4">
              <p className="font-heading text-[clamp(2.25rem,7vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {reunionSong.label}
              </p>
              <p className="text-lg text-muted-foreground">
                {reunionSong.sublabel ?? "—"}
              </p>
              <p className="font-mono text-sm tabular-nums text-warn">
                {reunionSong.detail}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reunions on the calendar. For now.
            </p>
          )}
        </StorySlide>

        {/* 7 */}
        <StorySlide
          index="07"
          title="The reunion setlist"
          blurb="More comebacks from the long run — or old likes — that are back in your 4-week tops after a gap."
          active={active === 7}
          footer={
            (secondChance?.items.length ?? 0) === 0
              ? "Empty setlist. The soft launch stayed soft."
              : undefined
          }
        >
          <RankBars items={metricBars(secondChance?.items ?? [])} />
        </StorySlide>

        {/* 8 — shareable recap */}
        <section
          data-scrapped-slide
          className="flex h-[calc(100dvh-3.75rem)] min-h-[calc(100dvh-3.75rem)] w-full snap-start snap-always flex-col items-center justify-center px-6 py-10 md:px-10"
          aria-hidden={active !== 8}
        >
          <ShareRecapCard
            year={report.year}
            title="API Scrapped"
            subtitle="Songs you ghosted · artists on sabbatical"
            leftLabel="Left on read"
            rightLabel="On sabbatical"
            tagline="Taste is a situationship."
            brandLine="API Scrapped · Anti-Wrapped"
            active={active === 8}
            skipped={(leftLongSongs?.items ?? []).slice(0, 5).map((item) => ({
              id: item.id,
              title: item.label,
              artist: item.sublabel ?? "—",
            }))}
            stayed={(leftLongArtists?.items ?? []).slice(0, 5).map((item) => ({
              id: item.id,
              title: item.label,
              artist: item.detail,
            }))}
          />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Screenshot to soft-launch your chaos
            {" · "}
            <Link
              href="/scrapped/lab"
              className="text-foreground underline-offset-2 hover:underline"
            >
              API metrics lab →
            </Link>
          </p>
        </section>
      </div>

      <DeckSoundtrack uri={soundtrackUri} />

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
