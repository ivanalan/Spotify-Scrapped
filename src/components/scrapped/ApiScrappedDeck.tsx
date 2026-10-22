"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  arrowBackOutline,
  heart,
  pauseOutline,
  playOutline,
  refreshOutline,
  volumeHighOutline,
  volumeMuteOutline,
} from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { ShareRecapCard } from "@/components/scrapped/ShareRecapCard";
import {
  ShareFinaleLayoutTune,
  shareFinaleCssVars,
  shareFinaleTuneDefaults,
  type ShareFinaleTuneState,
} from "@/components/scrapped/ShareFinaleLayoutTune";
import { SignOutConfirmButton } from "@/components/scrapped/SignOutConfirmButton";
import { SpotifyContentCredit } from "@/components/scrapped/SpotifyContentCredit";
import { ScrappedOrbitArt } from "@/components/scrapped/orbit/ScrappedOrbitArt";
import { WrappedEntityList } from "@/components/scrapped/wrapped/WrappedEntityList";
import { WrappedStorySlide } from "@/components/scrapped/wrapped/WrappedStorySlide";
import { useStoryAutoplay } from "@/components/scrapped/wrapped/useStoryAutoplay";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  API_SCRAPPED_SLIDE_COUNT,
  getApiSlideSoundtrackUri,
} from "@/lib/api-scrapped-soundtrack";
import {
  spotifyArtistUrl,
  spotifyOpenLinkFromPoint,
  spotifyTrackUrl,
} from "@/lib/spotify/open-url";
import { cn } from "@/lib/utils";
import {
  SHARE_FINALE_DENSITY as D,
  SLIDE_ART_PATTERN,
  slideTone,
} from "@/lib/scrapped-card-palette";
import {
  captureShareCardBlob,
  shareCardImage,
} from "@/lib/share-card-export";
import {
  leftLongGhostedCount,
  type ApiMetricCard,
  type ScrappedApiReport,
} from "@/lib/scrapped-api";
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
  /** Abort speculative prime when a press is cancelled before navigate. */
  onSoundtrackCancelPrime?: () => void;
  /**
   * Cut audio to the next act in parallel with the slide change. No-ops when
   * sound is off or the URI is unchanged. Do not await before setActive.
   */
  onSoundtrackCutTo?: (uri: string | null) => Promise<void>;
  /**
   * Freeze scene progress while premounted under the gate so Continue can
   * reveal a warm deck without remounting on the same gesture as play().
   */
  held?: boolean;
  /**
   * Hardware media keys pause Spotify’s embed, not our keydown handler.
   * Parent wires DeckSoundtrack external pause/resume into these controls.
   */
  pauseApiRef?: MutableRefObject<ApiScrappedPauseApi | null>;
  /**
   * `walkthrough`: back (left) to About; no sign-out X (D-024).
   * Default `session` keeps pause / volume / sign-out.
   */
  chromeMode?: "session" | "walkthrough";
  /** Used when `chromeMode="walkthrough"`. */
  backHref?: string;
};

export type ApiScrappedPauseApi = {
  /** Sticky-pause story + soundtrack (same as spacebar pause). */
  pauseStory: () => void;
  /** Clear sticky pause (same as spacebar resume). */
  resumeStory: () => void;
};

const SLIDE_COUNT = API_SCRAPPED_SLIDE_COUNT;
const FINALE_INDEX = SLIDE_COUNT - 1;
/** Hold open-slide copy + progress so the soundtrack can catch up after Continue. */
const INTRO_COPY_DELAY_SEC = 0.35;
/**
 * Cancel speculative next-act prime after this hold (audio only: no story pause).
 * Short taps clear the timer on pointerup and keep the hot buffer for cutTo.
 */
const PRIME_HOLD_CANCEL_MS = 200;

