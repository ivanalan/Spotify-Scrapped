"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  chevronBackOutline,
  chevronForwardOutline,
  pauseOutline,
  playOutline,
  volumeHighOutline,
  volumeMuteOutline,
} from "ionicons/icons";
import { Icon } from "@/components/Icon";
import {
  collectSoundtrackUris,
  DeckSoundtrack,
} from "@/components/scrapped/DeckSoundtrack";
import { ShareRecapCard } from "@/components/scrapped/ShareRecapCard";
import { SignOutConfirmButton } from "@/components/scrapped/SignOutConfirmButton";
import { WrappedEntityList } from "@/components/scrapped/wrapped/WrappedEntityList";
import { WrappedStorySlide } from "@/components/scrapped/wrapped/WrappedStorySlide";
import { useStoryAutoplay } from "@/components/scrapped/wrapped/useStoryAutoplay";
import { Button } from "@/components/ui/button";
import {
  API_SCRAPPED_BEAT_COUNTS,
  API_SCRAPPED_SLIDE_COUNT,
  getApiSlideSoundtrackUri,
  needsArtistSoundtrackResolve,
} from "@/lib/api-scrapped-soundtrack";
import type { ApiMetricCard, ScrappedApiReport } from "@/lib/scrapped-api";

type Props = {
  report: ScrappedApiReport;
  /** Set when the user accepted audio on the intro Continue. */
  initialSoundOn?: boolean;
};

const SLIDE_COUNT = API_SCRAPPED_SLIDE_COUNT;
const FINALE_INDEX = SLIDE_COUNT - 1;

function cardById(
  report: ScrappedApiReport,
  id: string,
): ApiMetricCard | undefined {
  return report.cards.find((c) => c.id === id);
}

function likedAside(count: number): string {
  if (count <= 0) return "Empty shelves. Bold.";
  if (count < 80) return "A short shelf. High standards — or just getting started.";
  if (count < 250) return "A solid pile of “I’ll listen later.”";
  if (count < 600) return "That’s a lot of almosts waiting in the wings.";
  return "A whole museum of maybe.";
}

