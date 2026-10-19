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
import { cn } from "@/lib/utils";

/** Call from a click handler so Safari/Chrome allow Spotify embed playback. */
export type DeckSoundtrackHandle = {
  playFromUserGesture: () => void;
  /**
   * Gate-only: play the lead until audible, then pause near START_AT_SEC.
   * Spotify has no mute — this is the “pre-roll then unmute” stand-in.
   * Call from Continue pointerdown; playFromUserGesture resume()s the hot buffer.
   */
  armLeadFromGesture: () => void;
  /** Sync read — true when the lead URI has produced audio (not React-warm lag). */
  isLeadAudible: () => boolean;
  /**
   * Speculatively start the next act, then pause it once audible so the
   * current track stays solo. Call from pointerdown; follow with cutTo on navigate.
   */
  primeTo: (uri: string | null) => void;
  /**
   * Make uri exclusively own audio (resumes a hot prime when possible) and
   * resolve when the cut is done. Await before changing slides.
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
 * Slack is wide — playback_update is sparse (~0.5–1s).
 */
const END_RESTART_MS = 2500;
/** Playback / loop restart offset (seconds into the track). */
const START_AT_SEC = 0;
/** Ignore end-detection for this long after we kick a loop (avoids seek/play thrash). */
const LOOP_COOLDOWN_MS = 1200;
/**
 * Start the idle A/B slot this many ms before the preview ends so cutover can
 * overlap the dying tail (Spotify has no mute — brief double-audio is OK).
 */
const LOOP_CUT_LEAD_MS = 1000;
/**
 * Fallback when Spotify stops emitting playback_update at preview end and the
 * twin cutover never armed.
 */
const END_LOOP_SCHEDULE_PAD_MS = 250;
const END_STALL_LOOP_MS = 900;

/** Which embed owns audio for the committed URI (act pool vs loop twin). */
type PlaySlot = "act" | "loop";

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
};

/** Hidden but still painted — opacity:0 iframes often won't buffer on iOS. */
const HOST_WARM =
  "absolute inset-0 w-full overflow-hidden opacity-[0.02] pointer-events-none";
const HOST_LIVE =
  "absolute inset-0 w-full overflow-hidden opacity-100 pointer-events-auto";
const HOST_IDLE =
  "absolute inset-0 w-full overflow-hidden opacity-[0.02] pointer-events-none";

const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";

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