function cardById(
  report: ScrappedApiReport,
  id: string,
): ApiMetricCard | undefined {
  return report.cards.find((c) => c.id === id);
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
  chromeMode = "session",
  backHref = "/about",
  onSoundtrackCancelPrime,
  onSoundtrackCutTo,
  held = false,
  pauseApiRef,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeFillRef = useRef<HTMLDivElement | null>(null);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const shareExportInFlightRef = useRef(false);
  /** Pre-captured finale PNG: keeps iOS `navigator.share` inside the tap gesture. */
  const sharePrecaptureRef = useRef<Blob | null>(null);
  /** Locks active index during programmatic prev/next so IO can't land mid-scroll. */
  const navigatingToRef = useRef<number | null>(null);
  const navClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Cancels speculative prime if the zone press becomes a hold (not a tap). */
  const primeHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  const [visitKey, setVisitKey] = useState(0);
  const [pausedSticky, setPausedSticky] = useState(false);
  const [shareExportBusy, setShareExportBusy] = useState(false);
  const [sharePrecaptureReady, setSharePrecaptureReady] = useState(false);
  const [shareTuneEnabled, setShareTuneEnabled] = useState(false);
  const [shareTune, setShareTune] = useState<ShareFinaleTuneState>(
    shareFinaleTuneDefaults,
  );
  const reduceMotion = useReducedMotion();

  // On-story layout panel: `/scrapped?tune=share` (keeps production Share clean).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShareTuneEnabled(params.get("tune") === "share");
  }, []);
  // Open-slide gate: derive from session key vs async unlock (no sync setState in effects).
  const introSessionKey = held || active !== 0 ? null : String(visitKey);
  const [introUnlockedFor, setIntroUnlockedFor] = useState<string | null>(null);
  const introGate =
    introSessionKey != null && introUnlockedFor !== introSessionKey;
  /** Sticky pause button / space: drives chrome icon and soundtrack. */
  const userPaused = pausedSticky;
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

  // Latest active for IO / keyboard / goTo: sync in effect only (not during render).
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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
  const ghostedCount = leftLongGhostedCount(report);
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
    (index: number) => {
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

      // Cut audio in parallel: never block the story on Spotify cutover.
      if (soundOn && onSoundtrackCutTo) {
        const fromUri = getApiSlideSoundtrackUri(report, prev, soundtrackOpts);
        const toUri = getApiSlideSoundtrackUri(report, next, soundtrackOpts);
        if (toUri !== fromUri) {
          void onSoundtrackCutTo(toUri);
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

  /** Hot-prime on pointerdown so cutTo can resume when the tap commits. */
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

  const cancelSoundtrackPrime = useCallback(() => {
    onSoundtrackCancelPrime?.();
  }, [onSoundtrackCancelPrime]);

  /**
   * Copy lines only: drives line-beat counts + reading-time durations.
   * Derived entirely from `report` so React Compiler can preserve memoization
   * (object item deps like reunionSong.label are treated as mutable).
   */
  const sceneCopyPlans = useMemo((): StoryCopyLines[][] => {
    const liked = report.summary.likedCount;
    const likedYear = report.summary.likedThisYearCount;
    const long = report.summary.longTrackCount;
    const ghosted = leftLongGhostedCount(report);
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
            subline: "Not everyone stayed ghosted.",
          },
          {
            headline: "The reunion setlist",
            subline: "A few old favs you were loyal to",
            hasSupport: true,
          },
        ]
      : [
          {
            headline: "Plot twist.",
            subline: "Not everyone stayed ghosted.",
          },
          {
            headline: reunionLabel ?? "No reunions on the calendar.",
            subline: hasReunionSong
              ? "A few old favs you were loyal to"
              : "The soft launch stayed soft. For now.",
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
          subline: "This is for the ones you ghosted.",
        },
      ],
      [
        {
          headline:
            liked > 0
              ? `${liked.toLocaleString()} songs in your Liked list`
              : "No songs in your Liked list",
          subline:
            liked > 0
              ? "That's not a pond. That's an ocean."
              : "Empty pond. Bold.",
        },
        {
          headline:
            likedYear > 0
              ? `${likedYear.toLocaleString()} new songs joined this year`
              : "No new songs joined this year",
          subline:
            likedYear > 0
              ? "...and the tide just kept rising."
              : "Quiet tide for the heart button.",
        },
      ],
      [
        {
          headline:
            long <= 0
              ? "All time favs didn’t show up."
              : ghosted != null && ghosted > 0
                ? `${ghosted.toLocaleString()} all time favs got ghosted`
                : "No all time favs got ghosted",
          subline:
            long <= 0
              ? "Spotify didn’t return a multi year list this time."
              : ghosted != null && ghosted > 0
                ? `Out of ${long.toLocaleString()}. Rough ratio.`
                : `Out of ${long.toLocaleString()}. Suspicious.`,
        },
        {
          headline: "One of them stings the most",
        },
        {
          headline: "Most ghosted song",
          subline: hasTopSong
            ? "A multi year fav that fell out of the recent rotation."
            : "Wow. You actually still talk to your old favs.",
        },
      ],
      [
        {
          headline: "It wasn’t a one ghost town",
          subline: "A few more favs went quiet.",
        },
        {
          headline: "Your ghosted songs",
          subline: "Multi year favs missing from your recent tops.",
          hasSupport: true,
        },
      ],
      [
        { headline: "You’ve heard of one hit wonders." },
        {
          headline: "Meet your 1 like artists",
          subline: "You liked a single track and never looked back.",
        },
        {
          headline: "1 like artists",
          subline: "Artists with only one song saved.",
          hasSupport: true,
        },
      ],
      [
        {
          headline: "Artists you left on read.",
          subline: "Or would it be left on listened?",
        },
        {
          headline: "Top artist left on read",
          subline: hasTopArtist
            ? "Highest multi year fav missing from latest activity."
            : "Your loyalty program is weirdly intact.",
        },
      ],
      [
        {
          headline: "Get the gang back together?",
          subline: "They’ll take you back.",
        },
        {
          headline: "Top artists you left on read",
          subline: "Highest multi year favs missing from latest activity.",
          hasSupport: true,
        },
      ],
      reunionBeats,
      [
        { headline: "Thanks for staying." },
        { headline: "Same time next year?" },
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
        // List slides: hold final list beat +2s (ghosted songs, 1-like artists, left-on-read artists).
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
  // back because the VDOM style never changed: force-clear future segments.
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

  useEffect(() => {
    if (!pauseApiRef) return;
    pauseApiRef.current = {
      pauseStory: () => setPausedSticky(true),
      resumeStory: () => setPausedSticky(false),
    };
    return () => {
      pauseApiRef.current = null;
    };
  }, [pauseApiRef]);

  const clearPrimeHoldTimer = useCallback(() => {
    if (primeHoldTimerRef.current != null) {
      clearTimeout(primeHoldTimerRef.current);
      primeHoldTimerRef.current = null;
    }
  }, []);

  /** Left/right story zones: tap = prev/next. Pause is sticky button / space only. */
  const onZonePointerDown = useCallback(
    (dir: -1 | 1, e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      // Don't steal presses meant for chrome / the visible Spotify player.
      if (e.target !== e.currentTarget) return;
      clearPrimeHoldTimer();
      const next = activeRef.current + dir;
      // Prime early so cutTo can resume hot when the tap commits.
      if (next >= 0 && next <= FINALE_INDEX) {
        primeSoundtrackFor(next);
        // Long hold: kill the speculative chirp (do not pause the story).
        primeHoldTimerRef.current = setTimeout(() => {
          primeHoldTimerRef.current = null;
          cancelSoundtrackPrime();
        }, PRIME_HOLD_CANCEL_MS);
      }
    },
    [primeSoundtrackFor, cancelSoundtrackPrime, clearPrimeHoldTimer],
  );

  const onZoneClick = useCallback(
    (dir: -1 | 1, e?: ReactMouseEvent<HTMLButtonElement>) => {
      clearPrimeHoldTimer();
      // Zones paint above covers/rows; open Spotify when the tap is over a link.
      if (e) {
        const spotifyLink = spotifyOpenLinkFromPoint(e.clientX, e.clientY);
        if (spotifyLink) {
          cancelSoundtrackPrime();
          window.open(spotifyLink.href, "_blank", "noopener,noreferrer");
          return;
        }
      }
      const next = activeRef.current + dir;
      if (next < 0 || next > FINALE_INDEX) return;
      goTo(next);
    },
    [goTo, clearPrimeHoldTimer, cancelSoundtrackPrime],
  );

  const onZonePointerUp = useCallback(() => {
    // Tap path: keep the hot prime for the click → cutTo that follows.
    clearPrimeHoldTimer();
  }, [clearPrimeHoldTimer]);

  const onZonePointerCancel = useCallback(() => {
    clearPrimeHoldTimer();
    cancelSoundtrackPrime();
  }, [cancelSoundtrackPrime, clearPrimeHoldTimer]);

  useEffect(() => () => clearPrimeHoldTimer(), [clearPrimeHoldTimer]);

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

  // Tab / app background: sticky-pause story + audio; stay paused on return (D-031).
  useEffect(() => {
    function onVis() {
      if (!document.hidden) return;
      clearPrimeHoldTimer();
      cancelSoundtrackPrime();
      setPausedSticky(true);
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [cancelSoundtrackPrime, clearPrimeHoldTimer]);

  const soundtrackUri = getApiSlideSoundtrackUri(
    report,
    active,
    soundtrackOpts,
  );

  useEffect(() => {
    onSoundtrackUriChange?.(soundtrackUri);
  }, [soundtrackUri, onSoundtrackUriChange]);

  useEffect(() => {
    // Sticky user pause mutes audio. Gate `held` must not; reveal stays warm.
    onPausedChange?.(userPaused);
  }, [userPaused, onPausedChange]);

  // While held under the gate, keep slides inactive so enter motion only
  // starts once on Continue (not once hidden + again after a visitKey bump).
  const sceneMotion = (scene: number) => ({
    active: !held && active === scene,
    beatIndex: !held && active === scene ? beatIndex : 0,
    replayKey: !held && active === scene ? visitKey : 0,
  });

  const orbitChrome = (scene: number) => {
    const pattern = SLIDE_ART_PATTERN[scene];
    if (!pattern) return undefined;
    // Volume scene: 2 narrative beats × (headline+subline) → joined beat at phase ≥ 2
    // Share (D-014): intro disks + star on ink stage behind the inset card.
    const tide =
      pattern === "volume" && !held && active === scene && beatIndex >= 2
        ? "high"
        : "low";
    const beatPhase = !held && active === scene ? beatIndex : 0;
    return (
      <ScrappedOrbitArt
        slideIndex={scene}
        pattern={pattern}
        active={!held && active === scene}
        replayKey={!held && active === scene ? visitKey : 0}
        tide={tide}
        fishCount={pattern === "volume" ? likedThisYearCount : 0}
        beatPhase={beatPhase}
      />
    );
  };

  // Chrome (wordmark / progress / controls) follows the active slide’s theme.
  // Scene 7 setup: film letterbox covers the toolbar: force ink (light
  // glyphs) so Scrapped / progress read on the black bars (D-016). Bars stay
  // through title + subline (phases 0..1); retract starts with list/reveal (≥2).
  const chromeTone =
    active === 7 && beatIndex < 2 ? "ink" : slideTone(active);

  // Warm the share PNG while the finale is idle so Share can call
  // navigator.share synchronously enough for iOS WebKit's user-gesture gate.
  useEffect(() => {
    if (active !== FINALE_INDEX || held) {
      sharePrecaptureRef.current = null;
      setSharePrecaptureReady(false);
      return;
    }
    let cancelled = false;
    setSharePrecaptureReady(false);
    const timer = window.setTimeout(() => {
      const node = shareCardRef.current;
      if (!node) return;
      void captureShareCardBlob(node)
        .then((blob) => {
          if (cancelled) return;
          sharePrecaptureRef.current = blob;
          setSharePrecaptureReady(true);
        })
        .catch(() => {
          // Leave unready: tap still tries on-demand capture (desktop OK).
        });
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, held, visitKey, report.year, shareTune]);

  const onShareFinale = useCallback(async () => {
    const node = shareCardRef.current;
    if (!node || shareExportInFlightRef.current) return;
    shareExportInFlightRef.current = true;
    setShareExportBusy(true);
    try {
      await shareCardImage(node, {
        fileName: `myscrapped-${report.year}.png`,
        blob: sharePrecaptureRef.current ?? undefined,
      });
    } catch {
      // Capture / share failed: no toast surface yet. AbortError is handled inside.
    } finally {
      shareExportInFlightRef.current = false;
      setShareExportBusy(false);
    }
  }, [report.year]);

  const onReplayFromBeginning = useCallback(() => {
    goTo(0);
  }, [goTo]);

  const shareFinaleStyle = useMemo(
    () => shareFinaleCssVars(shareTune),
    [shareTune],
  );
  const shareBrandTune = useMemo(
    () => ({
      sizeRem: shareTune.brandSizeRem,
      letterSpacingEm: shareTune.brandLetterSpacingEm,
    }),
    [shareTune.brandSizeRem, shareTune.brandLetterSpacingEm],
  );

  return (
    <div
      className="wrapped-story relative min-h-dvh"
      data-wrapped-tone={chromeTone}
    >
      {/* Ghosted list moon (D-018 C8): ink scrim so chrome stays readable */}
      {active === 3 ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[39] h-[4.5rem]"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--wrapped-canvas) 92%, transparent) 0%, color-mix(in oklab, var(--wrapped-canvas) 55%, transparent) 55%, transparent 100%)",
          }}
          aria-hidden
        />
      ) : null}

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
          <div className="pointer-events-auto flex items-center gap-1.5">
            {chromeMode === "walkthrough" ? (
              <Link
                href={backHref}
                aria-label="Back to About"
                className={cn(
                  buttonVariants({ variant: "default", size: "icon" }),
                  "rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90",
                )}
              >
                <Icon icon={arrowBackOutline} className="size-4" />
              </Link>
            ) : null}
            <p className="font-sans text-sm font-semibold italic tracking-tight text-[var(--wrapped-ink)]">
              Scrapped
            </p>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="default"
              aria-label={userPaused ? "Resume story" : "Pause story"}
              onClick={togglePaused}
              className="rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90"
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
              className="rounded-full bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90 disabled:opacity-40"
            >
              <Icon
                icon={soundOn ? volumeHighOutline : volumeMuteOutline}
                className="size-4"
              />
            </Button>
            {chromeMode === "session" ? <SignOutConfirmButton /> : null}
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex h-dvh snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* 0: year open → Hey + welcome (paired). Copy delayed for Continue audio. */}
        <WrappedStorySlide
          {...sceneMotion(0)}
          tone={slideTone(0)}
          chrome={orbitChrome(0)}
          copyEnterDelaySec={INTRO_COPY_DELAY_SEC}
          field="intro-dusk"
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
              subline: "This is for the ones you ghosted.",
              align: "center",
              display: "hero",
            },
          ]}
        />

        {/* 1: liked volume → liked this year */}
        <WrappedStorySlide
          {...sceneMotion(1)}
          tone={slideTone(1)}
          chrome={orbitChrome(1)}
          beats={[
            {
              headline:
                likedCount > 0
                  ? `${likedCount.toLocaleString()} songs in your Liked list`
                  : "No songs in your Liked list",
              subline:
                likedCount > 0
                  ? "That's not a pond. That's an ocean."
                  : "Empty pond. Bold.",
              display: "hero",
            },
            {
              headline:
                likedThisYearCount > 0
                  ? `${likedThisYearCount.toLocaleString()} new songs joined this year`
                  : "No new songs joined this year",
              subline:
                likedThisYearCount > 0
                  ? "...and the tide just kept rising."
                  : "Quiet tide for the heart button.",
              display: "hero",
            },
          ]}
        />

        {/* 2: ghosted ratio → one stings → #1 ghosted song */}
        <WrappedStorySlide
          {...sceneMotion(2)}
          tone={slideTone(2)}
          chrome={orbitChrome(2)}
          beats={[
            {
              headline:
                longCount <= 0
                  ? "All time favs didn’t show up."
                  : ghostedCount != null && ghostedCount > 0
                    ? `${ghostedCount.toLocaleString()} all time favs got ghosted`
                    : "No all time favs got ghosted",
              subline:
                longCount <= 0
                  ? "Spotify didn’t return a multi year list this time."
                  : ghostedCount != null && ghostedCount > 0
                    ? `Out of ${longCount.toLocaleString()}. Rough ratio.`
                    : `Out of ${longCount.toLocaleString()}. Suspicious.`,
              display: "hero",
            },
            {
              headline: "One of them stings the most",
              align: "center",
              display: "hero",
            },
            {
              headline: "Most ghosted song",
              subline: topSong
                ? "A multi year fav that fell out of the recent rotation."
                : "Wow. You actually still talk to your old favs.",
              lead: topSong ? (
                <a
                  href={spotifyTrackUrl(topSong.trackId ?? topSong.id)}
                  data-spotify-open=""
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${topSong.label} on Spotify`}
                  className="relative mx-auto block size-[160px] shrink-0 overflow-hidden rounded-sm bg-[var(--wrapped-panel)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--wrapped-ink)]"
                >
                  {topSong.imageUrl ? (
                    <Image
                      src={topSong.imageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                      // Eager: horizontal snap + opacity enter motion break Safari lazy-load.
                      priority
                    />
                  ) : null}
                </a>
              ) : undefined,
              align: "center",
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

        {/* 3: one ghost town → top ghosted songs list */}
        <WrappedStorySlide
          {...sceneMotion(3)}
          tone={slideTone(3)}
          chrome={orbitChrome(3)}
          beats={[
            {
              headline: "It wasn’t a one ghost town",
              subline: "A few more favs went quiet.",
              display: "hero",
            },
            {
              headline: "Your ghosted songs",
              subline: "Multi year favs missing from your recent tops.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(leftLongSongs?.items ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                    sublabel: item.sublabel,
                    imageUrl: item.imageUrl,
                    href: spotifyTrackUrl(item.trackId ?? item.id),
                  }))}
                  active={!held && active === 3}
                  showSpotifyCredit
                />
              ),
            },
          ]}
        />

        {/* 4: one hit wonders → 1 like setup → one-save list */}
        <WrappedStorySlide
          {...sceneMotion(4)}
          tone={slideTone(4)}
          chrome={orbitChrome(4)}
          field="one-like-nest"
          beats={[
            {
              headline: "You’ve heard of 1 hit wonders.",
              display: "hero",
            },
            {
              headline: "Meet your 1 like artists",
              subline: "You liked a single track and never looked back.",
              display: "hero",
            },
            {
              headline: "1 like artists",
              subline: "Artists with only 1 song saved.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(oneSaveArtists?.items ?? []).map((item) => ({
                    id: item.id,
                    // Migrated by ensureApiReportSummary → label=song, sublabel=artist.
                    label: item.label,
                    sublabel: (
                      <span className="inline-flex max-w-full items-center gap-2">
                        <span className="truncate">
                          {item.sublabel ?? "—"}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <Icon icon={heart} className="size-3" />
                          {item.value === 0
                            ? "today"
                            : `${item.value.toLocaleString()}d ago`}
                        </span>
                      </span>
                    ),
                    imageUrl: item.imageUrl,
                    href: item.trackId
                      ? spotifyTrackUrl(item.trackId)
                      : spotifyArtistUrl(item.id),
                  }))}
                  active={!held && active === 4}
                  showSpotifyCredit
                  empty="No 1 like artists in this sample. Loyal, or just indecisive?"
                />
              ),
            },
          ]}
        />

        {/* 5: left on read → #1 left-on-read artist */}
        <WrappedStorySlide
          {...sceneMotion(5)}
          tone={slideTone(5)}
          chrome={orbitChrome(5)}
          beats={[
            {
              headline: "Artists you left on read.",
              subline: "Or would it be left on listened?",
              display: "hero",
            },
            {
              headline: "Top artist left on read",
              subline: topArtist
                ? "Highest multi year fav missing from latest activity."
                : "Your loyalty program is weirdly intact.",
              lead: topArtist ? (
                <a
                  href={spotifyArtistUrl(topArtist.id)}
                  data-spotify-open=""
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${topArtist.label} on Spotify`}
                  className="relative mx-auto block size-[160px] shrink-0 overflow-hidden rounded-sm bg-[var(--wrapped-panel)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--wrapped-ink)]"
                >
                  {topArtist.imageUrl ? (
                    <Image
                      src={topArtist.imageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                      priority
                    />
                  ) : null}
                </a>
              ) : undefined,
              align: "center",
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

        {/* 6: gang back together → top left-on-read artists list */}
        <WrappedStorySlide
          {...sceneMotion(6)}
          tone={slideTone(6)}
          chrome={orbitChrome(6)}
          beats={[
            {
              headline: "Get the gang back together?",
              subline: "They’ll take you back.",
              display: "hero",
            },
            {
              headline: "Top artists you left on read",
              subline:
                "Highest multi year favs missing from latest activity.",
              display: "sentence",
              children: (
                <WrappedEntityList
                  items={(leftLongArtists?.items ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                    sublabel: item.detail,
                    imageUrl: item.imageUrl,
                    href: spotifyArtistUrl(item.id),
                  }))}
                  active={!held && active === 6}
                  showSpotifyCredit
                  empty="Empty sabbatical list. Touch grass? Or don’t."
                />
              ),
            },
          ]}
        />

        {/* 7: plot twist + reunion (combined) */}
        <WrappedStorySlide
          {...sceneMotion(7)}
          tone={slideTone(7)}
          chrome={orbitChrome(7)}
          beats={
            reunionList
              ? [
                  {
                    headline: "Plot twist.",
                    subline: "Not everyone stayed ghosted.",
                    display: "hero",
                  },
                  {
                    headline: "The reunion setlist",
                    subline: "A few old favs you were loyal to",
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
                            href: spotifyTrackUrl(item.trackId ?? item.id),
                          }))}
                        active={!held && active === 7}
                        showSpotifyCredit
                      />
                    ),
                  },
                ]
              : [
                  {
                    headline: "Plot twist.",
                    subline: "Not everyone stayed ghosted.",
                    display: "hero",
                  },
                  {
                    headline:
                      reunionSong?.label ?? "No reunions on the calendar.",
                    subline: reunionSong
                      ? "A few old favs you were loyal to"
                      : "The soft launch stayed soft. For now.",
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

        {/* 8: soft close before share (two beats) */}
        <WrappedStorySlide
          {...sceneMotion(8)}
          tone={slideTone(8)}
          chrome={orbitChrome(8)}
          beats={[
            {
              headline: "Thanks for staying.",
              align: "center",
              display: "hero",
            },
            {
              headline: "Same time next year?",
              align: "center",
              display: "hero",
            },
          ]}
        />

        {/* 9: share finale: ink stage + intro chrome + teal card (D-012 / D-033) */}
        <section
          data-scrapped-slide
          data-wrapped-tone={slideTone(9)}
          className="relative flex h-dvh min-h-dvh w-full min-w-full shrink-0 snap-start snap-always flex-col overflow-hidden bg-[var(--wrapped-canvas)] text-[var(--wrapped-ink)]"
          style={shareFinaleStyle}
          aria-hidden={active !== FINALE_INDEX}
        >
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {orbitChrome(9)}
          </div>
          {shareTuneEnabled && active === FINALE_INDEX ? (
            <ShareFinaleLayoutTune
              tune={shareTune}
              onChange={setShareTune}
              onReset={() => setShareTune(shareFinaleTuneDefaults())}
            />
          ) : null}
          <div
            className="relative z-10 mx-auto flex min-h-0 w-full flex-1 flex-col"
            style={{
              gap: `${D.cardActionsGapPx}px`,
              // Match Share / Replay column to the capped 9:16 island (D-012).
              maxWidth: `${shareTune.maxWidthPx}px`,
            }}
          >
            {/*
              9:16 island (D-012 / D-033): shell sizes to the slot; inner capture
              node is a fixed design canvas (maxWidthPx × designHeightPx) scaled
              uniformly so type and spacing match every viewport. Export captures
              the unscaled design node → ~1080×1920.
            */}
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center [container-type:size]">
              <div
                className="relative overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] [container-type:size]"
                style={{
                  aspectRatio: D.aspectRatio,
                  width: `min(100cqi, calc(100cqb * 9 / 16), ${shareTune.maxWidthPx}px)`,
                  height: "auto",
                  borderRadius: "var(--share-card-radius, 0px)",
                }}
              >
                {/*
                  Scaler fits the fixed design canvas into the shell.
                  Capture ref stays on the unscaled poster so export is
                  always designWidth → exportWidthPx (~1080).
                */}
                <div
                  className="absolute top-0 left-0 origin-top-left"
                  style={{
                    width: D.maxWidthPx,
                    height: D.designHeightPx,
                    transform: `scale(calc(100cqw / ${D.maxWidthPx}))`,
                  }}
                >
                  <div
                    ref={shareCardRef}
                    className="h-full w-full"
                    style={{
                      width: D.maxWidthPx,
                      height: D.designHeightPx,
                    }}
                  >
                    <ShareRecapCard
                      year={report.year}
                      variant="minimal"
                      active={active === FINALE_INDEX}
                      leftLabel="Left on read"
                      rightLabel="Ghosted songs"
                      likedCount={likedCount}
                      likedThisYearCount={likedThisYearCount}
                      moonTune={shareTune.moon}
                      ghostTune={shareTune.ghosts}
                      brandTune={shareBrandTune}
                      heroImageUrl={
                        topArtist?.imageUrl ?? topSong?.imageUrl ?? null
                      }
                      heroAlt={topArtist?.label ?? topSong?.label ?? ""}
                      skipped={(leftLongArtists?.items ?? []).slice(0, 5).map(
                        (item) => ({
                          id: item.id,
                          title: item.label,
                          artist: item.detail ?? "—",
                        }),
                      )}
                      stayed={(leftLongSongs?.items ?? []).slice(0, 5).map(
                        (item) => ({
                          id: item.id,
                          title: item.label,
                          artist: item.sublabel ?? "—",
                        }),
                      )}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
              <SpotifyContentCredit className="mt-2 w-full shrink-0 text-center" />
            </div>

            <div
              className="relative z-40 flex shrink-0 flex-col"
              style={{ gap: `${D.actionsGapPx}px` }}
            >
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full rounded-full border-0 bg-[#f5f5f5] font-bold text-[#1c1c1c] hover:bg-[#f5f5f5]/90 disabled:opacity-70"
                disabled={shareExportBusy || !sharePrecaptureReady}
                aria-busy={shareExportBusy || !sharePrecaptureReady}
                onClick={() => void onShareFinale()}
              >
                {shareExportBusy
                  ? "Sharing…"
                  : sharePrecaptureReady
                    ? "Share"
                    : "Preparing…"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="gap-2 text-[0.82rem] font-semibold text-[var(--wrapped-ink)] hover:bg-transparent hover:text-[var(--wrapped-ink)] hover:opacity-100 opacity-90"
                onClick={onReplayFromBeginning}
              >
                <Icon
                  icon={refreshOutline}
                  className="size-[1.125rem] shrink-0"
                  aria-hidden
                />
                Replay from beginning
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/*
        Stories-style tap zones above slide copy (z-10) and list beats (z-35).
        Tap → prev/next (including over list rows). Pause is sticky button / space.
        Long press cancels speculative soundtrack prime only (no hold-pause).
        Chrome stays higher (z-40) so pause / mute / sign-out still win.
        Finale: leave bottom clear so Share / Replay receive taps.
      */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Previous slide"
        onPointerDown={(e) => onZonePointerDown(-1, e)}
        onPointerUp={onZonePointerUp}
        onClick={(e) => onZoneClick(-1, e)}
        onPointerCancel={onZonePointerCancel}
        className={
          active === FINALE_INDEX
            ? "absolute top-0 bottom-36 left-0 z-[36] w-[30%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
            : "absolute inset-y-0 left-0 z-[36] w-[30%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
        }
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Next slide"
        onPointerDown={(e) => onZonePointerDown(1, e)}
        onPointerUp={onZonePointerUp}
        onClick={(e) => onZoneClick(1, e)}
        onPointerCancel={onZonePointerCancel}
        className={
          active === FINALE_INDEX
            ? "absolute top-0 bottom-36 left-[30%] z-[36] w-[70%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
            : "absolute inset-y-0 left-[30%] z-[36] w-[70%] touch-manipulation select-none outline-none focus:outline-none focus-visible:outline-none"
        }
      />
    </div>
  );
}
