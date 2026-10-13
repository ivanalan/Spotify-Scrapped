"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import type { ScrappedReport } from "@/lib/scrapped";
import { cn } from "@/lib/utils";

type EmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (...args: unknown[]) => void) => void;
};

type PlaybackUpdateEvent = {
  data?: {
    isPaused?: boolean;
    duration?: number;
    position?: number;
  };
};

/** Restart when the embed sample ends so the deck soundtrack can run the full story. */
const END_RESTART_MS = 400;

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
};

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
};

export function DeckSoundtrack({
  uri,
  preloadUris = [],
  className,
  enabled: enabledProp,
  onEnabledChange,
  showToggle = true,
}: Props) {
  const poolShellRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<IFrameAPI | null>(null);
  const poolRef = useRef<Map<string, PoolEntry>>(new Map());
  const creatingRef = useRef<Set<string>>(new Set());
  const enabledRef = useRef(false);
  const activeUriRef = useRef<string | null>(null);
  const playingUriRef = useRef<string | null>(null);

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

  // Stable set of act URIs to warm (order sorted so the warm effect stays quiet).
  const wantedUris = useMemo(() => {
    const seen = new Set<string>();
    for (const candidate of [...preloadUris, uri]) {
      const next = asTrackUri(candidate ?? null);
      if (next) seen.add(next);
    }
    return [...seen].sort();
  }, [uri, preloadUris]);

  useEffect(() => {
    const win = window as SpotifyWindow;
    let cancelled = false;

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
      for (const entry of poolRef.current.values()) {
        entry.controller.destroy();
      }
      poolRef.current.clear();
      creatingRef.current.clear();
    };
  }, []);

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

      // Stable wrapper — createController replaces its target node with an iframe.
      const mount = document.createElement("div");
      mount.dataset.spotifyUri = trackUri;
      mount.className =
        "absolute inset-0 w-full overflow-hidden opacity-0 pointer-events-none";
      const target = document.createElement("div");
      mount.appendChild(target);
      shell.appendChild(mount);
      creatingRef.current.add(trackUri);

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
          };
          poolRef.current.set(trackUri, entry);

          const markReady = () => {
            if (entry.ready) return;
            entry.ready = true;
            setPoolTick((n) => n + 1);
            syncPlayback(
              poolRef,
              playingUriRef,
              activeUriRef.current,
              enabledRef.current,
              setVisibleUri,
            );
          };

          controller.addListener("ready", markReady);
          // Some embeds are slow/noisy with `ready`; don't block forever.
          window.setTimeout(markReady, 2000);

          // Preview samples (~30s) end mid-deck; loop while this URI is still the act.
          // Some embeds pause at duration; others snap position back to 0.
          let lastPlayingPosition = 0;
          controller.addListener("playback_update", (raw) => {
            const event = raw as PlaybackUpdateEvent;
            const { isPaused, duration = 0, position = 0 } = event.data ?? {};
            if (!isPaused) {
              lastPlayingPosition = position;
              return;
            }
            if (!enabledRef.current) return;
            if (activeUriRef.current !== trackUri) return;
            if (playingUriRef.current !== trackUri) return;
            if (duration <= 0) return;
            const pausedAtEnd = position >= duration - END_RESTART_MS;
            const resetAfterEnd =
              lastPlayingPosition >= duration - END_RESTART_MS &&
              position <= END_RESTART_MS;
            if (!pausedAtEnd && !resetAfterEnd) return;
            lastPlayingPosition = 0;
            controller.restart();
          });

          setPoolTick((n) => n + 1);
          syncPlayback(
            poolRef,
            playingUriRef,
            activeUriRef.current,
            enabledRef.current,
            setVisibleUri,
          );
        },
      );
    }
  }, [apiReady, wantedUris]);

  useEffect(() => {
    syncPlayback(
      poolRef,
      playingUriRef,
      uri,
      enabled,
      setVisibleUri,
    );
  }, [uri, enabled, poolTick]);

  function turnOn() {
    setEnabled(true);
    syncPlayback(poolRef, playingUriRef, uri, true, setVisibleUri);
  }

  function turnOff() {
    setEnabled(false);
    playingUriRef.current = null;
    for (const entry of poolRef.current.values()) {
      entry.controller.pause();
      entry.host.className =
        "absolute inset-0 w-full overflow-hidden opacity-0 pointer-events-none";
    }
    setVisibleUri(null);
  }

  const canEnable = apiReady && uri != null && wantedUris.length > 0;
  const activeReady = uri ? poolRef.current.get(uri)?.ready === true : false;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 left-3 z-10 flex max-w-[min(100vw-5rem,20rem)] flex-col gap-2 md:left-5",
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
              <Icon icon={volumeHighOutline} className="h-3.5 w-3.5 text-warn" />
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
          "pointer-events-auto relative h-20 w-full overflow-hidden rounded-md transition-[opacity,transform] duration-[var(--duration-move)] ease-[var(--ease-out)]",
          enabled && visibleUri
            ? "translate-y-0 opacity-100"
            : "pointer-events-none absolute h-20 w-full -translate-y-1 opacity-0",
        )}
        aria-hidden={!enabled}
      />
    </div>
  );
}

/**
 * Play the active URI if its controller is ready; otherwise keep the previous
 * track going so slide changes don't open a silent gap.
 */
function syncPlayback(
  poolRef: MutableRefObject<Map<string, PoolEntry>>,
  playingUriRef: MutableRefObject<string | null>,
  activeUri: string | null,
  enabled: boolean,
  setVisibleUri: (uri: string | null) => void,
) {
  const pool = poolRef.current;

  if (!enabled) {
    for (const entry of pool.values()) {
      entry.controller.pause();
      entry.host.className =
        "absolute inset-0 w-full overflow-hidden opacity-0 pointer-events-none";
    }
    playingUriRef.current = null;
    setVisibleUri(null);
    return;
  }

  if (!activeUri) {
    for (const entry of pool.values()) {
      entry.controller.pause();
      entry.host.className =
        "absolute inset-0 w-full overflow-hidden opacity-0 pointer-events-none";
    }
    playingUriRef.current = null;
    setVisibleUri(null);
    return;
  }

  const next = pool.get(activeUri);
  if (!next) {
    // New act URI still mounting — keep current audio; warm effect + poolTick
    // will re-enter syncPlayback once the controller exists.
    return;
  }

  if (!next.ready) {
    // Keep whatever is already playing until the target embed is warm.
    const playing = playingUriRef.current
      ? pool.get(playingUriRef.current)
      : null;
    if (playing && playing.uri !== activeUri) {
      setVisibleUri(playing.uri);
      playing.host.className =
        "absolute inset-0 w-full overflow-hidden opacity-100 pointer-events-auto";
      return;
    }
    // First start (or same URI still warming): try play anyway.
  }

  if (playingUriRef.current === activeUri) {
    setVisibleUri(activeUri);
    next.host.className =
      "absolute inset-0 w-full overflow-hidden opacity-100 pointer-events-auto";
    return;
  }

  for (const entry of pool.values()) {
    if (entry.uri === activeUri) continue;
    entry.controller.pause();
    entry.host.className =
      "absolute inset-0 w-full overflow-hidden opacity-0 pointer-events-none";
  }

  next.host.className =
    "absolute inset-0 w-full overflow-hidden opacity-100 pointer-events-auto";
  next.controller.play();
  playingUriRef.current = activeUri;
  setVisibleUri(activeUri);
}