/** Unique soundtrack URIs across a deck (for warm-up). */
export function collectSoundtrackUris(
  getUri: (slideIndex: number) => string | null,
  slideCount: number,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = 0; i < slideCount; i++) {
    const uri = getUri(i);
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    out.push(uri);
  }
  return out;
}

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
     * Spotify embeds have no mute API — overlap + cut on audible is the
     * closest thing to "pre-start muted, unmute on slide."
     */
    const incomingUriRef = useRef<string | null>(null);
    /** Idle A/B slot already play()-ing for a same-URI sample loop cutover. */
    const incomingLoopSlotRef = useRef<PlaySlot | null>(null);
    /** Bumps on every committed sync so late embed play() can be ignored. */
    const syncGenRef = useRef(0);
    const switchTimerRef = useRef<number | null>(null);
    const enforceTimersRef = useRef<number[]>([]);
    const cutoverTimerRef = useRef<number | null>(null);
    const loopCutoverTimerRef = useRef<number | null>(null);
    /**
     * Audio advanced ahead of the slide `uri` prop (cutTo before setActive).
     * While set, the uri effect must not sync back to the outgoing slide.
     */
    const aheadUriRef = useRef<string | null>(null);
    /**
     * Speculative next act: play() started, pause on first audible (hot prime).
     * Does not cut the current act — cancelled presses won't steal the soundtrack.
     */
    const primingUriRef = useRef<string | null>(null);
    /** URI that played briefly and is paused near START_AT_SEC for instant resume. */
    const hotPrimedUriRef = useRef<string | null>(null);
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
    /** True after we pause() while a URI was active — next enable should resume(). */
    const needsResumeRef = useRef(false);
    /** Continue tapped before the embed was warm — play on the next ready tick. */
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
          /** False until we see mid-sample progress — blocks stale end-position re-cuts. */
          seenHealthyProgress: boolean;
        }
      >
    >(new Map());
    /** Fallback end timers keyed by slot+uri. */
    const endLoopTimersRef = useRef<Map<string, number>>(new Map());
    const stallLoopTimersRef = useRef<Map<string, number>>(new Map());

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

    function clearLoopCutoverTimer() {
      if (loopCutoverTimerRef.current != null) {
        window.clearTimeout(loopCutoverTimerRef.current);
        loopCutoverTimerRef.current = null;
      }
    }

    function clearEndTimersFor(key: string) {
      const endId = endLoopTimersRef.current.get(key);
      if (endId != null) {
        window.clearTimeout(endId);
        endLoopTimersRef.current.delete(key);
      }
      const stallId = stallLoopTimersRef.current.get(key);
      if (stallId != null) {
        window.clearTimeout(stallId);
        stallLoopTimersRef.current.delete(key);
      }
    }

    function clearAllEndTimers() {
      for (const id of endLoopTimersRef.current.values()) window.clearTimeout(id);
      endLoopTimersRef.current.clear();
      for (const id of stallLoopTimersRef.current.values()) {
        window.clearTimeout(id);
      }
      stallLoopTimersRef.current.clear();
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

    /** Slot-aware: act URI allowed for act switch / prime / owning act slot. */
    function isActPlaybackAllowed(trackUri: string): boolean {
      // Gate arm may run before soundOn — still allow the lead chirp→pause.
      if (
        armingLeadRef.current &&
        primingUriRef.current === trackUri
      ) {
        return true;
      }
      if (!enabledRef.current) return false;
      if (primingUriRef.current === trackUri) return true;
      if (incomingUriRef.current === trackUri) return true;
      if (playingUriRef.current !== trackUri) return false;
      return (
        playingSlotRef.current === "act" ||
        incomingLoopSlotRef.current === "act"
      );
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
      // loadUri may not re-fire `ready`; don't block A/B loops forever.
      window.setTimeout(() => {
        if (loopTwinRef.current !== twin) return;
        if (twin.uri !== trackUri) return;
        if (twin.ready) return;
        twin.ready = true;
        setPoolTick((n) => n + 1);
      }, 2000);
    }

    /**
     * Priming path: next act became audible — pause it hot so the current act
     * stays solo until cutTo commits the switch.
     */
    function tryFinishPrime(trackUri: string) {
      if (primingUriRef.current !== trackUri) return false;
      // cutTo / Continue took over — let tryCutover / live play own this audible event.
      if (
        aheadUriRef.current === trackUri ||
        incomingUriRef.current === trackUri
      ) {
        return false;
      }
      const entry = poolRef.current.get(trackUri);
      if (!entry) return true;
      entry.controller.pause();
      // Re-park at the hook so resume() doesn't continue mid-phrase from the chirp.
      entry.controller.seek(START_AT_SEC);
      entry.host.className = HOST_IDLE;
      primingUriRef.current = null;
      armingLeadRef.current = false;
      hotPrimedUriRef.current = trackUri;
      if (incomingUriRef.current === trackUri) incomingUriRef.current = null;
      return true;
    }

    /** Finish same-URI A/B loop cutover when the idle slot is audible. */
    function tryLoopCutover(trackUri: string, slot: PlaySlot) {
      if (!enabledRef.current) return;
      if (incomingLoopSlotRef.current !== slot) return;
      if (committedUriRef.current !== trackUri) return;
      if (playingUriRef.current !== trackUri) return;

      const retiring = otherSlot(slot);
      const live = getSlotEntry(slot, trackUri);
      const dead = getSlotEntry(retiring, trackUri);
      clearLoopCutoverTimer();
      clearAllEndTimers();
      incomingLoopSlotRef.current = null;
      playingSlotRef.current = slot;
      needsResumeRef.current = false;

      if (live) {
        live.host.className = HOST_LIVE;
        live.audible = true;
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
    }

    /**
     * Incoming act embed is producing sound — kill the previous act (overlap cutover).
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
        // Same URI already playing on some slot — don't yank back to act mid-loop
        // unless this is a fresh act-switch incoming.
        if (incomingUriRef.current === trackUri) {
          incomingUriRef.current = null;
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
          primingUriRef.current = null;
          clearCutoverTimer();
        }
        resolveCutWaiters(trackUri);
        return;
      }
      clearCutoverTimer();
      incomingUriRef.current = null;
      primingUriRef.current = null;
      hotPrimedUriRef.current =
        hotPrimedUriRef.current === trackUri ? null : hotPrimedUriRef.current;
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
    }

    function canBeginLoop(trackUri: string) {
      const state = loopStateFor(trackUri);
      return (
        enabledRef.current &&
        committedUriRef.current === trackUri &&
        playingUriRef.current === trackUri &&
        incomingLoopSlotRef.current == null &&
        incomingUriRef.current == null &&
        state.seenHealthyProgress &&
        Date.now() >= state.cooldownUntil
      );
    }

    /** Same-embed restart — only when the idle twin/act slot isn't usable. */
    function fallbackLoopRestart(trackUri: string, slot: PlaySlot) {
      if (!canBeginLoop(trackUri)) return false;
      const entry = getSlotEntry(slot, trackUri);
      if (!entry) return false;
      const state = loopStateFor(trackUri);
      state.lastPlayingPosition = 0;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
      entry.controller.restart();
      entry.controller.seek(START_AT_SEC);
      entry.controller.play();
      return true;
    }

    /** Start the idle A/B slot early; cut when it reports audible. */
    function beginLoopCutover(trackUri: string) {
      if (!canBeginLoop(trackUri)) return false;
      const from = playingSlotRef.current;
      const to = otherSlot(from);
      const idle = getSlotEntry(to, trackUri);
      if (!idle?.ready) {
        return fallbackLoopRestart(trackUri, from);
      }

      incomingLoopSlotRef.current = to;
      idle.host.className = HOST_LIVE;
      const hot =
        (to === "loop" && loopTwinHotRef.current) ||
        (to === "act" && actSlotHotRef.current);
      if (hot) {
        if (to === "loop") loopTwinHotRef.current = false;
        if (to === "act") actSlotHotRef.current = false;
        idle.controller.resume();
      } else {
        idle.controller.seek(START_AT_SEC);
        idle.controller.play();
      }

      clearLoopCutoverTimer();
      clearAllEndTimers();
      loopCutoverTimerRef.current = window.setTimeout(() => {
        loopCutoverTimerRef.current = null;
        if (incomingLoopSlotRef.current !== to) return;
        tryLoopCutover(trackUri, to);
      }, CUTOVER_FALLBACK_MS);

      const state = loopStateFor(trackUri);
      state.seenHealthyProgress = false;
      state.cooldownUntil = Date.now() + LOOP_COOLDOWN_MS;
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
      if (!canBeginLoop(trackUri) && incomingLoopSlotRef.current == null) return;

      const remaining = duration - position;
      const key = `${slot}:${trackUri}`;

      // Primary path: arm A/B cutover before the sample dies.
      if (remaining <= LOOP_CUT_LEAD_MS && incomingLoopSlotRef.current == null) {
        beginLoopCutover(trackUri);
        clearEndTimersFor(key);
        return;
      }

      if (remaining > END_RESTART_MS + 1500) {
        clearEndTimersFor(key);
        return;
      }

      // Fallback if cutover never armed (twin not ready / events stop).
      const endId = endLoopTimersRef.current.get(key);
      if (endId != null) window.clearTimeout(endId);
      const delay = Math.max(0, remaining + END_LOOP_SCHEDULE_PAD_MS);
      endLoopTimersRef.current.set(
        key,
        window.setTimeout(() => {
          endLoopTimersRef.current.delete(key);
          if (incomingLoopSlotRef.current) return;
          beginLoopCutover(trackUri);
        }, delay),
      );

      const stallId = stallLoopTimersRef.current.get(key);
      if (stallId != null) window.clearTimeout(stallId);
      stallLoopTimersRef.current.set(
        key,
        window.setTimeout(() => {
          stallLoopTimersRef.current.delete(key);
          const state = loopStateFor(trackUri);
          if (
            state.lastPlayingPosition >= duration - END_RESTART_MS ||
            position >= duration - END_RESTART_MS
          ) {
            if (incomingLoopSlotRef.current) return;
            beginLoopCutover(trackUri);
          }
        }, END_STALL_LOOP_MS),
      );
    }

    const notifyExternalPause = useEffectEvent(() => {
      onExternalPause?.();
    });
    const notifyExternalResume = useEffectEvent(() => {
      onExternalResume?.();
    });

    const attachEntryListeners = useEffectEvent((entry: PoolEntry) => {
      const { controller, slot } = entry;
      const trackUriFor = () => entry.uri;

      const finishReady = () => {
        if (entry.ready) return;
        entry.ready = true;
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
      window.setTimeout(finishReady, 2000);

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
          tryLoopCutover(trackUri, "loop");
          return;
        }

        if (!isActPlaybackAllowed(trackUri)) {
          controller.pause();
          return;
        }
        if (!entry.audible) {
          entry.audible = true;
          setPoolTick((n) => n + 1);
        }
        if (incomingLoopSlotRef.current === "act") {
          tryLoopCutover(trackUri, "act");
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
            // Media-key / OS resume while story sticky-pause left us disabled —
            // ask the parent to clear pause instead of fighting the play.
            if (
              !enabledRef.current &&
              playingUriRef.current === trackUri &&
              playingSlotRef.current === slot
            ) {
              notifyExternalResume();
              return;
            }
            controller.pause();
            return;
          }

          if (!entry.audible) {
            entry.audible = true;
            setPoolTick((n) => n + 1);
          }

          if (slot === "loop") {
            if (incomingLoopSlotRef.current === "loop") {
              tryLoopCutover(trackUri, "loop");
            }
          } else if (incomingLoopSlotRef.current === "act") {
            tryLoopCutover(trackUri, "act");
          } else if (incomingUriRef.current === trackUri) {
            tryCutover(trackUri);
          }

          if (
            playingSlotRef.current === slot &&
            playingUriRef.current === trackUri
          ) {
            scheduleLoopFromPlayback(trackUri, slot, position, duration);
          }
          return;
        }

        // Paused path — fallback end detection for the owning slot only.
        if (!enabledRef.current) {
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
          beginLoopCutover(trackUri);
          return;
        }
        // Mid-sample pause while we still wanted audio — hardware media keys.
        if (state.seenHealthyProgress) {
          notifyExternalPause();
        }
      });
    });

    const [apiReady, setApiReady] = useState(false);
    const [uncontrolledEnabled, setUncontrolledEnabled] = useState(false);
    const [poolTick, setPoolTick] = useState(0);
    const [visibleUri, setVisibleUri] = useState<string | null>(null);

    const controlled = enabledProp !== undefined;
    const enabled = controlled ? enabledProp : uncontrolledEnabled;

    function setEnabled(next: boolean) {
      onEnabledChange?.(next);
      if (!controlled) setUncontrolledEnabled(next);
    }

    enabledRef.current = enabled;
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

        // Spotify has no mute — play until audible, then pause at the hook.
        armingLeadRef.current = true;
        primingUriRef.current = target;
        entry.host.className = HOST_WARM;
        entry.controller.seek(START_AT_SEC);
        entry.controller.play();
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

        // Arm still buffering — promote to live play (don't pause on audible).
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
            // play() already in flight from arm — nudge in case it stalled.
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
          poolRef.current.get(prevPrime)?.controller.pause();
        }

        const entry = poolRef.current.get(target);
        if (!entry?.ready) return;

        clearEnforceTimers();
        primingUriRef.current = target;
        entry.host.className = HOST_WARM;
        entry.controller.play();
      },
      cutTo(nextUri: string | null) {
        const target = asTrackUri(nextUri);
        if (!enabledRef.current) return Promise.resolve();
        if (!target) return Promise.resolve();
        if (
          playingUriRef.current === target &&
          incomingUriRef.current == null
        ) {
          aheadUriRef.current = target;
          committedUriRef.current = target;
          primingUriRef.current = null;
          ensureTwinUri(target);
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
            primingUriRef.current = null;
            hotPrimedUriRef.current = null;
            const entry = poolRef.current.get(target);
            if (entry) {
              playingUriRef.current = target;
              playingSlotRef.current = "act";
              incomingUriRef.current = null;
              needsResumeRef.current = false;
              entry.host.className = HOST_LIVE;
              entry.controller.resume();
              pauseOthersExceptUri(target);
              ensureTwinUri(target);
              setVisibleUri(target);
              resolveCutWaiters(target);
              return;
            }
          }

          if (primingUriRef.current === target) {
            primingUriRef.current = null;
            incomingUriRef.current = target;
            runSync(target, true);
            return;
          }

          primingUriRef.current = null;
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
        clearAllEndTimers();
        for (const entry of pool.values()) {
          entry.controller.destroy();
        }
        pool.clear();
        creating.clear();
        loopTwinRef.current?.controller.destroy();
        loopTwinRef.current = null;
        loopTwinCreatingRef.current = false;
      };
    }, []);

    // Mount the single loop twin once the IFrame API is ready.
    useEffect(() => {
      if (!apiReady) return;
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
    }, [apiReady, uri, wantedUris]);

    // Warm a controller per unique act URI as soon as the IFrame API is ready.
    useEffect(() => {
      if (!apiReady) return;
      const api = apiRef.current;
      const shell = poolShellRef.current;
      if (!api || !shell) return;

      for (const trackUri of wantedUris) {
        if (poolRef.current.has(trackUri) || creatingRef.current.has(trackUri)) {
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
    }, [apiReady, wantedUris]);

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

        // Gate arm / parked hot prime must survive soundOn=false — runSync(false)
        // would pause the buffer we're about to resume() on Continue.
        if (armingLeadRef.current) {
          setVisibleUri(null);
          return;
        }
        if (hotPrimedUriRef.current && playingUriRef.current == null) {
          setVisibleUri(null);
          return;
        }

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
            "h-20 w-full overflow-hidden rounded-md",
            shellOnStage
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-[0.01]",
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
      if (entry) entry.host.className = HOST_LIVE;
      pauseExcept([{ uri: trackUri, slot: "act" }]);
      setVisibleUri(trackUri);
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

  // Same URI already owning audio — preserve the active A/B slot.
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
    // Keep the loop twin warm/hot-primed — enforce sweeps must not kill it.
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

  // First start — claim act slot.
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