export function ApiScrappedDeck({ report, initialSoundOn = false }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeFillRef = useRef<HTMLDivElement | null>(null);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Locks active index during programmatic prev/next so IO can't land mid-scroll. */
  const navigatingToRef = useRef<number | null>(null);
  const navClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  const [visitKey, setVisitKey] = useState(0);
  const [pausedSticky, setPausedSticky] = useState(false);
  const [pausedHold, setPausedHold] = useState(false);
  const [soundOn, setSoundOn] = useState(initialSoundOn);
  const [artistSoundtrackUri, setArtistSoundtrackUri] = useState<string | null>(
    null,
  );
  const reduceMotion = useReducedMotion();
  const paused = pausedSticky || pausedHold;

  const leftLongHeadline = report.headlines.find((h) => h.id === "left-long");
  const leftLongSongs = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const secondChance = cardById(report, "second-chance");
  const artistsBack = cardById(report, "artists-back");

  const topSong = leftLongSongs?.items[0] ?? null;
  const topArtist = leftLongArtists?.items[0] ?? null;
  const reunionSong = secondChance?.items[0] ?? null;
  const ghostPercent = leftLongHeadline?.percent;
  const likedCount = report.summary.likedCount;
  const longCount = report.summary.longTrackCount;

  const soundtrackOpts = useMemo(
    () => ({ artistSoundtrackUri }),
    [artistSoundtrackUri],
  );

  // Sabbatical artists often have zero tracks in tops/likes (e.g. Kendrick).
  // Resolve a playable track client-side so artist-act scenes can switch audio.
  useEffect(() => {
    const need = needsArtistSoundtrackResolve(report);
    if (!need) {
      setArtistSoundtrackUri(null);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({
      id: need.artistId,
      name: need.artistName,
    });
    if (need.avoidTrackId) params.set("avoid", need.avoidTrackId);
    fetch(`/api/spotify/artist-top-track?${params}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ uri?: string }>;
      })
      .then((body) => {
        if (cancelled || !body?.uri) return;
        setArtistSoundtrackUri(body.uri);
      })
      .catch(() => {
        /* keep song lead */
      });
    return () => {
      cancelled = true;
    };
  }, [report]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scrapped-slide]"),
    );
    if (slides.length === 0) return;

    const clearNavLock = () => {
      navigatingToRef.current = null;
      if (navClearTimerRef.current) {
        clearTimeout(navClearTimerRef.current);
        navClearTimerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = slides.indexOf(visible.target as HTMLElement);
        if (idx < 0) return;

        const target = navigatingToRef.current;
        if (target != null) {
          // Ignore intermediate slides while scrolling back/forward.
          if (idx !== target) return;
          clearNavLock();
          setActive(idx);
          return;
        }

        if (activeRef.current === idx) return;
        setPausedSticky(false);
        setActive(idx);
        setVisitKey((k) => k + 1);
      },
      { root, threshold: [0.55, 0.7] },
    );

    for (const slide of slides) observer.observe(slide);

    const onScrollEnd = () => {
      if (navigatingToRef.current == null) return;
      const target = navigatingToRef.current;
      clearNavLock();
      setActive(target);
    };
    root.addEventListener("scrollend", onScrollEnd);

    return () => {
      observer.disconnect();
      root.removeEventListener("scrollend", onScrollEnd);
      if (navClearTimerRef.current) clearTimeout(navClearTimerRef.current);
    };
  }, []);

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const goTo = useCallback(
    (index: number) => {
      const root = scrollerRef.current;
      if (!root) return;
      const slides = root.querySelectorAll<HTMLElement>("[data-scrapped-slide]");
      const next = Math.min(Math.max(index, 0), slides.length - 1);
      const prev = activeRef.current;

      setPausedSticky(false);

      if (next === prev) {
        // Re-tap current scene: replay in-scene motion from the start.
        setVisitKey((k) => k + 1);
        return;
      }

      navigatingToRef.current = next;
      if (navClearTimerRef.current) clearTimeout(navClearTimerRef.current);
      // Fallback if scrollend never fires (older Safari / interrupted scroll).
      navClearTimerRef.current = setTimeout(() => {
        navigatingToRef.current = null;
      }, 900);

      setActive(next);
      setVisitKey((k) => k + 1);
      activeRef.current = next;

      slides[next]?.scrollIntoView({
        // Instant scroll makes prev/next land on the right scene every time.
        behavior: "auto",
        inline: "start",
        block: "nearest",
      });
    },
    [],
  );

  const { beatIndex } = useStoryAutoplay({
    active,
    visitKey,
    sceneCount: SLIDE_COUNT,
    beatCounts: API_SCRAPPED_BEAT_COUNTS,
    holdActive: active >= FINALE_INDEX,
    paused,
    reduceMotion,
    activeFillRef,
  });

  // RAF writes transform on the active fill; React won't re-apply scaleX(0) on
  // back because the VDOM style never changed — force-clear future segments.
  useLayoutEffect(() => {
    for (let i = 0; i < SLIDE_COUNT; i++) {
      const el = fillRefs.current[i];
      if (!el || i === active) continue;
      el.style.transform = i < active ? "scaleX(1)" : "scaleX(0)";
    }
  }, [active, visitKey]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === " ") {
        e.preventDefault();
        setPausedSticky((p) => !p);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        goTo(0);
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -1 : 1;
      goTo(activeRef.current + delta);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const holdPause = useCallback((down: boolean) => {
    setPausedHold(down);
  }, []);

  const soundtrackUri = getApiSlideSoundtrackUri(
    report,
    active,
    soundtrackOpts,
  );
  const soundtrackPreload = useMemo(
    () =>
      collectSoundtrackUris(
        (i) => getApiSlideSoundtrackUri(report, i, soundtrackOpts),
        SLIDE_COUNT,
      ),
    [report, soundtrackOpts],
  );

  const sceneMotion = (scene: number) => ({
    active: active === scene,
    beatIndex: active === scene ? beatIndex : 0,
    replayKey: active === scene ? visitKey : 0,
  });

  return (
    <div
      className="wrapped-story relative"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const t = e.target as HTMLElement | null;
        if (t?.closest("a, button, input, textarea, select, [role='button']")) {
          return;
        }
        holdPause(true);
      }}
      onPointerUp={() => holdPause(false)}
      onPointerLeave={() => holdPause(false)}
      onPointerCancel={() => holdPause(false)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 md:px-5">
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => {
            const fill = i < active ? 1 : 0;
            return (
              <div
                key={i}
                className="wrapped-progress h-1 min-w-0 flex-1 overflow-hidden rounded-full"
              >
                <div
                  ref={(el) => {
                    fillRefs.current[i] = el;
                    if (i === active) activeFillRef.current = el;
                  }}
                  className="wrapped-progress-fill h-full origin-left rounded-full will-change-transform"
                  style={{ transform: `scaleX(${fill})` }}
                />
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none mt-3 flex items-center justify-between">
          <p className="font-sans text-sm font-semibold tracking-tight text-[var(--wrapped-ink)]">
            Scrapped
          </p>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="default"
              aria-label={pausedSticky ? "Resume story" : "Pause story"}
              onClick={() => setPausedSticky((p) => !p)}
              className="size-8 rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90"
            >
              <Icon
                icon={pausedSticky ? playOutline : pauseOutline}
                className="size-4"
              />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="default"
              aria-label={soundOn ? "Mute soundtrack" : "Enable soundtrack"}
              disabled={!soundtrackUri}
              onClick={() => setSoundOn((on) => !on)}
              className="size-8 rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90 disabled:opacity-40"
            >
              <Icon
                icon={soundOn ? volumeHighOutline : volumeMuteOutline}
                className="size-4"
              />
            </Button>
            <SignOutConfirmButton />
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex h-[calc(100dvh-3.75rem)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* 0 — year open + thesis (paired) */}
        <WrappedStorySlide
          {...sceneMotion(0)}
          tone="paper"
          beats={[
            {
              headline: report.profileName ? (
                <>
                  {report.profileName}&rsquo;s {report.year}{" "}
                  <span className="italic">Scrapped</span>
                </>
              ) : (
                report.year
              ),
              subline: report.profileName ? undefined : (
                <span className="italic">scrapped</span>
              ),
              align: "center",
              display: report.profileName ? "hero" : "year",
            },
            {
              headline: (
                <>
                  Scrapped is your <span className="italic">anti-wrapped</span>.
                </>
              ),
              subline:
                "What artists you ghosted, and which of your songs fell off. Ready?",
              display: "hero",
              footer: "Created by Alan Matias",
            },
          ]}
        />

        {/* 1 — liked volume + tops bridge (paired) */}
        <WrappedStorySlide
          {...sceneMotion(1)}
          tone="sand"
          beats={[
            {
              headline: `${likedCount.toLocaleString()} liked songs in your library.`,
              subline: likedAside(likedCount),
              display: "hero",
            },
            {
              headline:
                longCount > 0
                  ? `and ${longCount.toLocaleString()} all-time top songs`
                  : "and your all-time top songs",
              subline: "But how did they hold up this year?",
              display: "hero",
            },
          ]}
        />

        {/* 2 — ghost rate + #1 ghosted song (paired) */}
        <WrappedStorySlide
          {...sceneMotion(2)}
          tone="blush"
          beats={[
            {
              headline:
                ghostPercent == null
                  ? "Your all-time favorites didn’t show up."
                  : `${ghostPercent}% of your all-time top favorites were ghosted.`,
              subline:
                ghostPercent == null
                  ? "Spotify didn’t return a multi-year list this time."
                  : "Which fell off the hardest?",
              display: "hero",
              footer: leftLongHeadline?.detail,
            },
            {
              headline: topSong?.label ?? "Nobody to call out.",
              subline: topSong
                ? "Your highest multi-year favorite that isn’t in the 6-month or 4-week tops."
                : "Wow — you actually still talk to your old favorites.",
              aside: topSong ? "Why not give them another chance?" : undefined,
              lead: topSong ? (
                <div className="relative aspect-square w-40 max-w-[45%] overflow-hidden rounded-sm bg-[var(--wrapped-panel)] sm:w-48">
                  {topSong.imageUrl ? (
                    <Image
                      src={topSong.imageUrl}
                      alt=""
                      fill
                      sizes="192px"
                      className="object-cover"
                      priority={active === 2}
                    />
                  ) : null}
                </div>
              ) : undefined,
              display: "hero",
              footer: topSong ? (
                <span>
                  {topSong.sublabel ?? "—"}
                  {topSong.detail ? ` · ${topSong.detail}` : null}
                </span>
              ) : undefined,
            },
          ]}
        />

        {/* 3 — list setup */}
        <WrappedStorySlide
          {...sceneMotion(3)}
          headline="Bring back the group"
          subline="Here are your top 5 favorite songs that didn’t make it this year."
          tone="sky"
          display="hero"
        />

        {/* 4 — top ghosted songs */}
        <WrappedStorySlide
          {...sceneMotion(4)}
          headline="Left on read"
          subline="Multi-year favorites missing from both recent windows."
          tone="paper"
          display="sentence"
        >
          <WrappedEntityList
            items={(leftLongSongs?.items ?? []).map((item) => ({
              id: item.id,
              label: item.label,
              sublabel: item.sublabel,
              imageUrl: item.imageUrl,
            }))}
            active={active === 4}
          />
        </WrappedStorySlide>

        {/* 5 — artist act bridge */}
        <WrappedStorySlide
          {...sceneMotion(5)}
          headline="Now the artists."
          subline="Same energy — people you used to keep on repeat, then quietly stopped texting."
          tone="cream"
          display="hero"
        />

        {/* 6 — #1 ghosted artist */}
        <WrappedStorySlide
          {...sceneMotion(6)}
          headline={topArtist?.label ?? "No missing persons."}
          subline={
            topArtist
              ? "Your highest multi-year artist who isn’t in the 6-month or 4-week tops."
              : "Your loyalty program is weirdly intact."
          }
          aside={
            topArtist
              ? "They’re fine. They’re just busy not being pressed by you."
              : undefined
          }
          tone="sand"
          display="hero"
          footer={topArtist?.detail}
        />

        {/* 7 — top ghosted artists */}
        <WrappedStorySlide
          {...sceneMotion(7)}
          headline="On sabbatical (from you)"
          subline="Multi-year top artists who slipped out of both recent windows."
          tone="mist"
          display="sentence"
        >
          <WrappedEntityList
            items={(leftLongArtists?.items ?? []).map((item) => ({
              id: item.id,
              label: item.label,
              sublabel: item.detail,
              imageUrl: item.imageUrl,
            }))}
            active={active === 7}
            empty="Empty sabbatical list. Touch grass? Or don’t."
          />
        </WrappedStorySlide>

        {/* 8 — reunion setup */}
        <WrappedStorySlide
          {...sceneMotion(8)}
          headline="Plot twist."
          subline="Not everyone stayed ghosted. A few old favorites slid back into your last four weeks."
          tone="blush"
          display="hero"
        />

        {/* 9 — reunion reveal */}
        {(secondChance?.items.length ?? 0) > 1 ? (
          <WrappedStorySlide
            {...sceneMotion(9)}
            headline="The reunion setlist"
            subline="Old multi-year favorites — or old likes — back in your 4-week tops after a gap."
            tone="sage"
            display="sentence"
            footer={
              artistsBack && artistsBack.items.length > 0
                ? `${artistsBack.items.length} artists also came back this month`
                : undefined
            }
          >
            <WrappedEntityList
              items={(secondChance?.items ?? []).slice(0, 5).map((item) => ({
                id: item.id,
                label: item.label,
                sublabel: item.sublabel,
                imageUrl: item.imageUrl,
              }))}
              active={active === 9}
            />
          </WrappedStorySlide>
        ) : (
          <WrappedStorySlide
            {...sceneMotion(9)}
            headline={reunionSong?.label ?? "No reunions on the calendar."}
            subline={
              reunionSong
                ? "An old multi-year favorite — or an old like — that’s back in your 4-week tops after a gap."
                : "The soft launch stayed soft. For now."
            }
            aside={reunionSong ? "We don’t have to talk about it." : undefined}
            tone="sage"
            display="hero"
            footer={
              reunionSong ? (
                <span>
                  {reunionSong.sublabel ?? "—"}
                  {reunionSong.detail ? ` · ${reunionSong.detail}` : null}
                </span>
              ) : artistsBack && artistsBack.items.length > 0 ? (
                `${artistsBack.items.length} artists also came back this month`
              ) : undefined
            }
          />
        )}

        {/* 10 — share finale (holds; user advances) */}
        <section
          data-scrapped-slide
          data-wrapped-tone="slate"
          className="relative flex h-[calc(100dvh-3.75rem)] min-h-[calc(100dvh-3.75rem)] w-full min-w-full shrink-0 snap-start snap-always flex-col items-center justify-center bg-[var(--wrapped-canvas)] px-6 py-20 text-[var(--wrapped-ink)] md:px-10"
          aria-hidden={active !== FINALE_INDEX}
        >
          <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-5">
            <motion.p
              className="text-center font-sans text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold tracking-[-0.03em]"
              initial={false}
              animate={
                active === FINALE_INDEX
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: reduceMotion ? 0.85 : 0,
                      y: reduceMotion ? 0 : 14,
                    }
              }
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              That’s your Scrapped.
            </motion.p>
            <motion.p
              className="max-w-sm text-center text-[1.05rem] leading-relaxed text-[var(--wrapped-muted)]"
              initial={false}
              animate={
                active === FINALE_INDEX
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: reduceMotion ? 0.85 : 0,
                      y: reduceMotion ? 0 : 14,
                    }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: active === FINALE_INDEX && !reduceMotion ? 0.14 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Screenshot the receipt. Soft-launch the chaos.
            </motion.p>
            <ShareRecapCard
              year={report.year}
              title="Scrapped"
              subtitle="Songs you ghosted · artists on sabbatical"
              leftLabel="Left on read"
              rightLabel="On sabbatical"
              tagline="Taste is a situationship."
              brandLine="Scrapped · Anti-Wrapped"
              variant="receipt"
              active={active === FINALE_INDEX}
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
            <p className="text-center text-sm text-[var(--wrapped-muted)]">
              Affinity windows only — not true skips
            </p>
          </div>
        </section>
      </div>

      <DeckSoundtrack
        uri={soundtrackUri}
        preloadUris={soundtrackPreload}
        enabled={soundOn && !paused}
        showToggle={false}
        className="z-30"
      />

      <button
        type="button"
        aria-label="Previous slide"
        disabled={active <= 0}
        onClick={() => goTo(active - 1)}
        className="absolute inset-y-0 left-0 z-[5] w-[18%] disabled:pointer-events-none md:w-[14%]"
      />
      <button
        type="button"
        aria-label="Next slide"
        disabled={active >= FINALE_INDEX}
        onClick={() => goTo(active + 1)}
        className="absolute inset-y-0 right-0 z-[5] w-[18%] disabled:pointer-events-none md:w-[14%]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--wrapped-ink)]/15 bg-[var(--wrapped-canvas)]/90 px-3 py-2 backdrop-blur-sm">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => goTo(active - 1)}
            disabled={active <= 0}
            className="pressable text-[var(--wrapped-ink)] hover:bg-[var(--wrapped-ink)]/10 hover:text-[var(--wrapped-ink)]"
            aria-label="Previous slide"
          >
            <Icon icon={chevronBackOutline} className="size-4" />
          </Button>
          <span className="min-w-[3.5rem] text-center font-mono text-xs tabular-nums text-[var(--wrapped-muted)]">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(SLIDE_COUNT).padStart(2, "0")}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => goTo(active + 1)}
            disabled={active >= FINALE_INDEX}
            className="pressable text-[var(--wrapped-ink)] hover:bg-[var(--wrapped-ink)]/10 hover:text-[var(--wrapped-ink)]"
            aria-label="Next slide"
          >
            <Icon icon={chevronForwardOutline} className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
