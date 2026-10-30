"use client";

import {
  forwardRef,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import type { ScrappedReport } from "@/lib/scrapped";
import {
  removeWarmLeadWrapper,
  SPOTIFY_EMBED_API_SRC,
  takeWarmLead,
} from "@/lib/spotify-embed-api";
import {
  shortUri,
  soundtrackDebug,
} from "@/lib/soundtrackDebug";
import { cn } from "@/lib/utils";

/** Call from a click handler so Safari/Chrome allow Spotify embed playback. */
export type DeckSoundtrackHandle = {
  playFromUserGesture: () => void;
  /**
   * Gate-only: play the lead until audible, then pause near START_AT_SEC.
   * Spotify has no mute: this is the “pre-roll then unmute” stand-in.
   * Call from Continue pointerdown; playFromUserGesture resume()s the hot buffer.
   */
  armLeadFromGesture: () => void;
  /**
   * Re-issue resume() on whichever embed owns audio. Call inside a real tap:
   * the embed can report playback_started on iOS/Chrome while sound is still
   * blocked because the original play() ran outside a gesture.
   */
  nudgeFromGesture: () => void;
  /** Sync read: true when the lead URI has produced audio (not React-warm lag). */
  isLeadAudible: () => boolean;
  /**
   * Speculatively start the next act, then pause it once audible so the
   * current track stays solo. Call from pointerdown; follow with cutTo on navigate.
   */
  primeTo: (uri: string | null) => void;
  /**
   * Abort an in-flight speculative prime (and any hot-primed next act).
   * Call when a press is cancelled before navigate so the chirp does not linger.
   */
  cancelPrime: () => void;
  /**
   * Make uri exclusively own audio (resumes a hot prime when possible) and
   * resolve when the cut is done. Fire alongside the slide change: do not
   * block story advance on this promise.
   */
  cutTo: (uri: string | null) => Promise<void>;
};

export type SoundtrackWarmState = {
  ready: number;
  total: number;
  allReady: boolean;
  /** Lead embed is primed at START_AT_SEC and can play() without a cold start. */
  leadReady: boolean;
  /** Active/lead URI is actually producing audio (not just embed `ready`). */
  leadAudible: boolean;
};

type EmbedController = {
  loadUri: (
    uri: string,
    preferVideo?: boolean,
    startAtSeconds?: number,
  ) => void;
  play: () => void;
  /** Resume from the last pause (unlike play(), which may restart). */
  resume: () => void;
  pause: () => void;
  restart: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (event: string, cb: (...args: unknown[]) => void) => void;
};

type PlaybackUpdateEvent = {
  data?: {
    isPaused?: boolean;
    isBuffering?: boolean;
    duration?: number;
    position?: number;
  };
};

/**
 * Near-end window for fallback same-embed restart when the loop twin isn't ready.
 * Slack is wide: playback_update is sparse (~0.5–1s).
 */
const END_RESTART_MS = 2500;
/** Playback / loop restart offset (seconds into the track). */
const START_AT_SEC = 0;
/** Ignore end-detection for this long after we kick a loop (avoids seek/play thrash). */
const LOOP_COOLDOWN_MS = 1200;
/**
 * Start the idle A/B slot this many ms before the preview ends so cutover can
 * overlap the dying tail (Spotify has no mute: brief double-audio is OK).
 * Wider than one sparse playback_update (~1s) so rem≈1.0–1.5s ticks still arm.
 */
const LOOP_CUT_LEAD_MS = 1800;
/**
 * Fallback when Spotify stops emitting playback_update at preview end and the
 * twin cutover never armed.
 */
const END_LOOP_SCHEDULE_PAD_MS = 250;
/**
 * After A/B cutover, if the new slot never reports progress, fall back to the
 * gesture-unlocked act embed (iOS often blocks twin play() outside the gesture).
 */
const LOOP_OWNERSHIP_WATCH_MS = 800;
/** Idle slot must pass this position before we pause the dying slot (ms). */
const LOOP_PROGRESS_PROOF_MS = 500;

/** Which embed owns audio for the committed URI (act pool vs loop twin). */
type PlaySlot = "act" | "loop";

/** iPhone / iPad: second Spotify iframe play() is unreliable after Continue. */
function likelyNeedsSameActLoop(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ can report as Mac with touch.
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Rapid left/right taps cross act boundaries faster than Spotify embeds honor
 * pause(). Only commit a URI switch after navigation settles briefly.
 *
 * Incoming play() starts immediately on URI change (overlap cutover) so the
 * new act can be audible by the time we cut the previous one.
 */
const URI_SWITCH_DEBOUNCE_MS = 140;
/**
 * If playback_started never fires after an overlap play(), force the cut so we
 * don't leave two embeds running.
 */
const CUTOVER_FALLBACK_MS = 450;
/**
 * Speculative primeTo play() must pause once audible. If Spotify never emits
 * playback_started / a usable update, force-finish so the current act stays solo.
 */
const PRIME_FINISH_FALLBACK_MS = 450;
/**
 * After cancelPrime, ignore / force-pause late play() for this URI so a hold
 * cannot leave the next act chirping under the current one.
 */
const PRIME_REJECT_MS = 700;
/**
 * After our own pause/play cutover, ignore mid-sample isPaused → sticky.
 * Stale paused updates from tryFinishPrime / pauseOthers look like media keys
 * when revisiting a URI that already has seenHealthyProgress.
 */
const IGNORE_EXTERNAL_PAUSE_MS = 500;

type IFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    callback: (controller: EmbedController) => void,
  ) => void;
};

type SpotifyWindow = Window & {
  onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  __spotifyIframeApi?: IFrameAPI;
};

type PoolEntry = {
  uri: string;
  controller: EmbedController;
  host: HTMLElement;
  /** Spotify embed finished loading this URI. */
  ready: boolean;
  /** Heard a non-paused playback_update for this URI. */
  audible: boolean;
  /** Act pool entry vs the single long-lived loop twin. */
  slot: PlaySlot;
  /** Debug-only throttle state for `embed.update` logging. */
  lastLoggedPaused?: boolean;
  lastUpdateLogAt?: number;
};

/** Hidden but still painted: opacity:0 iframes often won't buffer on iOS. */
const HOST_WARM =
  "absolute inset-0 w-full overflow-hidden opacity-[0.02] pointer-events-none";
const HOST_LIVE =
  "absolute inset-0 w-full overflow-hidden opacity-100 pointer-events-auto";
const HOST_IDLE =
  "absolute inset-0 w-full overflow-hidden opacity-[0.02] pointer-events-none";

const SCRIPT_SRC = SPOTIFY_EMBED_API_SRC;

/**
 * Cold embeds all load at once; the lead act competes with ten others. Hold
 * the rest (and the loop twin) until the lead is ready or this long passes.
 */
const REST_RELEASE_FALLBACK_MS = 1500;

/** Treat an embed as ready if its own ready event never arrives. */
const READY_FALLBACK_MS = 2000;

function asTrackUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  if (uri.startsWith("spotify:track:")) return uri;
  if (uri.startsWith("spotify:")) return null;
  if (/^[A-Za-z0-9]+$/.test(uri)) return `spotify:track:${uri}`;
  return null;
}

function trackForArtist(
  report: ScrappedReport,
  artistName: string | undefined,
): string | null {
  if (!artistName) return null;
  const pools = [
    report.topSkippedByCount,
    report.likedButScrapped,
    report.actuallyFinished,
    report.secondChanceHeroes,
    report.oneListenExamples,
  ];
  for (const pool of pools) {
    const match = pool.find((row) => row.artist_name === artistName);
    const uri = asTrackUri(match?.spotify_track_uri);
    if (uri) return uri;
  }
  return null;
}

/** Lead track for the active Scrapped slide (null = no soundtrack). */
export function getSlideSoundtrackUri(
  report: ScrappedReport,
  slideIndex: number,
): string | null {
  const topSkipped = asTrackUri(report.topSkippedByCount[0]?.spotify_track_uri);
  const finished = asTrackUri(report.actuallyFinished[0]?.spotify_track_uri);
  const secondChance = asTrackUri(
    report.secondChanceHeroes[0]?.spotify_track_uri,
  );
  const abandoned = report.abandonedArtists[0]?.artist_name;

  switch (slideIndex) {
    case 0:
    case 1:
    case 2:
    case 3:
      return topSkipped;
    case 4:
    case 5:
      return trackForArtist(report, abandoned) ?? topSkipped;
    case 6:
    case 7:
      // Liked-but-scrapped starts the second-chance track so it is already playing on 07.
      return secondChance ?? finished ?? topSkipped;
    case 8:
    case 9:
      // Stayed-for slide + share recap share one track so audio keeps playing.
      return finished ?? secondChance ?? topSkipped;
    default:
      return null;
  }
}

export { collectSoundtrackUris } from "@/lib/soundtrack-uris";

type Props = {
  uri: string | null;
  /** Other act URIs to warm so slide switches can play a ready controller. */
  preloadUris?: readonly (string | null | undefined)[];
  className?: string;
  /** Controlled playback on/off. Uncontrolled when omitted. */
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  /** Hide the floating Sound on / Mute pill (e.g. when chrome has its own control). */
  showToggle?: boolean;
  /**
   * When false, audio can still play but the embed chrome stays hidden
   * (e.g. warming + unlocking on the intro gate).
   */
  showPlayer?: boolean;
  /** Fires when preload controllers become ready (for the post-Continue cue). */
  onWarmChange?: (state: SoundtrackWarmState) => void;
  /**
   * Owning embed paused mid-sample while we still wanted audio (e.g. Mac F8 /
   * headset play-pause). Parent should sticky-pause the story like spacebar.
   */
  onExternalPause?: () => void;
  /**
   * Owning embed resumed while we had disabled playback (media-key play after
   * a sticky pause). Parent should clear sticky pause so soundtrack can re-enable.
   */
  onExternalResume?: () => void;
};

