"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
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
import { ShareRecapCard } from "@/components/scrapped/ShareRecapCard";
import { SignOutConfirmButton } from "@/components/scrapped/SignOutConfirmButton";
import { WrappedEntityList } from "@/components/scrapped/wrapped/WrappedEntityList";
import { WrappedStorySlide } from "@/components/scrapped/wrapped/WrappedStorySlide";
import { useStoryAutoplay } from "@/components/scrapped/wrapped/useStoryAutoplay";
import { Button } from "@/components/ui/button";
import {
  API_SCRAPPED_SLIDE_COUNT,
  getApiSlideSoundtrackUri,
} from "@/lib/api-scrapped-soundtrack";
import type { ApiMetricCard, ScrappedApiReport } from "@/lib/scrapped-api";
import {
  storyLineBeatDurationsMs,
  sumMs,
  type StoryCopyLines,
} from "@/lib/scrapped-story-motion";

type Props = {
  report: ScrappedApiReport;
  /** Soundtrack is hosted by ScrappedExperience (unlocked on Continue). */
  soundOn: boolean;
  artistSoundtrackUri?: string | null;
  artistSoundtrackUri2?: string | null;
  onEnableSound: () => void;
  onDisableSound: () => void;
  onPausedChange?: (paused: boolean) => void;
  onSoundtrackUriChange?: (uri: string | null) => void;
  /** Speculative hot-prime on pointerdown (no cut until navigate). */
  onSoundtrackPrimeTo?: (uri: string | null) => void;
  /**
   * Cut audio to the next act before the slide changes so the incoming scene
   * never hears both acts. No-ops when sound is off or the URI is unchanged.
   */
  onSoundtrackCutTo?: (uri: string | null) => Promise<void>;
  /**
   * Freeze scene progress while premounted under the gate so Continue can
   * reveal a warm deck without remounting on the same gesture as play().
   */
  held?: boolean;
};

const SLIDE_COUNT = API_SCRAPPED_SLIDE_COUNT;
const FINALE_INDEX = SLIDE_COUNT - 1;
/** Hold open-slide copy + progress so the soundtrack can catch up after Continue. */
const INTRO_COPY_DELAY_SEC = 0.35;
/** Stories-style: pause progress + soundtrack after this press duration (taps stay snappy). */
const HOLD_PAUSE_MS = 180;

function cardById(
  report: ScrappedApiReport,
  id: string,
): ApiMetricCard | undefined {
  return report.cards.find((c) => c.id === id);
}

