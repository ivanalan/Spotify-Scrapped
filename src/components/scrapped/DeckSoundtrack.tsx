"use client";

import { useEffect, useRef, useState } from "react";
import { volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import type { ScrappedReport } from "@/lib/scrapped";
import { cn } from "@/lib/utils";

type EmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  destroy: () => void;
  addListener: (event: string, cb: () => void) => void;
};

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
  const likedScrapped = asTrackUri(
    report.likedButScrapped[0]?.spotify_track_uri,
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
      return likedScrapped ?? topSkipped;
    case 7:
      return secondChance ?? finished ?? topSkipped;
    case 8:
    case 9:
      // Stayed-for slide + share recap share one track so audio keeps playing.
      return finished ?? secondChance ?? topSkipped;
    default:
      return null;
  }
}

type Props = {
  uri: string | null;
  className?: string;
};

export function DeckSoundtrack({ uri, className }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EmbedController | null>(null);
  const apiRef = useRef<IFrameAPI | null>(null);
  const creatingRef = useRef(false);
  const enabledRef = useRef(false);
  const [apiReady, setApiReady] = useState(false);
  const [controllerReady, setControllerReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  enabledRef.current = enabled;

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
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || controllerRef.current || creatingRef.current || !uri) {
      return;
    }
    const api = apiRef.current;
    const shell = shellRef.current;
    if (!api || !shell) return;

    // createController replaces the host node — use a fresh child each time.
    shell.replaceChildren();
    const host = document.createElement("div");
    shell.appendChild(host);
    creatingRef.current = true;

    let cancelled = false;
    api.createController(
      host,
      { uri, width: "100%", height: 80 },
      (controller) => {
        creatingRef.current = false;
        if (cancelled) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        setControllerReady(true);
        if (enabledRef.current) controller.play();
      },
    );

    return () => {
      cancelled = true;
      if (!controllerRef.current) creatingRef.current = false;
    };
  }, [apiReady, uri]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !controllerReady || !enabled) return;
    if (!uri) {
      controller.pause();
      return;
    }
    controller.loadUri(uri);
    controller.play();
  }, [uri, enabled, controllerReady]);

  function turnOn() {
    setEnabled(true);
    const controller = controllerRef.current;
    if (!controller || !uri) return;
    controller.loadUri(uri);
    controller.play();
  }

  function turnOff() {
    setEnabled(false);
    controllerRef.current?.pause();
  }

  const canEnable = controllerReady && uri != null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 left-3 z-10 flex max-w-[min(100vw-5rem,20rem)] flex-col gap-2 md:left-5",
        className,
      )}
    >
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
          </button>
        )}
      </div>

      <div
        ref={shellRef}
        className={cn(
          "pointer-events-auto w-full overflow-hidden rounded-md transition-[opacity,transform] duration-[var(--duration-move)] ease-[var(--ease-out)]",
          enabled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none absolute h-20 w-full -translate-y-1 opacity-0",
        )}
        aria-hidden={!enabled}
      />
    </div>
  );
}