export const DeckSoundtrack = forwardRef<DeckSoundtrackHandle, Props>(
  function DeckSoundtrack(
    {
      uri,
      preloadUris = [],
      className,
      enabled: enabledProp,
      onEnabledChange,
      showToggle = true,
      showPlayer = true,
      onWarmChange,
      onExternalPause,
      onExternalResume,
    },
    ref,
  ) {
    const poolShellRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<IFrameAPI | null>(null);
    const poolRef = useRef<Map<string, PoolEntry>>(new Map());
    const creatingRef = useRef<Set<string>>(new Set());
    /** Single long-lived twin for gapless same-URI sample loops. */
    const loopTwinRef = useRef<PoolEntry | null>(null);
    const loopTwinCreatingRef = useRef(false);
    const enabledRef = useRef(false);
    /** Latest slide soundtrack URI (updates immediately on navigation). */
    const activeUriRef = useRef<string | null>(null);
    /**
     * URI we have committed to play after debounce. Intermediate taps update
     * activeUriRef only, so embeds never start every act in a fast swipe.
     */
    const committedUriRef = useRef<string | null>(null);
    const playingUriRef = useRef<string | null>(null);
    /** Which embed owns audio for the playing URI (act pool vs loop twin). */
    const playingSlotRef = useRef<PlaySlot>("act");
    /**
     * Next act already play()-ing while the previous act stays audible.
     * Spotify embeds have no mute API: overlap + cut on audible is the
     * closest thing to "pre-start muted, unmute on slide."
     */
    const incomingUriRef = useRef<string | null>(null);
    /** Idle A/B slot already play()-ing for a same-URI sample loop cutover. */
    const incomingLoopSlotRef = useRef<PlaySlot | null>(null);
    /** Position high-water for the incoming loop slot only (act updates must not count). */
    const incomingLoopProgressRef = useRef(0);
    /**
     * After a silent twin, stay on same-act restarts (Cursor / some desktops
     * block twin play() like iOS, which caused start→watchdog→restart stutter).
     */
    const sameActOnlyRef = useRef(false);
    /** Bumps on every committed sync so late embed play() can be ignored. */
    const syncGenRef = useRef(0);
    const switchTimerRef = useRef<number | null>(null);
    const enforceTimersRef = useRef<number[]>([]);
    const cutoverTimerRef = useRef<number | null>(null);
    const loopCutoverTimerRef = useRef<number | null>(null);
    const loopWatchTimerRef = useRef<number | null>(null);
    /**
     * Audio advanced ahead of / alongside the slide `uri` prop (cutTo + setActive).
     * While set, the uri effect must not sync back to the outgoing slide.
     */
    const aheadUriRef = useRef<string | null>(null);
    /**
     * Speculative next act: play() started, pause on first audible (hot prime).
     * Does not cut the current act: cancelled presses won't steal the soundtrack.
     */
    const primingUriRef = useRef<string | null>(null);
    /** Forces tryFinishPrime if Spotify never reports audible for a prime. */
    const primeFinishTimerRef = useRef<number | null>(null);
    /** URI that played briefly and is paused near START_AT_SEC for instant resume. */
    const hotPrimedUriRef = useRef<string | null>(null);
    /** URI → Date.now() deadline: late Spotify play after hold-cancel. */
    const primeRejectUntilRef = useRef<Map<string, number>>(new Map());
    /** Suppress notifyExternalPause until this time (our cutover, not media keys). */
    const ignoreExternalPauseUntilRef = useRef(0);
    /** Twin is paused near START_AT_SEC for instant loop resume. */
    const loopTwinHotRef = useRef(false);
    /** Act slot parked at START_AT_SEC after yielding to the twin. */
    const actSlotHotRef = useRef(false);
    /** In-flight cutTo promise coalesced by target URI. */
    const inflightCutRef = useRef<{
      uri: string;
      promise: Promise<void>;
    } | null>(null);
    const cutWaitersRef = useRef<Map<string, Array<() => void>>>(new Map());
    /** True after we pause() while a URI was active: next enable should resume(). */
    const needsResumeRef = useRef(false);
    /**
     * Tab/app hide: hold playback off until React `enabled` catches up.
     * Background tabs throttle renders; without this, Spotify keeps playing.
     */
    const hidePauseLatchRef = useRef(false);
    /**
     * True after we saw a paused update while disabled. Media-key play after
     * that can clear sticky pause; "still playing" right after we disable must not.
     */
    const sawPausedWhileDisabledRef = useRef(false);
    /** Continue tapped before the embed was warm: play on the next ready tick. */
    const pendingGesturePlayRef = useRef(false);
    /**
     * Gate arm: play→pause hot-prime while sound is still “off”.
     * Spotify has no mute; pause near START_AT_SEC is the unmute stand-in.
     */
    const armingLeadRef = useRef(false);
    /** Per-URI loop high-water + cooldown (shared across act/twin slots). */
    const loopStateRef = useRef<
      Map<
        string,
        {
          lastPlayingPosition: number;
          cooldownUntil: number;
          /** False until we see mid-sample progress: blocks stale end-position re-cuts. */
          seenHealthyProgress: boolean;
        }
      >
    >(new Map());
    /** Fallback end timers keyed by slot+uri. */
    const endLoopTimersRef = useRef<Map<string, number>>(new Map());
    /** Throttle `playback.nearEnd` logs (ms timestamp of last emit). */
    const nearEndLogAtRef = useRef(0);

    function clearSwitchTimer() {
      if (switchTimerRef.current != null) {
        window.clearTimeout(switchTimerRef.current);
        switchTimerRef.current = null;
      }
    }

    function clearEnforceTimers() {
      for (const id of enforceTimersRef.current) window.clearTimeout(id);
      enforceTimersRef.current = [];
    }

    function clearCutoverTimer() {
      if (cutoverTimerRef.current != null) {
        window.clearTimeout(cutoverTimerRef.current);
        cutoverTimerRef.current = null;
      }
    }

    function clearPrimeFinishTimer() {
      if (primeFinishTimerRef.current != null) {
        window.clearTimeout(primeFinishTimerRef.current);
        primeFinishTimerRef.current = null;
      }
    }

    function clearLoopCutoverTimer() {
      if (loopCutoverTimerRef.current != null) {
        window.clearTimeout(loopCutoverTimerRef.current);
        loopCutoverTimerRef.current = null;
      }
    }

    function clearLoopWatchTimer() {
      if (loopWatchTimerRef.current != null) {
        window.clearTimeout(loopWatchTimerRef.current);
        loopWatchTimerRef.current = null;
      }
    }

    function clearEndTimersFor(key: string) {
      const endId = endLoopTimersRef.current.get(key);
      if (endId != null) {
        window.clearTimeout(endId);
        endLoopTimersRef.current.delete(key);
      }
    }

    function clearAllEndTimers() {
      for (const id of endLoopTimersRef.current.values()) window.clearTimeout(id);
      endLoopTimersRef.current.clear();
    }

    function resolveCutWaiters(trackUri: string) {
      const waiters = cutWaitersRef.current.get(trackUri);
      if (!waiters?.length) return;
      cutWaitersRef.current.delete(trackUri);
      for (const done of waiters) done();
    }

    function getSlotEntry(slot: PlaySlot, trackUri: string): PoolEntry | null {
      if (slot === "act") return poolRef.current.get(trackUri) ?? null;
      const twin = loopTwinRef.current;
      return twin && twin.uri === trackUri ? twin : null;
    }

    function otherSlot(slot: PlaySlot): PlaySlot {
      return slot === "act" ? "loop" : "act";
    }

    function loopStateFor(trackUri: string) {
      let state = loopStateRef.current.get(trackUri);
      if (!state) {
        state = {
          lastPlayingPosition: 0,
          cooldownUntil: 0,
          seenHealthyProgress: false,
        };
        loopStateRef.current.set(trackUri, state);
      }
      return state;
    }

    /** Shared snapshot fields for loop debug events. */
    function loopSnap(trackUri: string) {
      const state = loopStateFor(trackUri);
      const twin = loopTwinRef.current;
      const twinMatches = twin?.uri === trackUri;
      return {
        uri: shortUri(trackUri),
        playSlot: playingSlotRef.current,
        incomingLoop: incomingLoopSlotRef.current,
        twinReady: twinMatches ? twin!.ready : false,
        twinHot: loopTwinHotRef.current,
        actHot: actSlotHotRef.current,
        healthy: state.seenHealthyProgress,
        lastPos: Math.round(state.lastPlayingPosition),
        coolMs: Math.max(0, state.cooldownUntil - Date.now()),
        enabled: enabledRef.current,
      };
    }

    function canBeginLoopSkipReason(trackUri: string): string | null {
      if (!enabledRef.current) return "disabled";
      if (committedUriRef.current !== trackUri) return "notCommitted";
      if (playingUriRef.current !== trackUri) return "notPlaying";
      if (incomingLoopSlotRef.current != null) return "incomingLoop";
      if (incomingUriRef.current != null) return "incomingAct";
      if (!loopStateFor(trackUri).seenHealthyProgress) return "noHealthy";
      if (Date.now() < loopStateFor(trackUri).cooldownUntil) return "cooldown";
      return null;
    }

    /**
     * Pause every embed except the keep set. Keep is URI+slot so the loop twin
     * sharing a URI with an act entry is not treated as the same owner.
     */
    function pauseExceptSlots(
      keep: ReadonlyArray<{ uri: string; slot: PlaySlot }>,
    ) {
      const keepAct = new Set(
        keep.filter((k) => k.slot === "act").map((k) => k.uri),
      );
      const keepLoop = keep.some((k) => k.slot === "loop");
      for (const entry of poolRef.current.values()) {
        if (keepAct.has(entry.uri)) continue;
        entry.controller.pause();
        entry.host.className = HOST_IDLE;
      }
      const twin = loopTwinRef.current;
      if (twin && !keepLoop) {
        twin.controller.pause();
        twin.host.className = HOST_IDLE;
      }
    }

    function pauseOthersExceptUri(exceptUri: string | null) {
      const keep: Array<{ uri: string; slot: PlaySlot }> = [];
      if (exceptUri) {
        keep.push({ uri: exceptUri, slot: "act" });
      }
      pauseExceptSlots(keep);
      // Act-switch cut: twin must not keep the previous sample running.
      const twin = loopTwinRef.current;
      if (twin) {
        twin.controller.pause();
        twin.host.className = HOST_IDLE;
      }
      loopTwinHotRef.current = false;
      actSlotHotRef.current = false;
      incomingLoopSlotRef.current = null;
      clearLoopCutoverTimer();
    }

    const runSync = useEffectEvent(
      (targetUri: string | null, isEnabled: boolean) => {
        if (targetUri) ensureTwinUri(targetUri);
        syncPlayback(
          poolRef,
          loopTwinRef,
          playingUriRef,
          playingSlotRef,
          incomingUriRef,
          incomingLoopSlotRef,
          needsResumeRef,
          syncGenRef,
          enforceTimersRef,
          cutoverTimerRef,
          targetUri,
          isEnabled,
          setVisibleUri,
          resolveCutWaiters,
          () => {
            playingSlotRef.current = "act";
            incomingLoopSlotRef.current = null;
            clearLoopCutoverTimer();
            loopTwinHotRef.current = false;
            actSlotHotRef.current = false;
          },
        );
      },
    );

    function isPrimeRejected(trackUri: string): boolean {
      const until = primeRejectUntilRef.current.get(trackUri);
      if (until == null) return false;
      if (Date.now() >= until) {
        primeRejectUntilRef.current.delete(trackUri);
        return false;
      }
      return true;
    }

    function rejectPrimeUri(trackUri: string) {
      primeRejectUntilRef.current.set(
        trackUri,
        Date.now() + PRIME_REJECT_MS,
      );
    }

    function clearPrimeReject(trackUri: string) {
      primeRejectUntilRef.current.delete(trackUri);
    }

    /** Slot-aware: act URI allowed for act switch / prime / owning act slot. */
    function isActPlaybackAllowed(trackUri: string): boolean {
      // Gate arm may run before soundOn: still allow the lead chirp→pause.
      if (
        armingLeadRef.current &&
        primingUriRef.current === trackUri
      ) {
        return true;
      }
      if (!enabledRef.current) return false;
      // Hold-cancel latch: block late play unless this URI is the committed cut.
      if (
        isPrimeRejected(trackUri) &&
        primingUriRef.current !== trackUri &&
        incomingUriRef.current !== trackUri &&
        aheadUriRef.current !== trackUri &&
        committedUriRef.current !== trackUri
      ) {
        return false;
      }
      if (primingUriRef.current === trackUri) return true;
      if (incomingUriRef.current === trackUri) return true;
      if (playingUriRef.current !== trackUri) return false;
      return (
        playingSlotRef.current === "act" ||
        incomingLoopSlotRef.current === "act"
      );
    }

    function suppressExternalPauseBriefly() {
      ignoreExternalPauseUntilRef.current =
        Date.now() + IGNORE_EXTERNAL_PAUSE_MS;
    }

    /** Commit act ownership immediately (hot cut / audible priming). */
    function takeActOwnershipNow(trackUri: string, entry: PoolEntry) {
      clearPrimeReject(trackUri);
      clearPrimeFinishTimer();
      primingUriRef.current = null;
      if (hotPrimedUriRef.current === trackUri) {
        hotPrimedUriRef.current = null;
      }
      // Fresh act: do not inherit prior-visit progress (stale pause → sticky).
      const loop = loopStateFor(trackUri);
      loop.seenHealthyProgress = false;
      loop.lastPlayingPosition = 0;
      suppressExternalPauseBriefly();
      playingUriRef.current = trackUri;
      playingSlotRef.current = "act";
      incomingUriRef.current = null;
      needsResumeRef.current = false;
      entry.host.className = HOST_LIVE;
      // Parked primes were seek(0)+pause; play() is more reliable than resume().
      entry.controller.play();
      pauseOthersExceptUri(trackUri);
      ensureTwinUri(trackUri);
      setVisibleUri(trackUri);
      resolveCutWaiters(trackUri);
    }

    function isTwinPlaybackAllowed(trackUri: string): boolean {
      if (!enabledRef.current) return false;
      const twin = loopTwinRef.current;
      if (!twin || twin.uri !== trackUri) return false;
      if (playingUriRef.current !== trackUri) return false;
      return (
        playingSlotRef.current === "loop" ||
        incomingLoopSlotRef.current === "loop"
      );
    }

    function ensureTwinUri(trackUri: string | null) {
      const twin = loopTwinRef.current;
      if (!twin || !trackUri) return;
      if (twin.uri === trackUri) return;
      twin.uri = trackUri;
      twin.ready = false;
      twin.audible = false;
      loopTwinHotRef.current = false;
      twin.host.className = HOST_WARM;
      twin.controller.loadUri(trackUri, false, START_AT_SEC);
      soundtrackDebug("ensureTwinUri", {
        uri: shortUri(trackUri),
        playSlot: playingSlotRef.current,
      });
      // loadUri may not re-fire `ready`; don't block A/B loops forever.
      window.setTimeout(() => {
        if (loopTwinRef.current !== twin) return;
        if (twin.uri !== trackUri) return;
        if (twin.ready) return;
        twin.ready = true;
        soundtrackDebug("ensureTwinUri.readyFallback", {
          uri: shortUri(trackUri),
        });
        setPoolTick((n) => n + 1);
      }, 2000);
    }

    /**
     * Priming path: next act became audible: pause it hot so the current act
     * stays solo until cutTo commits the switch.
     */
    function tryFinishPrime(trackUri: string) {
      if (primingUriRef.current !== trackUri) return false;
      // cutTo / Continue took over: let tryCutover / live play own this audible event.
      if (
        aheadUriRef.current === trackUri ||
        incomingUriRef.current === trackUri
      ) {
        return false;
      }
      const entry = poolRef.current.get(trackUri);
      if (!entry) {
        clearPrimeFinishTimer();
        primingUriRef.current = null;
        return true;
      }
      clearPrimeFinishTimer();
      suppressExternalPauseBriefly();
      entry.controller.pause();
      // Re-park at the hook so resume() doesn't continue mid-phrase from the chirp.
      entry.controller.seek(START_AT_SEC);
      entry.host.className = HOST_IDLE;
      primingUriRef.current = null;
      armingLeadRef.current = false;
      hotPrimedUriRef.current = trackUri;
      if (incomingUriRef.current === trackUri) incomingUriRef.current = null;
      soundtrackDebug("tryFinishPrime", {
        uri: shortUri(trackUri),
        playingUri: shortUri(playingUriRef.current),
        enabled: enabledRef.current,
      });
      return true;
    }

    /** If Spotify never reports audible for a prime, force-pause so acts don't overlap. */
    function schedulePrimeFinishFallback(trackUri: string) {
      clearPrimeFinishTimer();
      primeFinishTimerRef.current = window.setTimeout(() => {
        primeFinishTimerRef.current = null;
        if (primingUriRef.current !== trackUri) return;
        tryFinishPrime(trackUri);
      }, PRIME_FINISH_FALLBACK_MS);
    }

    /**
     * Finish same-URI A/B loop cutover only after the idle slot proves progress.
     * Early playback_started blips without position used to pause the act and
     * hand a silent twin the stage (Cursor: start twice via watchdog).
     */
    function tryLoopCutover(trackUri: string, slot: PlaySlot) {
      if (!enabledRef.current) return;
      if (incomingLoopSlotRef.current !== slot) return;
      if (committedUriRef.current !== trackUri) return;
      if (playingUriRef.current !== trackUri) return;
      if (incomingLoopProgressRef.current < LOOP_PROGRESS_PROOF_MS) {
        soundtrackDebug("tryLoopCutover.wait", {
          ...loopSnap(trackUri),
          to: slot,
          progress: Math.round(incomingLoopProgressRef.current),
          need: LOOP_PROGRESS_PROOF_MS,
        });
        return;
      }

      const retiring = otherSlot(slot);
      const live = getSlotEntry(slot, trackUri);
      const dead = getSlotEntry(retiring, trackUri);
      clearLoopCutoverTimer();
      clearAllEndTimers();
      incomingLoopSlotRef.current = null;
      incomingLoopProgressRef.current = 0;
      playingSlotRef.current = slot;
      needsResumeRef.current = false;

      if (live) {
        live.host.className = HOST_LIVE;
      }
      if (dead) {
        dead.controller.pause();
        dead.controller.seek(START_AT_SEC);
        dead.host.className = HOST_IDLE;
      }
      if (retiring === "act") actSlotHotRef.current = true;
      if (retiring === "loop") loopTwinHotRef.current = true;
      if (slot === "act") actSlotHotRef.current = false;
      if (slot === "loop") loopTwinHotRef.current = false;

      const state = loopStateFor(trackUri);
      state.lastPlayingPosition = 0;
      state.seenHealthyProgress = false;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
      setVisibleUri(trackUri);

      // Keep only the live slot; pause stray act embeds.
      pauseExceptSlots([{ uri: trackUri, slot }]);
      // Reinforce after pauseExcept: hot resume() can no-op; play() matches
      // takeActOwnershipNow (parked embeds are unreliable on resume alone).
      if (live && enabledRef.current) {
        suppressExternalPauseBriefly();
        live.controller.play();
      }
      soundtrackDebug("tryLoopCutover", {
        ...loopSnap(trackUri),
        to: slot,
        from: retiring,
        liveAudible: live?.audible ?? false,
        liveReady: live?.ready ?? false,
      });
      // Twin can still die after a progress blip; recover to act if needed.
      if (slot === "loop") {
        scheduleLoopOwnershipWatch(trackUri, "loop");
      }
    }

    function noteIncomingLoopProgress(
      trackUri: string,
      slot: PlaySlot,
      position: number,
    ) {
      if (incomingLoopSlotRef.current !== slot) return;
      if (playingUriRef.current !== trackUri) return;
      if (position > incomingLoopProgressRef.current) {
        incomingLoopProgressRef.current = position;
      }
      if (incomingLoopProgressRef.current >= LOOP_PROGRESS_PROOF_MS) {
        tryLoopCutover(trackUri, slot);
      }
    }

    function markSameActOnly(reason: string) {
      if (sameActOnlyRef.current) return;
      sameActOnlyRef.current = true;
      soundtrackDebug("loop.sameActOnly", { reason });
    }

    function shouldUseSameActLoop() {
      return likelyNeedsSameActLoop() || sameActOnlyRef.current;
    }

    /**
     * Incoming act embed is producing sound: kill the previous act (overlap cutover).
     */
    function tryCutover(trackUri: string) {
      if (!enabledRef.current) return;
      if (tryFinishPrime(trackUri)) return;
      if (
        activeUriRef.current !== trackUri &&
        committedUriRef.current !== trackUri &&
        aheadUriRef.current !== trackUri
      ) {
        return;
      }
      if (playingUriRef.current === trackUri) {
        // Same URI already playing on some slot: don't yank back to act mid-loop
        // unless this is a fresh act-switch incoming.
        if (incomingUriRef.current === trackUri) {
          incomingUriRef.current = null;
          clearPrimeFinishTimer();
          primingUriRef.current = null;
          playingSlotRef.current = "act";
          incomingLoopSlotRef.current = null;
          clearLoopCutoverTimer();
          const entry = poolRef.current.get(trackUri);
          if (entry) entry.host.className = HOST_LIVE;
          pauseOthersExceptUri(trackUri);
          setVisibleUri(trackUri);
        } else {
          incomingUriRef.current = null;
          clearPrimeFinishTimer();
          primingUriRef.current = null;
          clearCutoverTimer();
        }
        resolveCutWaiters(trackUri);
        return;
      }
      clearCutoverTimer();
      incomingUriRef.current = null;
      clearPrimeFinishTimer();
      primingUriRef.current = null;
      hotPrimedUriRef.current =
        hotPrimedUriRef.current === trackUri ? null : hotPrimedUriRef.current;
      const loop = loopStateFor(trackUri);
      loop.seenHealthyProgress = false;
      loop.lastPlayingPosition = 0;
      suppressExternalPauseBriefly();
      playingUriRef.current = trackUri;
      playingSlotRef.current = "act";
      incomingLoopSlotRef.current = null;
      clearLoopCutoverTimer();
      needsResumeRef.current = false;
      const entry = poolRef.current.get(trackUri);
      if (entry) entry.host.className = HOST_LIVE;
      pauseOthersExceptUri(trackUri);
      ensureTwinUri(trackUri);
      setVisibleUri(trackUri);
      resolveCutWaiters(trackUri);
      soundtrackDebug("tryCutover", {
        uri: shortUri(trackUri),
        playingUri: shortUri(playingUriRef.current),
        incomingUri: shortUri(incomingUriRef.current),
      });
    }

    function canBeginLoop(trackUri: string) {
      return canBeginLoopSkipReason(trackUri) == null;
    }

    /** Same-embed restart: only when the idle twin/act slot isn't usable. */
    function fallbackLoopRestart(trackUri: string, slot: PlaySlot) {
      const skip = canBeginLoopSkipReason(trackUri);
      if (skip) {
        soundtrackDebug("fallbackLoopRestart.skip", {
          ...loopSnap(trackUri),
          slot,
          reason: skip,
        });
        return false;
      }
      const entry = getSlotEntry(slot, trackUri);
      if (!entry) {
        soundtrackDebug("fallbackLoopRestart.skip", {
          ...loopSnap(trackUri),
          slot,
          reason: "noEntry",
        });
        return false;
      }
      const state = loopStateFor(trackUri);
      state.lastPlayingPosition = 0;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
      entry.controller.restart();
      entry.controller.seek(START_AT_SEC);
      entry.controller.play();
      soundtrackDebug("fallbackLoopRestart", {
        ...loopSnap(trackUri),
        slot,
        ready: entry.ready,
      });
      return true;
    }

    /**
     * Restart on the act pool embed (Continue gesture-unlocked). Used on iOS
     * instead of the loop twin, and as watchdog recovery when twin play dies.
     */
    function restartLoopOnAct(trackUri: string, reason: string) {
      clearLoopCutoverTimer();
      clearLoopWatchTimer();
      clearAllEndTimers();
      incomingLoopSlotRef.current = null;
      incomingLoopProgressRef.current = 0;
      if (
        reason === "watchdog" ||
        reason === "timerNoProgress" ||
        reason === "iosGesture" ||
        reason === "sameActLatch"
      ) {
        markSameActOnly(reason);
      }

      const twin = loopTwinRef.current;
      if (twin) {
        twin.controller.pause();
        twin.host.className = HOST_IDLE;
      }
      loopTwinHotRef.current = false;
      actSlotHotRef.current = false;

      const act = poolRef.current.get(trackUri);
      if (!act) {
        soundtrackDebug("restartLoopOnAct.skip", {
          ...loopSnap(trackUri),
          reason: "noAct",
          via: reason,
        });
        return false;
      }

      playingUriRef.current = trackUri;
      playingSlotRef.current = "act";
      needsResumeRef.current = false;
      const state = loopStateFor(trackUri);
      state.lastPlayingPosition = 0;
      state.seenHealthyProgress = false;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
      suppressExternalPauseBriefly();
      act.host.className = HOST_LIVE;
      act.controller.seek(START_AT_SEC);
      act.controller.play();
      pauseExceptSlots([{ uri: trackUri, slot: "act" }]);
      act.controller.play();
      setVisibleUri(trackUri);
      soundtrackDebug("restartLoopOnAct", {
        ...loopSnap(trackUri),
        reason,
        ready: act.ready,
      });
      return true;
    }

    function scheduleLoopOwnershipWatch(trackUri: string, expectedSlot: PlaySlot) {
      clearLoopWatchTimer();
      loopWatchTimerRef.current = window.setTimeout(() => {
        loopWatchTimerRef.current = null;
        if (!enabledRef.current) return;
        if (playingUriRef.current !== trackUri) return;
        if (playingSlotRef.current !== expectedSlot) return;
        const state = loopStateFor(trackUri);
        if (state.seenHealthyProgress) return;
        if (state.lastPlayingPosition >= LOOP_PROGRESS_PROOF_MS) return;
        soundtrackDebug("loop.watchdog", {
          ...loopSnap(trackUri),
          expectedSlot,
          reason: "noProgress",
        });
        restartLoopOnAct(trackUri, "watchdog");
      }, LOOP_OWNERSHIP_WATCH_MS);
    }

    /** Start the idle A/B slot early; cut when it reports audible. */
    function beginLoopCutover(trackUri: string) {
      const skip = canBeginLoopSkipReason(trackUri);
      if (skip) {
        soundtrackDebug("beginLoopCutover.skip", {
          ...loopSnap(trackUri),
          reason: skip,
        });
        return false;
      }

      // iOS / latched same-act: twin play() is blocked or proved silent. Stay
      // on the act embed (small seek gap) instead of start→watchdog stutter.
      if (shouldUseSameActLoop()) {
        const from = playingSlotRef.current;
        const reason = likelyNeedsSameActLoop() ? "iosGesture" : "sameActLatch";
        soundtrackDebug("beginLoopCutover", {
          ...loopSnap(trackUri),
          from,
          to: "act",
          path: "same-act",
          reason,
        });
        return restartLoopOnAct(trackUri, reason);
      }

      const from = playingSlotRef.current;
      const to = otherSlot(from);
      const idle = getSlotEntry(to, trackUri);
      if (!idle?.ready) {
        soundtrackDebug("beginLoopCutover", {
          ...loopSnap(trackUri),
          from,
          to,
          path: "fallback",
          idleReady: idle?.ready ?? false,
        });
        return fallbackLoopRestart(trackUri, from);
      }

      incomingLoopSlotRef.current = to;
      incomingLoopProgressRef.current = 0;
      idle.host.className = HOST_LIVE;
      // Always seek+play for A/B loops. Hot resume() often no-ops on a parked
      // act/twin (same scar as takeActOwnershipNow); that reads as stutter then
      // silence after the first successful loop→act flip.
      if (to === "loop") loopTwinHotRef.current = false;
      if (to === "act") actSlotHotRef.current = false;
      idle.controller.seek(START_AT_SEC);
      idle.controller.play();

      clearLoopCutoverTimer();
      clearAllEndTimers();
      clearLoopWatchTimer();
      loopCutoverTimerRef.current = window.setTimeout(() => {
        loopCutoverTimerRef.current = null;
        if (incomingLoopSlotRef.current !== to) {
          soundtrackDebug("tryLoopCutover.timerSkip", {
            ...loopSnap(trackUri),
            expected: to,
          });
          return;
        }
        if (incomingLoopProgressRef.current < LOOP_PROGRESS_PROOF_MS) {
          soundtrackDebug("tryLoopCutover.timerRecover", {
            ...loopSnap(trackUri),
            to,
            progress: Math.round(incomingLoopProgressRef.current),
          });
          // Twin never proved: do not pause a still-living act via tryLoopCutover.
          restartLoopOnAct(trackUri, "timerNoProgress");
          return;
        }
        soundtrackDebug("tryLoopCutover.timer", {
          uri: shortUri(trackUri),
          to,
          progress: Math.round(incomingLoopProgressRef.current),
        });
        tryLoopCutover(trackUri, to);
      }, CUTOVER_FALLBACK_MS);

      const state = loopStateFor(trackUri);
      state.seenHealthyProgress = false;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
      soundtrackDebug("beginLoopCutover", {
        ...loopSnap(trackUri),
        from,
        to,
        path: "play",
        fallbackMs: CUTOVER_FALLBACK_MS,
      });
      return true;
    }

    function scheduleLoopFromPlayback(
      trackUri: string,
      slot: PlaySlot,
      position: number,
      duration: number,
    ) {
      if (duration <= 0) return;
      if (playingSlotRef.current !== slot) return;
      if (playingUriRef.current !== trackUri) return;
      // Cutover already in flight: dying-slot updates must not re-arm timers.
      if (incomingLoopSlotRef.current != null) return;
      if (!canBeginLoop(trackUri)) return;

      const remaining = duration - position;
      const key = `${slot}:${trackUri}`;

      // Primary path: arm A/B cutover before the sample dies.
      if (remaining <= LOOP_CUT_LEAD_MS) {
        soundtrackDebug("loop.schedule", {
          ...loopSnap(trackUri),
          action: "armLead",
          slot,
          pos: Math.round(position),
          dur: Math.round(duration),
          rem: Math.round(remaining),
          leadMs: LOOP_CUT_LEAD_MS,
        });
        beginLoopCutover(trackUri);
        clearEndTimersFor(key);
        return;
      }

      if (remaining > END_RESTART_MS + 1500) {
        clearEndTimersFor(key);
        return;
      }

      // Outer near-end window: endTimer only (stall thrash removed; lead is wide
      // enough that sparse updates hit armLead before rem→0).
      const endId = endLoopTimersRef.current.get(key);
      if (endId != null) window.clearTimeout(endId);
      const delay = Math.max(0, remaining + END_LOOP_SCHEDULE_PAD_MS);
      endLoopTimersRef.current.set(
        key,
        window.setTimeout(() => {
          endLoopTimersRef.current.delete(key);
          if (incomingLoopSlotRef.current) {
            soundtrackDebug("loop.schedule", {
              ...loopSnap(trackUri),
              action: "endTimerSkip",
              reason: "incomingLoop",
            });
            return;
          }
          soundtrackDebug("loop.schedule", {
            ...loopSnap(trackUri),
            action: "endTimerFire",
            slot,
            remWas: Math.round(remaining),
          });
          beginLoopCutover(trackUri);
        }, delay),
      );

      soundtrackDebug("loop.schedule", {
        ...loopSnap(trackUri),
        action: "armEndTimer",
        slot,
        pos: Math.round(position),
        dur: Math.round(duration),
        rem: Math.round(remaining),
        endDelay: Math.round(delay),
      });
    }

    const notifyExternalPause = useEffectEvent(() => {
      soundtrackDebug("notifyExternalPause", {
        playingUri: shortUri(playingUriRef.current),
        committedUri: shortUri(committedUriRef.current),
        enabled: enabledRef.current,
      });
      onExternalPause?.();
    });
    const notifyExternalResume = useEffectEvent(() => {
      soundtrackDebug("notifyExternalResume", {
        playingUri: shortUri(playingUriRef.current),
        enabled: enabledRef.current,
      });
      onExternalResume?.();
    });

    const attachEntryListeners = useEffectEvent((entry: PoolEntry) => {
      const { controller, slot } = entry;
      const trackUriFor = () => entry.uri;

      const finishReady = () => {
        if (entry.ready) return;
        entry.ready = true;
        soundtrackDebug("embed.ready", { uri: shortUri(entry.uri), slot });
        if (pendingGesturePlayRef.current) {
          enabledRef.current = true;
        }
        setPoolTick((n) => n + 1);
        if (slot === "act") {
          runSync(committedUriRef.current, enabledRef.current);
          if (
            pendingGesturePlayRef.current &&
            committedUriRef.current &&
            playingUriRef.current === committedUriRef.current
          ) {
            pendingGesturePlayRef.current = false;
          }
        }
      };

      controller.addListener("ready", finishReady);
      window.setTimeout(finishReady, READY_FALLBACK_MS);

      controller.addListener("playback_started", () => {
        const trackUri = trackUriFor();
        if (slot === "loop") {
          if (!isTwinPlaybackAllowed(trackUri)) {
            controller.pause();
            return;
          }
          if (!entry.audible) {
            entry.audible = true;
            setPoolTick((n) => n + 1);
          }
          // Cut only after position proof via playback_update / noteIncoming.
          return;
        }

        if (!isActPlaybackAllowed(trackUri)) {
          controller.pause();
          if (isPrimeRejected(trackUri)) {
            controller.seek(START_AT_SEC);
          }
          return;
        }
        if (!entry.audible) {
          entry.audible = true;
          soundtrackDebug("embed.audible", { uri: shortUri(trackUri) });
          setPoolTick((n) => n + 1);
        }
        if (incomingLoopSlotRef.current === "act") {
          // Progress proof comes from playback_update.
          return;
        }
        tryCutover(trackUri);
      });

      controller.addListener("playback_update", (raw) => {
        const trackUri = trackUriFor();
        const event = raw as PlaybackUpdateEvent;
        const {
          isPaused,
          isBuffering,
          duration = 0,
          position = 0,
        } = event.data ?? {};

        // Diagnostic: "audible" can fire while a browser still blocks sound.
        // Log paused flips and ~2s progress so a bad first slide is visible.
        const nowMs = Date.now();
        if (
          entry.lastLoggedPaused !== isPaused ||
          nowMs - (entry.lastUpdateLogAt ?? 0) >= 2000
        ) {
          entry.lastLoggedPaused = isPaused;
          entry.lastUpdateLogAt = nowMs;
          soundtrackDebug("embed.update", {
            uri: shortUri(trackUri),
            slot,
            paused: isPaused,
            pos: Math.round(position),
          });
        }

        if (!isPaused) {
          const state = loopStateFor(trackUri);
          if (position > state.lastPlayingPosition) {
            state.lastPlayingPosition = position;
          }
          // Arm end-detection only after real mid-sample progress (not stale end).
          if (
            duration > 0 &&
            position >= START_AT_SEC * 1000 + 2000 &&
            position < duration - END_RESTART_MS
          ) {
            state.seenHealthyProgress = true;
          }

          const allowed =
            slot === "loop"
              ? isTwinPlaybackAllowed(trackUri)
              : isActPlaybackAllowed(trackUri);

          if (isBuffering) {
            if (
              allowed &&
              playingSlotRef.current === slot &&
              playingUriRef.current === trackUri
            ) {
              scheduleLoopFromPlayback(trackUri, slot, position, duration);
            }
            return;
          }

          if (!allowed) {
            clearEndTimersFor(`${slot}:${trackUri}`);
            // Media-key play after a real pause-while-disabled: clear sticky pause.
            // Do not treat "still playing right after we disabled" as resume (D-031).
            if (
              !enabledRef.current &&
              sawPausedWhileDisabledRef.current &&
              playingUriRef.current === trackUri &&
              playingSlotRef.current === slot
            ) {
              sawPausedWhileDisabledRef.current = false;
              notifyExternalResume();
              return;
            }
            controller.pause();
            if (slot === "act" && isPrimeRejected(trackUri)) {
              controller.seek(START_AT_SEC);
            }
            return;
          }

          if (!entry.audible) {
            entry.audible = true;
            setPoolTick((n) => n + 1);
          }

          if (slot === "loop") {
            if (incomingLoopSlotRef.current === "loop") {
              noteIncomingLoopProgress(trackUri, "loop", position);
            }
          } else if (incomingLoopSlotRef.current === "act") {
            noteIncomingLoopProgress(trackUri, "act", position);
          } else if (primingUriRef.current === trackUri) {
            // Finish speculative primes here too: don't wait only on playback_started.
            tryFinishPrime(trackUri);
          } else if (incomingUriRef.current === trackUri) {
            tryCutover(trackUri);
          }

          if (
            playingSlotRef.current === slot &&
            playingUriRef.current === trackUri
          ) {
            if (duration > 0) {
              const remaining = duration - position;
              if (
                remaining <= END_RESTART_MS + 2500 &&
                Date.now() - nearEndLogAtRef.current >= 1000
              ) {
                nearEndLogAtRef.current = Date.now();
                soundtrackDebug("playback.nearEnd", {
                  ...loopSnap(trackUri),
                  slot,
                  pos: Math.round(position),
                  dur: Math.round(duration),
                  rem: Math.round(remaining),
                  buffering: !!isBuffering,
                });
              }
            }
            scheduleLoopFromPlayback(trackUri, slot, position, duration);
          }
          return;
        }

        // Paused path: fallback end detection for the owning slot only.
        if (!enabledRef.current) {
          sawPausedWhileDisabledRef.current = true;
          clearEndTimersFor(`${slot}:${trackUri}`);
          return;
        }
        if (committedUriRef.current !== trackUri) {
          clearEndTimersFor(`${slot}:${trackUri}`);
          return;
        }
        if (playingUriRef.current !== trackUri) {
          clearEndTimersFor(`${slot}:${trackUri}`);
          return;
        }
        if (playingSlotRef.current !== slot) return;
        if (incomingLoopSlotRef.current) return;
        if (duration <= 0) return;
        const state = loopStateFor(trackUri);
        if (Date.now() < state.cooldownUntil) return;
        const pausedAtEnd = position >= duration - END_RESTART_MS;
        const resetAfterEnd =
          state.lastPlayingPosition >= duration - END_RESTART_MS &&
          position <= END_RESTART_MS;
        if (pausedAtEnd || resetAfterEnd) {
          soundtrackDebug("loop.pausedAtEnd", {
            ...loopSnap(trackUri),
            slot,
            pos: Math.round(position),
            dur: Math.round(duration),
            kind: pausedAtEnd ? "pausedAtEnd" : "resetAfterEnd",
          });
          beginLoopCutover(trackUri);
          return;
        }
        // Mid-sample pause while we still wanted audio: hardware media keys.
        // Skip right after our cutover/prime park: stale isPaused is not a key press.
        if (
          state.seenHealthyProgress &&
          Date.now() >= ignoreExternalPauseUntilRef.current
        ) {
          notifyExternalPause();
        } else if (state.seenHealthyProgress) {
          soundtrackDebug("notifyExternalPause.suppressed", {
            uri: shortUri(trackUri),
            msLeft: Math.max(
              0,
              ignoreExternalPauseUntilRef.current - Date.now(),
            ),
          });
        }
      });
    });

    const [apiReady, setApiReady] = useState(false);
    const [uncontrolledEnabled, setUncontrolledEnabled] = useState(false);
    const [poolTick, setPoolTick] = useState(0);
    const [visibleUri, setVisibleUri] = useState<string | null>(null);
    /** Lead embed is ready (or timed out): safe to create the rest + twin. */
    const [restReleased, setRestReleased] = useState(false);

    const controlled = enabledProp !== undefined;
    const enabled = controlled ? enabledProp : uncontrolledEnabled;

    function setEnabled(next: boolean) {
      onEnabledChange?.(next);
      if (!controlled) setUncontrolledEnabled(next);
    }

    if (hidePauseLatchRef.current) {
      // Parent sticky-pause caught up: latch can release.
      if (!enabled) hidePauseLatchRef.current = false;
      enabledRef.current = false;
    } else {
      enabledRef.current = enabled;
    }
    if (enabled) sawPausedWhileDisabledRef.current = false;
    activeUriRef.current = uri;

    useImperativeHandle(ref, () => ({
      armLeadFromGesture() {
        const target = asTrackUri(activeUriRef.current);
        if (!target) return;
        if (hotPrimedUriRef.current === target) return;
        if (playingUriRef.current === target) return;
        if (primingUriRef.current === target) return;

        const entry = poolRef.current.get(target);
        if (!entry?.ready) return;

        // Spotify has no mute: play until audible, then pause at the hook.
        armingLeadRef.current = true;
        primingUriRef.current = target;
        entry.host.className = HOST_WARM;
        entry.controller.seek(START_AT_SEC);
        entry.controller.play();
      },
      nudgeFromGesture() {
        if (!enabledRef.current) return;
        const target = playingUriRef.current ?? asTrackUri(activeUriRef.current);
        if (!target) return;
        const live =
          playingSlotRef.current === "loop" && loopTwinRef.current?.uri === target
            ? loopTwinRef.current
            : poolRef.current.get(target);
        soundtrackDebug("nudgeFromGesture", {
          uri: shortUri(target),
          found: Boolean(live),
        });
        live?.controller.resume();
      },
      playFromUserGesture() {
        pendingGesturePlayRef.current = true;
        enabledRef.current = true;
        needsResumeRef.current = false;
        clearSwitchTimer();
        const target = activeUriRef.current;
        committedUriRef.current = target;
        setEnabled(true);

        // Already owning audio (e.g. pointerdown already started play).
        if (target && playingUriRef.current === target) {
          pendingGesturePlayRef.current = false;
          armingLeadRef.current = false;
          const live =
            playingSlotRef.current === "loop"
              ? loopTwinRef.current?.uri === target
                ? loopTwinRef.current
                : null
              : poolRef.current.get(target);
          if (live) {
            live.host.className = HOST_LIVE;
            setVisibleUri(target);
            return;
          }
        }

        // Hot-primed lead: resume() is near-instant vs cold play().
        if (target && hotPrimedUriRef.current === target) {
          const entry = poolRef.current.get(target);
          if (entry?.ready) {
            hotPrimedUriRef.current = null;
            armingLeadRef.current = false;
            primingUriRef.current = null;
            playingUriRef.current = target;
            playingSlotRef.current = "act";
            incomingUriRef.current = null;
            entry.host.className = HOST_LIVE;
            entry.controller.resume();
            pauseOthersExceptUri(target);
            ensureTwinUri(target);
            setVisibleUri(target);
            pendingGesturePlayRef.current = false;
            return;
          }
        }

        // Arm still buffering: promote to live play (don't pause on audible).
        if (
          target &&
          armingLeadRef.current &&
          primingUriRef.current === target
        ) {
          const entry = poolRef.current.get(target);
          armingLeadRef.current = false;
          primingUriRef.current = null;
          if (entry) {
            playingUriRef.current = target;
            playingSlotRef.current = "act";
            incomingUriRef.current = null;
            entry.host.className = HOST_LIVE;
            // play() already in flight from arm: nudge in case it stalled.
            entry.controller.play();
            pauseOthersExceptUri(target);
            ensureTwinUri(target);
            setVisibleUri(target);
            pendingGesturePlayRef.current = false;
            return;
          }
        }

        armingLeadRef.current = false;
        runSync(target, true);
        if (target && playingUriRef.current === target) {
          pendingGesturePlayRef.current = false;
        }
      },
      isLeadAudible() {
        const lead = asTrackUri(activeUriRef.current);
        if (!lead) return true;
        return poolRef.current.get(lead)?.audible === true;
      },
      primeTo(nextUri: string | null) {
        const target = asTrackUri(nextUri);
        if (!enabledRef.current || !target) return;
        if (playingUriRef.current === target) return;
        if (hotPrimedUriRef.current === target) return;
        if (primingUriRef.current === target) return;

        const prevPrime = primingUriRef.current;
        if (prevPrime && prevPrime !== target) {
          clearPrimeFinishTimer();
          poolRef.current.get(prevPrime)?.controller.pause();
        }

        const entry = poolRef.current.get(target);
        if (!entry?.ready) {
          soundtrackDebug("primeTo.skip", {
            uri: shortUri(target),
            reason: "not-ready",
          });
          return;
        }

        clearEnforceTimers();
        primingUriRef.current = target;
        entry.host.className = HOST_WARM;
        entry.controller.play();
        schedulePrimeFinishFallback(target);
        soundtrackDebug("primeTo", {
          uri: shortUri(target),
          playingUri: shortUri(playingUriRef.current),
          hotPrimed: shortUri(hotPrimedUriRef.current),
          enabled: enabledRef.current,
        });
      },
      cancelPrime() {
        clearPrimeFinishTimer();
        const targets = new Set<string>();
        if (primingUriRef.current) targets.add(primingUriRef.current);
        if (
          hotPrimedUriRef.current &&
          hotPrimedUriRef.current !== playingUriRef.current
        ) {
          targets.add(hotPrimedUriRef.current);
        }
        soundtrackDebug("cancelPrime", {
          priming: shortUri(primingUriRef.current),
          hotPrimed: shortUri(hotPrimedUriRef.current),
          playingUri: shortUri(playingUriRef.current),
          targetCount: targets.size,
        });
        primingUriRef.current = null;
        if (
          hotPrimedUriRef.current &&
          targets.has(hotPrimedUriRef.current)
        ) {
          hotPrimedUriRef.current = null;
        }
        if (targets.size > 0) suppressExternalPauseBriefly();
        for (const uri of targets) {
          if (uri === playingUriRef.current) continue;
          if (incomingUriRef.current === uri) continue;
          rejectPrimeUri(uri);
          const entry = poolRef.current.get(uri);
          if (!entry) continue;
          entry.controller.pause();
          entry.controller.seek(START_AT_SEC);
          entry.host.className = HOST_IDLE;
        }
      },
      cutTo(nextUri: string | null) {
        const target = asTrackUri(nextUri);
        if (!enabledRef.current) return Promise.resolve();
        if (!target) return Promise.resolve();
        clearPrimeReject(target);
        if (
          playingUriRef.current === target &&
          incomingUriRef.current == null
        ) {
          aheadUriRef.current = target;
          committedUriRef.current = target;
          primingUriRef.current = null;
          ensureTwinUri(target);
          soundtrackDebug("cutTo", {
            path: "same",
            uri: shortUri(target),
            playingUri: shortUri(playingUriRef.current),
          });
          return Promise.resolve();
        }
        if (inflightCutRef.current?.uri === target) {
          return inflightCutRef.current.promise;
        }

        const promise = new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
          };

          const list = cutWaitersRef.current.get(target) ?? [];
          list.push(finish);
          cutWaitersRef.current.set(target, list);

          window.setTimeout(finish, CUTOVER_FALLBACK_MS + 80);

          aheadUriRef.current = target;
          committedUriRef.current = target;
          clearSwitchTimer();
          incomingLoopSlotRef.current = null;
          clearLoopCutoverTimer();

          if (hotPrimedUriRef.current === target) {
            const entry = poolRef.current.get(target);
            if (entry) {
              takeActOwnershipNow(target, entry);
              soundtrackDebug("cutTo", {
                path: "hot",
                uri: shortUri(target),
                playingUri: shortUri(playingUriRef.current),
                enabled: enabledRef.current,
              });
              return;
            }
            hotPrimedUriRef.current = null;
          }

          if (primingUriRef.current === target) {
            const entry = poolRef.current.get(target);
            // Already audible from speculative play: own immediately (no 450ms hole).
            if (entry?.audible) {
              takeActOwnershipNow(target, entry);
              soundtrackDebug("cutTo", {
                path: "priming-hot",
                uri: shortUri(target),
                playingUri: shortUri(playingUriRef.current),
              });
              return;
            }
            clearPrimeFinishTimer();
            primingUriRef.current = null;
            incomingUriRef.current = target;
            soundtrackDebug("cutTo", {
              path: "priming",
              uri: shortUri(target),
              playingUri: shortUri(playingUriRef.current),
              incomingUri: shortUri(incomingUriRef.current),
            });
            runSync(target, true);
            return;
          }

          clearPrimeFinishTimer();
          primingUriRef.current = null;
          soundtrackDebug("cutTo", {
            path: "cold",
            uri: shortUri(target),
            playingUri: shortUri(playingUriRef.current),
            hotPrimed: shortUri(hotPrimedUriRef.current),
          });
          runSync(target, true);

          if (
            playingUriRef.current === target &&
            incomingUriRef.current == null
          ) {
            resolveCutWaiters(target);
          }
        }).finally(() => {
          if (inflightCutRef.current?.promise === promise) {
            inflightCutRef.current = null;
          }
        });

        inflightCutRef.current = { uri: target, promise };
        return promise;
      },
    }));

    const wantedUris = useMemo(() => {
      const out: string[] = [];
      const seen = new Set<string>();
      const push = (candidate: string | null | undefined) => {
        const next = asTrackUri(candidate ?? null);
        if (!next || seen.has(next)) return;
        seen.add(next);
        out.push(next);
      };
      push(uri);
      for (const candidate of preloadUris) push(candidate);
      return out;
    }, [uri, preloadUris]);

    const warmState = useMemo((): SoundtrackWarmState => {
      // poolTick re-reads poolRef/creatingRef when embed readiness changes.
      void poolTick;
      const lead = asTrackUri(uri);
      const leadEntry = lead ? poolRef.current.get(lead) : undefined;
      const leadReady = lead ? leadEntry?.ready === true : true;
      const leadAudible = lead ? leadEntry?.audible === true : true;

      if (!apiReady) {
        return {
          ready: 0,
          total: wantedUris.length,
          allReady: false,
          leadReady: false,
          leadAudible: false,
        };
      }
      if (wantedUris.length === 0) {
        return {
          ready: 0,
          total: 0,
          allReady: true,
          leadReady: true,
          leadAudible: true,
        };
      }
      let ready = 0;
      for (const trackUri of wantedUris) {
        if (poolRef.current.get(trackUri)?.ready) ready += 1;
      }
      const mounting = wantedUris.some(
        (trackUri) =>
          !poolRef.current.has(trackUri) && creatingRef.current.has(trackUri),
      );
      const missing = wantedUris.some(
        (trackUri) =>
          !poolRef.current.has(trackUri) && !creatingRef.current.has(trackUri),
      );
      return {
        ready,
        total: wantedUris.length,
        allReady: !mounting && !missing && ready === wantedUris.length,
        leadReady,
        leadAudible,
      };
    }, [apiReady, wantedUris, poolTick, uri]);

    useEffect(() => {
      onWarmChange?.(warmState);
    }, [warmState, onWarmChange]);

    useEffect(() => {
      const win = window as SpotifyWindow;
      let cancelled = false;
      const pool = poolRef.current;
      const creating = creatingRef.current;

      function captureApi(api: IFrameAPI) {
        if (cancelled) return;
        win.__spotifyIframeApi = api;
        apiRef.current = api;
        setApiReady(true);
      }

      if (win.__spotifyIframeApi) {
        captureApi(win.__spotifyIframeApi);
      } else {
        const previous = win.onSpotifyIframeApiReady;
        win.onSpotifyIframeApiReady = (api) => {
          previous?.(api);
          captureApi(api);
        };
        if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
          const script = document.createElement("script");
          script.src = SCRIPT_SRC;
          script.async = true;
          document.body.appendChild(script);
        }
      }

      return () => {
        cancelled = true;
        clearSwitchTimer();
        clearEnforceTimers();
        clearCutoverTimer();
        clearLoopCutoverTimer();
        clearLoopWatchTimer();
        clearAllEndTimers();
        for (const entry of pool.values()) {
          entry.controller.destroy();
          // Adopted warm leads live in a body-level wrapper, not the shell.
          removeWarmLeadWrapper(entry.host);
        }
        pool.clear();
        creating.clear();
        loopTwinRef.current?.controller.destroy();
        loopTwinRef.current = null;
        loopTwinCreatingRef.current = false;
      };
    }, []);

    // Lead-first: release the other embeds once the lead is ready or after a cap.
    useEffect(() => {
      if (restReleased || !apiReady) return;
      const lead = asTrackUri(uri);
      if (!lead || poolRef.current.get(lead)?.ready) {
        soundtrackDebug("restReleased", { reason: lead ? "leadReady" : "noLead" });
        setRestReleased(true);
        return;
      }
      const timer = window.setTimeout(() => {
        soundtrackDebug("restReleased", { reason: "timeout" });
        setRestReleased(true);
      }, REST_RELEASE_FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }, [apiReady, restReleased, uri, poolTick]);

    // Mount the single loop twin once the IFrame API is ready.
    useEffect(() => {
      if (!apiReady || !restReleased) return;
      if (loopTwinRef.current || loopTwinCreatingRef.current) return;
      const api = apiRef.current;
      const shell = poolShellRef.current;
      if (!api || !shell) return;

      const seedUri = asTrackUri(uri) ?? wantedUris[0];
      if (!seedUri) return;

      loopTwinCreatingRef.current = true;
      const mount = document.createElement("div");
      mount.dataset.spotifyUri = seedUri;
      mount.dataset.spotifySlot = "loop";
      mount.className = HOST_WARM;
      const target = document.createElement("div");
      mount.appendChild(target);
      shell.appendChild(mount);
      setPoolTick((n) => n + 1);

      api.createController(
        target,
        { uri: seedUri, width: "100%", height: 80 },
        (controller) => {
          loopTwinCreatingRef.current = false;
          if (!poolShellRef.current?.contains(mount)) {
            controller.destroy();
            return;
          }
          const entry: PoolEntry = {
            uri: seedUri,
            controller,
            host: mount,
            ready: false,
            audible: false,
            slot: "loop",
          };
          loopTwinRef.current = entry;
          controller.loadUri(seedUri, false, START_AT_SEC);
          attachEntryListeners(entry);
          setPoolTick((n) => n + 1);
        },
      );
    }, [apiReady, restReleased, uri, wantedUris]);

    // Warm a controller per unique act URI as soon as the IFrame API is ready.
    // Lead first; the rest wait for restReleased.
    useEffect(() => {
      if (!apiReady) return;
      const api = apiRef.current;
      const shell = poolShellRef.current;
      if (!api || !shell) return;
      const lead = asTrackUri(uri);

      for (const trackUri of wantedUris) {
        if (poolRef.current.has(trackUri) || creatingRef.current.has(trackUri)) {
          continue;
        }
        if (!restReleased && trackUri !== lead) continue;

        // Gate already started this embed (~2s head start): adopt, don't recreate.
        const warm = trackUri === lead ? takeWarmLead(trackUri) : null;
        if (warm) {
          const entry: PoolEntry = {
            uri: trackUri,
            controller: warm.controller as EmbedController,
            host: warm.host,
            ready: false,
            audible: false,
            slot: "act",
          };
          poolRef.current.set(trackUri, entry);
          attachEntryListeners(entry);
          // Same assumption as attachEntryListeners' 2s fallback, but counted
          // from when the gate created the embed, not from adoption.
          const warmAgeMs = performance.now() - warm.createdAt;
          soundtrackDebug("embed.adopted", {
            uri: shortUri(trackUri),
            alreadyReady: warm.ready,
            warmAgeMs: Math.round(warmAgeMs),
          });
          if (warm.ready || warmAgeMs >= READY_FALLBACK_MS) {
            entry.ready = true;
            soundtrackDebug("embed.ready", { uri: shortUri(trackUri), slot: "act" });
          }
          // Already playing from the View example click: claim the act slot
          // here. syncPlayback's first-start branch would call play() again and
          // the embed restarts from 0 (audible stutter ~1s into the track).
          if (
            warm.playStarted &&
            enabledRef.current &&
            !playingUriRef.current &&
            trackUri === asTrackUri(uri)
          ) {
            // Like playFromUserGesture: commit first so runSync below targets
            // this URI (a null commit would pauseExcept([]) the live lead).
            committedUriRef.current = trackUri;
            playingUriRef.current = trackUri;
            playingSlotRef.current = "act";
            incomingUriRef.current = null;
            incomingLoopSlotRef.current = null;
            clearLoopCutoverTimer();
            loopTwinHotRef.current = false;
            actSlotHotRef.current = false;
            needsResumeRef.current = false;
            entry.host.className = HOST_LIVE;
            entry.audible = true;
            soundtrackDebug("embed.adopted.claimed", { uri: shortUri(trackUri) });
          }
          setPoolTick((n) => n + 1);
          runSync(committedUriRef.current, enabledRef.current);
          continue;
        }

        const mount = document.createElement("div");
        mount.dataset.spotifyUri = trackUri;
        mount.dataset.spotifySlot = "act";
        mount.className = HOST_WARM;
        const target = document.createElement("div");
        mount.appendChild(target);
        shell.appendChild(mount);
        creatingRef.current.add(trackUri);
        setPoolTick((n) => n + 1);

        api.createController(
          target,
          { uri: trackUri, width: "100%", height: 80 },
          (controller) => {
            creatingRef.current.delete(trackUri);
            if (!poolShellRef.current?.contains(mount)) {
              controller.destroy();
              return;
            }

            const entry: PoolEntry = {
              uri: trackUri,
              controller,
              host: mount,
              ready: false,
              audible: false,
              slot: "act",
            };
            poolRef.current.set(trackUri, entry);
            controller.loadUri(trackUri, false, START_AT_SEC);
            attachEntryListeners(entry);
            setPoolTick((n) => n + 1);
            runSync(committedUriRef.current, enabledRef.current);
          },
        );
      }
    }, [apiReady, restReleased, uri, wantedUris]);

    // Keep twin loaded for the committed act.
    useEffect(() => {
      if (!enabled) return;
      const target = asTrackUri(uri);
      if (target) ensureTwinUri(target);
    }, [uri, enabled, poolTick]);

    useEffect(() => {
      if (!enabled) {
        clearSwitchTimer();
        clearCutoverTimer();
        clearLoopCutoverTimer();
        clearAllEndTimers();
        incomingUriRef.current = null;
        incomingLoopSlotRef.current = null;
        aheadUriRef.current = null;
        committedUriRef.current = uri;

        // Gate arm / parked hot prime must survive soundOn=false: runSync(false)
        // would pause the buffer we're about to resume() on Continue.
        if (armingLeadRef.current) {
          setVisibleUri(null);
          return;
        }
        if (hotPrimedUriRef.current && playingUriRef.current == null) {
          setVisibleUri(null);
          return;
        }

        clearPrimeFinishTimer();
        primingUriRef.current = null;
        hotPrimedUriRef.current = null;
        runSync(uri, false);
        return;
      }

      if (aheadUriRef.current) {
        if (uri === aheadUriRef.current) {
          aheadUriRef.current = null;
          clearSwitchTimer();
          committedUriRef.current = uri;
          if (
            playingUriRef.current === uri ||
            incomingUriRef.current === uri
          ) {
            ensureTwinUri(uri);
            return;
          }
          runSync(uri, true);
        }
        return;
      }

      if (!uri) {
        clearSwitchTimer();
        clearCutoverTimer();
        clearLoopCutoverTimer();
        incomingUriRef.current = null;
        incomingLoopSlotRef.current = null;
        committedUriRef.current = null;
        runSync(null, true);
        return;
      }

      if (
        uri === playingUriRef.current ||
        uri === committedUriRef.current
      ) {
        clearSwitchTimer();
        clearCutoverTimer();
        incomingUriRef.current = null;
        committedUriRef.current = uri;
        runSync(uri, true);
        return;
      }

      committedUriRef.current = uri;
      playingSlotRef.current = "act";
      incomingLoopSlotRef.current = null;
      clearLoopCutoverTimer();
      runSync(uri, true);

      clearSwitchTimer();
      switchTimerRef.current = window.setTimeout(() => {
        switchTimerRef.current = null;
        if (aheadUriRef.current) return;
        committedUriRef.current = activeUriRef.current;
        runSync(committedUriRef.current, enabledRef.current);
      }, URI_SWITCH_DEBOUNCE_MS);

      return () => {
        clearSwitchTimer();
      };
    }, [uri, enabled]);

    useEffect(() => {
      // Don't let readiness ticks pause an in-flight gate arm / parked prime.
      if (armingLeadRef.current) return;
      if (hotPrimedUriRef.current && !enabledRef.current) return;
      runSync(committedUriRef.current, enabledRef.current);
    }, [poolTick]);

    /**
     * Sync-pause on tab/app hide. Background Chrome throttles React, so waiting
     * for enabled=false via sticky pause leaves Spotify audio running (D-031).
     */
    const pauseForDocumentHide = useEffectEvent(() => {
      soundtrackDebug("visibilitychange", {
        hidden: true,
        source: "DeckSoundtrack.pauseForDocumentHide",
        playingUri: shortUri(playingUriRef.current),
      });
      hidePauseLatchRef.current = true;
      enabledRef.current = false;
      sawPausedWhileDisabledRef.current = false;
      if (playingUriRef.current) needsResumeRef.current = true;

      clearSwitchTimer();
      clearEnforceTimers();
      clearCutoverTimer();
      clearPrimeFinishTimer();
      clearLoopCutoverTimer();
      clearAllEndTimers();
      incomingUriRef.current = null;
      incomingLoopSlotRef.current = null;
      aheadUriRef.current = null;
      primingUriRef.current = null;
      hotPrimedUriRef.current = null;
      armingLeadRef.current = false;
      pendingGesturePlayRef.current = false;

      for (const entry of poolRef.current.values()) {
        entry.controller.pause();
        entry.host.className = HOST_IDLE;
      }
      const twin = loopTwinRef.current;
      if (twin) {
        twin.controller.pause();
        twin.host.className = HOST_IDLE;
      }
      loopTwinHotRef.current = false;
      actSlotHotRef.current = false;

      notifyExternalPause();
    });

    useEffect(() => {
      function onVis() {
        if (!document.hidden) return;
        pauseForDocumentHide();
      }
      document.addEventListener("visibilitychange", onVis);
      return () => document.removeEventListener("visibilitychange", onVis);
    }, [pauseForDocumentHide]);

    function turnOn() {
      pendingGesturePlayRef.current = true;
      enabledRef.current = true;
      needsResumeRef.current = false;
      clearSwitchTimer();
      committedUriRef.current = uri;
      setEnabled(true);
      runSync(uri, true);
      if (uri && playingUriRef.current === uri) {
        pendingGesturePlayRef.current = false;
      }
    }

    function turnOff() {
      pendingGesturePlayRef.current = false;
      armingLeadRef.current = false;
      clearSwitchTimer();
      clearEnforceTimers();
      clearCutoverTimer();
      clearPrimeFinishTimer();
      clearLoopCutoverTimer();
      clearAllEndTimers();
      incomingUriRef.current = null;
      incomingLoopSlotRef.current = null;
      aheadUriRef.current = null;
      primingUriRef.current = null;
      hotPrimedUriRef.current = null;
      inflightCutRef.current = null;
      cutWaitersRef.current.clear();
      setEnabled(false);
      if (playingUriRef.current) needsResumeRef.current = true;
      for (const entry of poolRef.current.values()) {
        entry.controller.pause();
        entry.host.className = HOST_IDLE;
      }
      const twin = loopTwinRef.current;
      if (twin) {
        twin.controller.pause();
        twin.host.className = HOST_IDLE;
      }
      setVisibleUri(null);
    }

    const canEnable = apiReady && uri != null && wantedUris.length > 0;
    const activeReady = uri ? poolRef.current.get(uri)?.ready === true : false;
    const shellOnStage = Boolean(showPlayer && enabled && visibleUri);

    return (
      <div
        className={cn(
          "pointer-events-none fixed bottom-4 left-1/2 z-30 flex w-[min(calc(100vw-1.5rem),20rem)] -translate-x-1/2 flex-col gap-2",
          className,
        )}
      >
        {showToggle ? (
          <div className="pointer-events-auto">
            {enabled ? (
              <button
                type="button"
                onClick={turnOff}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:border-ring"
                aria-label="Mute soundtrack"
              >
                <Icon
                  icon={volumeHighOutline}
                  className="h-3.5 w-3.5 text-warn"
                />
                Mute
              </button>
            ) : (
              <button
                type="button"
                onClick={turnOn}
                disabled={!canEnable}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:border-ring disabled:opacity-40"
                aria-label="Enable soundtrack"
              >
                <Icon icon={volumeMuteOutline} className="h-3.5 w-3.5" />
                Sound on
                {uri && !activeReady ? (
                  <span className="text-muted-foreground">…</span>
                ) : null}
              </button>
            )}
          </div>
        ) : null}

        <div
          ref={poolShellRef}
          className={cn(
            // Real box + non-zero opacity so iOS will still buffer embeds.
            "h-20 w-full overflow-hidden rounded-md",
            shellOnStage
              ? "pointer-events-auto relative opacity-100"
              : // Off the story stage (not in flex flow) so a warm shell
                // cannot cover list rows / bottom padding on mobile.
                "pointer-events-none absolute left-0 top-0 -translate-x-[200vw] opacity-[0.01]",
          )}
          aria-hidden={!shellOnStage}
        />
      </div>
    );
  },
);