/** Ghosted multi-year count from headline detail `"N of M"`. */
function ghostedCountFromDetail(detail: string | undefined): number | null {
  if (!detail) return null;
  const match = /^(\d+)/.exec(detail);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function ApiScrappedDeck({
  report,
  soundOn,
  artistSoundtrackUri = null,
  artistSoundtrackUri2 = null,
  onEnableSound,
  onDisableSound,
  onPausedChange,
  onSoundtrackUriChange,
  onSoundtrackPrimeTo,
  onSoundtrackCutTo,
  held = false,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeFillRef = useRef<HTMLDivElement | null>(null);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Locks active index during programmatic prev/next so IO can't land mid-scroll. */
  const navigatingToRef = useRef<number | null>(null);
  const navClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  const [visitKey, setVisitKey] = useState(0);
  const [pausedSticky, setPausedSticky] = useState(false);
  /** Instagram-style press-and-hold on the main tap zones (not the sticky pause button). */
  const [pressHeld, setPressHeld] = useState(false);
  const pressRef = useRef<{
    dir: -1 | 1;
    pointerId: number;
    long: boolean;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);
  const reduceMotion = useReducedMotion();
  // Open-slide gate: derive from session key vs async unlock (no sync setState in effects).
  const introSessionKey = held || active !== 0 ? null : String(visitKey);
  const [introUnlockedFor, setIntroUnlockedFor] = useState<string | null>(null);
  const introGate =
    introSessionKey != null && introUnlockedFor !== introSessionKey;
  /** Sticky button / space + press-hold — drives chrome icon and soundtrack. */
  const userPaused = pausedSticky || pressHeld;
  const paused = userPaused || held || introGate;
  const activeRef = useRef(active);

  // Match open-slide copy delay so the progress bar doesn't run on empty canvas.
  useEffect(() => {
    if (introSessionKey == null) return;
    const key = introSessionKey;
    const id = window.setTimeout(
      () => setIntroUnlockedFor(key),
      INTRO_COPY_DELAY_SEC * 1000,
    );
    return () => window.clearTimeout(id);
  }, [introSessionKey]);

  // Latest active for IO / keyboard / goTo — sync in effect only (not during render).
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const leftLongHeadline = report.headlines.find((h) => h.id === "left-long");
  const leftLongSongs = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const oneSaveArtists = cardById(report, "one-save-artists");
  const secondChance = cardById(report, "second-chance");

  const topSong = leftLongSongs?.items[0] ?? null;
  const topArtist = leftLongArtists?.items[0] ?? null;
  const reunionSong = secondChance?.items[0] ?? null;
  const likedCount = report.summary.likedCount;
  const likedThisYearCount = report.summary.likedThisYearCount;
  const longCount = report.summary.longTrackCount;
  const ghostedCount = ghostedCountFromDetail(leftLongHeadline?.detail);
  const reunionList = (secondChance?.items.length ?? 0) > 1;

  const soundtrackOpts = useMemo(
    () => ({ artistSoundtrackUri, artistSoundtrackUri2 }),
    [artistSoundtrackUri, artistSoundtrackUri2],
  );

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

  const goTo = useCallback(
    async (index: number) => {
      const root = scrollerRef.current;
      if (!root) return;
      const slides = root.querySelectorAll<HTMLElement>("[data-scrapped-slide]");
      const next = Math.min(Math.max(index, 0), slides.length - 1);
      const prev = navigatingToRef.current ?? activeRef.current;

      setPausedSticky(false);

      if (next === prev) {
        // Re-tap current scene: replay in-scene motion from the start.
        setVisitKey((k) => k + 1);
        return;
      }

      // Cut audio before the slide so the incoming scene never hears both acts.
      if (soundOn && onSoundtrackCutTo) {
        const fromUri = getApiSlideSoundtrackUri(report, prev, soundtrackOpts);
        const toUri = getApiSlideSoundtrackUri(report, next, soundtrackOpts);
        if (toUri !== fromUri) {
          await onSoundtrackCutTo(toUri);
        }
      }

      navigatingToRef.current = next;
      if (navClearTimerRef.current) clearTimeout(navClearTimerRef.current);
      // Fallback if scrollend never fires (older Safari / interrupted scroll).
      navClearTimerRef.current = setTimeout(() => {
        navigatingToRef.current = null;
      }, 900);

      setActive(next);
      setVisitKey((k) => k + 1);

      slides[next]?.scrollIntoView({
        // Instant scroll makes prev/next land on the right scene every time.
        behavior: "auto",
        inline: "start",
        block: "nearest",
      });
    },
    [soundOn, onSoundtrackCutTo, report, soundtrackOpts],
  );

  /** Hot-prime on press so cutTo can resume instantly when the click commits. */
  const primeSoundtrackFor = useCallback(
    (index: number) => {
      if (!soundOn || !onSoundtrackPrimeTo) return;
      const next = Math.min(Math.max(index, 0), SLIDE_COUNT - 1);
      const prev = navigatingToRef.current ?? activeRef.current;
      if (next === prev) return;
      const fromUri = getApiSlideSoundtrackUri(report, prev, soundtrackOpts);
      const toUri = getApiSlideSoundtrackUri(report, next, soundtrackOpts);
      if (toUri === fromUri || !toUri) return;
      onSoundtrackPrimeTo(toUri);
    },
    [soundOn, onSoundtrackPrimeTo, report, soundtrackOpts],
  );

  /**
   * Copy lines only — drives line-beat counts + reading-time durations.
   * Derived entirely from `report` so React Compiler can preserve memoization
   * (object item deps like reunionSong.label are treated as mutable).
   */
  const sceneCopyPlans = useMemo((): StoryCopyLines[][] => {
    const liked = report.summary.likedCount;
    const likedYear = report.summary.likedThisYearCount;
    const long = report.summary.longTrackCount;
    const ghosted = ghostedCountFromDetail(
      report.headlines.find((h) => h.id === "left-long")?.detail,
    );
    const hasTopSong =
      (cardById(report, "left-long-run")?.items.length ?? 0) > 0;
    const hasTopArtist =
      (cardById(report, "left-long-artists")?.items.length ?? 0) > 0;
    const secondChanceItems =
      cardById(report, "second-chance")?.items ?? [];
    const isReunionList = secondChanceItems.length > 1;
    const reunionLabel = secondChanceItems[0]?.label;
    const hasReunionSong = Boolean(reunionLabel);

    const hey = report.profileName
      ? `Hey ${report.profileName}`
      : "Hey there";
    const reunionBeats: StoryCopyLines[] = isReunionList
      ? [
          {
            headline: "Plot twist.",
            subline:
              "Not everyone stayed ghosted. A few old favorites slid back into your last four weeks.",
          },
          {
            headline: "The reunion setlist",
            subline:
              "Old multi-year favorites — or old likes — back in your 4-week tops after a gap.",
            hasSupport: true,
          },
        ]
      : [
          {
            headline: "Plot twist.",
            subline:
              "Not everyone stayed ghosted. A few old favorites slid back into your last four weeks.",
          },
          {
            headline: reunionLabel ?? "No reunions on the calendar.",
            subline: hasReunionSong
              ? "An old multi-year favorite — or an old like — that’s back in your 4-week tops after a gap."
              : "The soft launch stayed soft. For now.",
            aside: hasReunionSong
              ? "We don’t have to talk about it."
              : undefined,
            hasSupport: hasReunionSong,
          },
        ];

    return [
      [
        {
          headline: `${report.year} Scrapped`,
          subline: "Created by Alan Matias",
        },
        {
          headline: hey,
          subline:
            "Welcome to Scrapped. Songs you hated and artists you skipped.",
        },
      ],
      [
        {
          headline:
            liked > 0
              ? `You have ${liked.toLocaleString()} liked songs`
              : "You have no liked songs",
          subline:
            liked > 0
              ? "You collect songs like pokemon…"
              : "Empty shelves. Bold.",
        },
        {
          headline:
            likedYear > 0
              ? `and ${likedYear.toLocaleString()} of those were liked this year`
              : "and none of those were liked this year",
          subline: "Not bad for a collector.",
        },
      ],
      [
        {
          headline:
            long > 0
              ? `You have ${long.toLocaleString()} all-time top favorites`
              : "Your all-time favorites didn’t show up.",
          subline:
            long <= 0
              ? "Spotify didn’t return a multi-year list this time."
              : ghosted != null && ghosted > 0
                ? `And you ghosted ${ghosted.toLocaleString()} of them. Ouch.`
                : "And somehow you didn’t ghost them. Suspicious.",
        },
        { headline: "But one hurt more than the rest" },
        {
          headline: "Top ghosted song",
          subline: hasTopSong
            ? "Your highest multi-year favorite that dropped off. Why not give them another chance?"
            : "Wow — you actually still talk to your old favorites.",
        },
      ],
      [
        {
          headline: "But this wasn’t the only ghost in town",
          subline: "Call the ghostbusters or something.",
        },
        {
          headline: "Top ghosted songs",
          subline:
            "Multi-year favorites that dropped out of your recent tops.",
          hasSupport: true,
        },
      ],
      [
        { headline: "You’ve heard of one-hit wonders" },
        {
          headline: "But who are your one-like artists?",
          subline: "You liked one song from them. That’s it.",
        },
        {
          headline: "1-like artists. Oldest first.",
          subline:
            "One heart each — and they never made your current tops.",
          hasSupport: true,
        },
      ],
      [
        { headline: "Now the artists" },
        {
          headline: "Top ghosted artist",
          subline: hasTopArtist
            ? "Your highest multi-year artist who isn’t in the 6-month or 4-week tops."
            : "Your loyalty program is weirdly intact.",
        },
      ],
      [
        {
          headline: "Get the gang back together?",
          subline: "They’ll take you back",
        },
        {
          headline: "Top ghosted artists",
          subline:
            "Multi-year favorites that dropped out of your recent tops.",
          hasSupport: true,
        },
      ],
      reunionBeats,
      [
        {
          headline: "That was fun.",
          subline: "Same time next year?",
        },
      ],
      [{ headline: "Share" }],
    ];
  }, [report]);

  const beatDurationsMs = useMemo(
    () =>
      sceneCopyPlans.map((beats, scene) => {
        // Share finale: long look window; progress still fills, user advances.
        if (scene === FINALE_INDEX) {
          return [8000];
        }
        const durations = storyLineBeatDurationsMs(
          beats,
          scene === 0
            ? { copyEnterDelaySec: INTRO_COPY_DELAY_SEC }
            : undefined,
        );
        // List slides: hold final list beat +2s (ghosted songs, 1-like artists, ghosted artists).
        if (
          (scene !== 3 && scene !== 4 && scene !== 6) ||
          durations.length === 0
        ) {
          return durations;
        }
        const padded = [...durations];
        const last = padded.length - 1;
        padded[last] = (padded[last] ?? 0) + 2000;
        return padded;
      }),
    [sceneCopyPlans],
  );
  const beatCounts = useMemo(
    () => beatDurationsMs.map((d) => d.length),
    [beatDurationsMs],
  );
  const sceneDurationsMs = useMemo(
    () => beatDurationsMs.map((d) => sumMs(d)),
    [beatDurationsMs],
  );

  const { beatIndex } = useStoryAutoplay({
    active,
    visitKey,
    sceneCount: SLIDE_COUNT,
    beatCounts,
    sceneDurationsMs,
    beatDurationsMs,
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

  const togglePaused = useCallback(() => {
    setPausedSticky((p) => !p);
  }, []);

  const clearPressHold = useCallback(() => {
    const press = pressRef.current;
    if (press?.timer) clearTimeout(press.timer);
    pressRef.current = null;
    setPressHeld(false);
  }, []);

  /** Left/right story zones: short press = navigate; hold = pause until release. */
  const onZonePointerDown = useCallback(
    (dir: -1 | 1, e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      // Don't steal presses meant for chrome / the visible Spotify player.
      if (e.target !== e.currentTarget) return;
      clearPressHold();
      e.currentTarget.setPointerCapture(e.pointerId);
      pressRef.current = {
        dir,
        pointerId: e.pointerId,
        long: false,
        timer: setTimeout(() => {
          const press = pressRef.current;
          if (!press || press.pointerId !== e.pointerId) return;
          press.long = true;
          setPressHeld(true);
        }, HOLD_PAUSE_MS),
      };
    },
    [clearPressHold],
  );

  const onZonePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      if (!press || press.pointerId !== e.pointerId) return;
      const { dir, long } = press;
      clearPressHold();
      if (long) return;
      const next = activeRef.current + dir;
      if (next < 0 || next > FINALE_INDEX) return;
      // Prime on tap commit (not pointerdown) so holds never chirp the next act.
      primeSoundtrackFor(next);
      void goTo(next);
    },
    [clearPressHold, goTo, primeSoundtrackFor],
  );

  const onZonePointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      if (!press || press.pointerId !== e.pointerId) return;
      clearPressHold();
    },
    [clearPressHold],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === " ") {
        e.preventDefault();
        togglePaused();
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
  }, [goTo, togglePaused]);

  // Release hold if the tab hides mid-press.
  useEffect(() => {
    function onVis() {
      if (document.hidden) clearPressHold();
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [clearPressHold]);

  const soundtrackUri = getApiSlideSoundtrackUri(
    report,
    active,
    soundtrackOpts,
  );

  useEffect(() => {
    onSoundtrackUriChange?.(soundtrackUri);
  }, [soundtrackUri, onSoundtrackUriChange]);

  useEffect(() => {
    // User pause (sticky or hold) mutes audio. Gate `held` must not — reveal stays warm.
    onPausedChange?.(userPaused);
  }, [userPaused, onPausedChange]);

  // While held under the gate, keep slides inactive so enter motion only
  // starts once on Continue (not once hidden + again after a visitKey bump).
  const sceneMotion = (scene: number) => ({
    active: !held && active === scene,
    beatIndex: !held && active === scene ? beatIndex : 0,
    replayKey: !held && active === scene ? visitKey : 0,
  });

  return (
    <div className="wrapped-story relative min-h-dvh">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-3 pt-3 md:px-5">
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
              aria-label={userPaused ? "Resume story" : "Pause story"}
              onClick={togglePaused}
              className="size-8 rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90"
            >
              <Icon
                icon={userPaused ? playOutline : pauseOutline}
                className="size-4"
              />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="default"
              aria-label={soundOn ? "Mute soundtrack" : "Enable soundtrack"}
              disabled={!soundtrackUri}
              onClick={() => {
                if (soundOn) onDisableSound();
                else onEnableSound();
              }}
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
        className="flex h-dvh snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* 0 — year open → Hey + welcome (paired). Copy delayed for Continue audio. */}
        <WrappedStorySlide
          {...sceneMotion(0)}
          tone="paper"
          copyEnterDelaySec={INTRO_COPY_DELAY_SEC}
          beats={[
            {
              headline: (
                <>
                  {report.year}{" "}
                  <span className="italic">Scrapped</span>
                </>
              ),
              // Line beat (not footer) so it enters after the title, not with it.
              subline: "Created by Alan Matias",
              align: "center",
              display: "hero",
            },
            {
              headline: report.profileName
                ? `Hey ${report.profileName}`
                : "Hey there",
              subline:
                "Welcome to Scrapped. Songs you hated and artists you skipped.",
              align: "center",
              display: "hero",
            },
          ]}
        />

        {/* 1 — liked volume → liked this year */}
        <WrappedStorySlide
          {...sceneMotion(1)}
          tone="sand"
          beats={[
            {
              headline:
                likedCount > 0
                  ? `You have ${likedCount.toLocaleString()} liked songs`
                  : "You have no liked songs",
              subline:
                likedCount > 0
                  ? "You collect songs like pokemon…"
                  : "Empty shelves. Bold.",
              display: "hero",
            },
            {
              headline:
                likedThisYearCount > 0
                  ? `and ${likedThisYearCount.toLocaleString()} of those were liked this year`
                  : "and none of those were liked this year",
              subline: "Not bad for a collector.",
              display: "hero",
            },
          ]}
        />

        {/* 2 — favorites + ghosted → one hurt more → #1 ghosted song */}
        <WrappedStorySlide
          {...sceneMotion(2)}
          tone="blush"
          beats={[
            {
              headline:
                longCount > 0
                  ? `You have ${longCount.toLocaleString()} all-time top favorites`
                  : "Your all-time favorites didn’t show up.",
              subline:
                longCount <= 0
                  ? "Spotify didn’t return a multi-year list this time."
                  : ghostedCount != null && ghostedCount > 0
                    ? `And you ghosted ${ghostedCount.toLocaleString()} of them. Ouch.`
                    : "And somehow you didn’t ghost them. Suspicious.",
              display: "hero",
            },
            {
              headline: "But one hurt more than the rest",
              display: "hero",
            },
            {
              headline: "Top ghosted song",
              subline: topSong
                ? "Your highest multi-year favorite that dropped off. Why not give them another chance?"
                : "Wow — you actually still talk to your old favorites.",
              lead: topSong ? (
                <div className="relative aspect-square w-40 max-w-[45%] overflow-hidden rounded-sm bg-[var(--wrapped-panel)] sm:w-48">
                  {topSong.imageUrl ? (
                    <Image
                      src={topSong.imageUrl}
                      alt=""
                      fill
                      sizes="192px"
                      className="object-cover"
                      // Eager: horizontal snap + opacity enter motion break Safari lazy-load.
                      priority
                    />
                  ) : null}
                </div>
              ) : undefined,
              display: "hero",
              footer: topSong ? (
                <span>
                  <span className="font-semibold text-[var(--wrapped-ink)]">
                    {topSong.label}
                  </span>
                  {topSong.sublabel ? ` · ${topSong.sublabel}` : null}
                </span>
              ) : undefined,
            },
          ]}
        />

        {/* 3 — ghost in town → top ghosted songs list */}
        <WrappedStorySlide
          {...sceneMotion(3)}
          tone="sky"
          beats={[
            {
              headline: "But this wasn’t the only ghost in town",
              subline: "Call the ghostbusters or something.",
              display: "hero",
            },
            {
              headline: "Top ghosted songs",
              subline:
                "Multi-year favorites that dropped out of your recent tops.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(leftLongSongs?.items ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                    sublabel: item.sublabel,
                    imageUrl: item.imageUrl,
                  }))}
                  active={!held && active === 3}
                />
              ),
            },
          ]}
        />

        {/* 4 — one-hit wonders → one-like setup → one-save list */}
        <WrappedStorySlide
          {...sceneMotion(4)}
          tone="cream"
          beats={[
            {
              headline: "You’ve heard of one-hit wonders",
              display: "hero",
            },
            {
              headline: "But who are your one-like artists?",
              subline: "You liked one song from them. That’s it.",
              display: "hero",
            },
            {
              headline: "1-like artists. Oldest first.",
              subline:
                "One heart each — and they never made your current tops.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(oneSaveArtists?.items ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                    sublabel: item.detail,
                    imageUrl: item.imageUrl,
                  }))}
                  active={!held && active === 4}
                  empty="No one-like artists in this sample. Loyal, or just indecisive?"
                />
              ),
            },
          ]}
        />

        {/* 5 — Now the artists → #1 ghosted artist */}
        <WrappedStorySlide
          {...sceneMotion(5)}
          tone="sand"
          beats={[
            {
              headline: "Now the artists",
              display: "hero",
            },
            {
              headline: "Top ghosted artist",
              subline: topArtist
                ? "Your highest multi-year artist who isn’t in the 6-month or 4-week tops."
                : "Your loyalty program is weirdly intact.",
              lead: topArtist ? (
                <div className="relative aspect-square w-40 max-w-[45%] overflow-hidden rounded-sm bg-[var(--wrapped-panel)] sm:w-48">
                  {topArtist.imageUrl ? (
                    <Image
                      src={topArtist.imageUrl}
                      alt=""
                      fill
                      sizes="192px"
                      className="object-cover"
                      priority
                    />
                  ) : null}
                </div>
              ) : undefined,
              display: "hero",
              footer: topArtist ? (
                <span>
                  <span className="font-semibold text-[var(--wrapped-ink)]">
                    {topArtist.label}
                  </span>
                  {topArtist.detail ? ` · ${topArtist.detail}` : null}
                </span>
              ) : undefined,
            },
          ]}
        />

        {/* 6 — gang back together → top ghosted artists list */}
        <WrappedStorySlide
          {...sceneMotion(6)}
          tone="mist"
          beats={[
            {
              headline: "Get the gang back together?",
              subline: "They’ll take you back",
              display: "hero",
            },
            {
              headline: "Top ghosted artists",
              subline:
                "Multi-year favorites that dropped out of your recent tops.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(leftLongArtists?.items ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                    sublabel: item.detail,
                    imageUrl: item.imageUrl,
                  }))}
                  active={!held && active === 6}
                  empty="Empty sabbatical list. Touch grass? Or don’t."
                />
              ),
            },
          ]}
        />

        {/* 7 — plot twist + reunion (combined) */}
        <WrappedStorySlide
          {...sceneMotion(7)}
          tone="sage"
          beats={
            reunionList
              ? [
                  {
                    headline: "Plot twist.",
                    subline:
                      "Not everyone stayed ghosted. A few old favorites slid back into your last four weeks.",
                    display: "hero",
                  },
                  {
                    headline: "The reunion setlist",
                    subline:
                      "Old multi-year favorites — or old likes — back in your 4-week tops after a gap.",
                    display: "sentence",
                    children: (
                      <WrappedEntityList
                        items={(secondChance?.items ?? [])
                          .slice(0, 5)
                          .map((item) => ({
                            id: item.id,
                            label: item.label,
                            sublabel: item.sublabel,
                            imageUrl: item.imageUrl,
                          }))}
                        active={!held && active === 7}
                      />
                    ),
                  },
                ]
              : [
                  {
                    headline: "Plot twist.",
                    subline:
                      "Not everyone stayed ghosted. A few old favorites slid back into your last four weeks.",
                    display: "hero",
                  },
                  {
                    headline:
                      reunionSong?.label ?? "No reunions on the calendar.",
                    subline: reunionSong
                      ? "An old multi-year favorite — or an old like — that’s back in your 4-week tops after a gap."
                      : "The soft launch stayed soft. For now.",
                    aside: reunionSong
                      ? "We don’t have to talk about it."
                      : undefined,
                    display: "hero",
                    footer: reunionSong ? (
                      <span>
                        {reunionSong.sublabel ?? "—"}
                        {reunionSong.detail
                          ? ` · ${reunionSong.detail}`
                          : null}
                      </span>
                    ) : undefined,
                  },
                ]
          }
        />

        {/* 8 — soft close before share */}
        <WrappedStorySlide
          {...sceneMotion(8)}
          tone="cream"
          beats={[
            {
              headline: "That was fun.",
              subline: "Same time next year?",
              align: "center",
              display: "hero",
            },
          ]}
        />

        {/* 9 — share finale — height budget leaves room for top/bottom chrome */}
        <section
          data-scrapped-slide
          data-wrapped-tone="slate"
          className="relative flex h-dvh min-h-dvh w-full min-w-full shrink-0 snap-start snap-always flex-col overflow-hidden bg-[var(--wrapped-canvas)] px-5 pt-14 pb-[4.75rem] text-[var(--wrapped-ink)] md:px-14"
          aria-hidden={active !== FINALE_INDEX}
        >
          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-md flex-1 items-center justify-center py-1">
            <ShareRecapCard
              year={report.year}
              variant="minimal"
              active={active === FINALE_INDEX}
              leftLabel="Ghosted artists"
              rightLabel="Ghosted songs"
              heroImageUrl={topArtist?.imageUrl ?? topSong?.imageUrl ?? null}
              heroAlt={topArtist?.label ?? topSong?.label ?? ""}
              skipped={(leftLongArtists?.items ?? []).slice(0, 5).map((item) => ({
                id: item.id,
                title: item.label,
                artist: item.detail ?? "—",
              }))}
              stayed={(leftLongSongs?.items ?? []).slice(0, 5).map((item) => ({
                id: item.id,
                title: item.label,
                artist: item.sublabel ?? "—",
              }))}
            />
          </div>
        </section>
      </div>

      {/*
        Stories-style tap / hold zones above slide copy (z-10) / motion layers.
        Short press → prev/next. Hold → pause progress + soundtrack until release.
        Chrome stays higher (z-40) so pause / mute / sign-out still win.
      */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Previous slide"
        onPointerDown={(e) => onZonePointerDown(-1, e)}
        onPointerUp={onZonePointerUp}
        onPointerCancel={onZonePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-y-0 left-0 z-30 w-[30%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Next slide"
        onPointerDown={(e) => onZonePointerDown(1, e)}
        onPointerUp={onZonePointerUp}
        onPointerCancel={onZonePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-y-0 right-0 z-30 w-[70%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex items-center justify-center gap-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--wrapped-ink)]/15 bg-[var(--wrapped-canvas)]/90 px-3 py-2 backdrop-blur-sm">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onPointerDown={() => primeSoundtrackFor(active - 1)}
            onClick={() => void goTo(active - 1)}
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
            onPointerDown={() => primeSoundtrackFor(active + 1)}
            onClick={() => void goTo(active + 1)}
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