/**
 * Play the target URI. On act switches, start the next embed while the previous
 * stays audible, then cut when the next reports playback (Spotify has no mute).
 * Same-URI pause/unmute uses resume() on the owning slot so position is preserved.
 */
function syncPlayback(
  poolRef: MutableRefObject<Map<string, PoolEntry>>,
  loopTwinRef: MutableRefObject<PoolEntry | null>,
  playingUriRef: MutableRefObject<string | null>,
  playingSlotRef: MutableRefObject<PlaySlot>,
  incomingUriRef: MutableRefObject<string | null>,
  incomingLoopSlotRef: MutableRefObject<PlaySlot | null>,
  needsResumeRef: MutableRefObject<boolean>,
  syncGenRef: MutableRefObject<number>,
  enforceTimersRef: MutableRefObject<number[]>,
  cutoverTimerRef: MutableRefObject<number | null>,
  activeUri: string | null,
  enabled: boolean,
  setVisibleUri: (uri: string | null) => void,
  onCutComplete?: (trackUri: string) => void,
  onActOwnership?: () => void,
) {
  const pool = poolRef.current;
  const gen = ++syncGenRef.current;

  for (const id of enforceTimersRef.current) window.clearTimeout(id);
  enforceTimersRef.current = [];

  function pauseExcept(keep: ReadonlyArray<{ uri: string; slot: PlaySlot }>) {
    const keepAct = new Set(
      keep.filter((k) => k.slot === "act").map((k) => k.uri),
    );
    const keepLoop = keep.some((k) => k.slot === "loop");
    for (const entry of poolRef.current.values()) {
      if (keepAct.has(entry.uri)) continue;
      entry.controller.pause();
      entry.host.className = HOST_IDLE;
    }
    const twin = loopTwinRef.current;
    if (twin && !keepLoop) {
      twin.controller.pause();
      twin.host.className = HOST_IDLE;
    }
  }

  function enforceKeep(keep: ReadonlyArray<{ uri: string; slot: PlaySlot }>) {
    if (syncGenRef.current !== gen) return;
    pauseExcept(keep);
  }

  function scheduleEnforce(
    keep: ReadonlyArray<{ uri: string; slot: PlaySlot }>,
  ) {
    for (const delay of [0, 50, 150, 350]) {
      const id = window.setTimeout(() => enforceKeep(keep), delay);
      enforceTimersRef.current.push(id);
    }
  }

  function clearCutoverTimer() {
    if (cutoverTimerRef.current != null) {
      window.clearTimeout(cutoverTimerRef.current);
      cutoverTimerRef.current = null;
    }
  }

  function liveEntryFor(trackUri: string, slot: PlaySlot): PoolEntry | null {
    if (slot === "act") return poolRef.current.get(trackUri) ?? null;
    const twin = loopTwinRef.current;
    return twin && twin.uri === trackUri ? twin : null;
  }

  function scheduleCutoverFallback(trackUri: string) {
    clearCutoverTimer();
    cutoverTimerRef.current = window.setTimeout(() => {
      cutoverTimerRef.current = null;
      if (syncGenRef.current !== gen) return;
      if (!enabled) return;
      if (playingUriRef.current === trackUri) {
        onCutComplete?.(trackUri);
        return;
      }
      if (incomingUriRef.current !== trackUri) return;
      incomingUriRef.current = null;
      playingUriRef.current = trackUri;
      playingSlotRef.current = "act";
      incomingLoopSlotRef.current = null;
      onActOwnership?.();
      needsResumeRef.current = false;
      const entry = poolRef.current.get(trackUri);
      if (entry) {
        entry.host.className = HOST_LIVE;
        // Already heard audio during prime/overlap: keep it going; do not leave a hole.
        if (entry.audible) {
          entry.controller.play();
        }
      }
      pauseExcept([{ uri: trackUri, slot: "act" }]);
      setVisibleUri(trackUri);
      soundtrackDebug("cutoverFallback", {
        uri: shortUri(trackUri),
        ms: CUTOVER_FALLBACK_MS,
        entryReady: entry?.ready === true,
        entryAudible: entry?.audible === true,
      });
      onCutComplete?.(trackUri);
    }, CUTOVER_FALLBACK_MS);
  }

  if (!enabled) {
    if (playingUriRef.current) needsResumeRef.current = true;
    clearCutoverTimer();
    incomingUriRef.current = null;
    pauseExcept([]);
    setVisibleUri(null);
    return;
  }

  if (!activeUri) {
    clearCutoverTimer();
    incomingUriRef.current = null;
    incomingLoopSlotRef.current = null;
    pauseExcept([]);
    playingUriRef.current = null;
    playingSlotRef.current = "act";
    needsResumeRef.current = false;
    setVisibleUri(null);
    return;
  }

  const next = pool.get(activeUri);
  if (!next) {
    const keep: Array<{ uri: string; slot: PlaySlot }> = [];
    if (playingUriRef.current) {
      keep.push({
        uri: playingUriRef.current,
        slot: playingSlotRef.current,
      });
    }
    scheduleEnforce(keep);
    return;
  }

  if (!next.ready) {
    const playingUri = playingUriRef.current;
    if (playingUri && playingUri !== activeUri) {
      const playing = liveEntryFor(playingUri, playingSlotRef.current);
      if (playing) {
        setVisibleUri(playing.uri);
        playing.host.className = HOST_LIVE;
        scheduleEnforce([{ uri: playing.uri, slot: playingSlotRef.current }]);
        return;
      }
    }
  }

  // Same URI already owning audio: preserve the active A/B slot.
  if (playingUriRef.current === activeUri) {
    clearCutoverTimer();
    incomingUriRef.current = null;
    setVisibleUri(activeUri);
    const live = liveEntryFor(activeUri, playingSlotRef.current) ?? next;
    live.host.className = HOST_LIVE;
    const keep: Array<{ uri: string; slot: PlaySlot }> = [
      { uri: activeUri, slot: playingSlotRef.current },
    ];
    if (incomingLoopSlotRef.current) {
      keep.push({ uri: activeUri, slot: incomingLoopSlotRef.current });
    }
    // Keep the loop twin warm/hot-primed: enforce sweeps must not kill it.
    if (
      loopTwinRef.current?.uri === activeUri &&
      !keep.some((k) => k.slot === "loop")
    ) {
      keep.push({ uri: activeUri, slot: "loop" });
    }
    pauseExcept(keep);
    if (needsResumeRef.current) {
      needsResumeRef.current = false;
      live.controller.resume();
      scheduleEnforce(keep);
    }
    return;
  }

  if (incomingUriRef.current === activeUri) {
    const keep: Array<{ uri: string; slot: PlaySlot }> = [
      { uri: activeUri, slot: "act" },
    ];
    if (playingUriRef.current) {
      keep.push({
        uri: playingUriRef.current,
        slot: playingSlotRef.current,
      });
    }
    scheduleEnforce(keep);
    scheduleCutoverFallback(activeUri);
    return;
  }

  const previousIncoming = incomingUriRef.current;
  if (
    previousIncoming &&
    previousIncoming !== activeUri &&
    previousIncoming !== playingUriRef.current
  ) {
    pool.get(previousIncoming)?.controller.pause();
    const abandoned = pool.get(previousIncoming);
    if (abandoned) abandoned.host.className = HOST_IDLE;
  }

  // First start: claim act slot.
  if (!playingUriRef.current) {
    clearCutoverTimer();
    incomingUriRef.current = null;
    playingUriRef.current = activeUri;
    playingSlotRef.current = "act";
    incomingLoopSlotRef.current = null;
    onActOwnership?.();
    needsResumeRef.current = false;
    next.host.className = HOST_LIVE;
    next.controller.play();
    setVisibleUri(activeUri);
    pauseExcept([{ uri: activeUri, slot: "act" }]);
    scheduleEnforce([{ uri: activeUri, slot: "act" }]);
    return;
  }

  // Act-switch overlap: always target the act pool entry for the new URI.
  incomingUriRef.current = activeUri;
  incomingLoopSlotRef.current = null;
  needsResumeRef.current = false;
  next.host.className = HOST_LIVE;
  next.controller.play();

  const keep: Array<{ uri: string; slot: PlaySlot }> = [
    { uri: activeUri, slot: "act" },
    {
      uri: playingUriRef.current,
      slot: playingSlotRef.current,
    },
  ];
  const prev = liveEntryFor(playingUriRef.current, playingSlotRef.current);
  if (prev) {
    prev.host.className = HOST_LIVE;
    setVisibleUri(prev.uri);
  }
  scheduleEnforce(keep);
  scheduleCutoverFallback(activeUri);
}
