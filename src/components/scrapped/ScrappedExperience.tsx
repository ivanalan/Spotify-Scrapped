"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiScrappedPauseApi } from "@/components/scrapped/ApiScrappedDeck";
import type {
  DeckSoundtrackHandle,
  SoundtrackWarmState,
} from "@/components/scrapped/DeckSoundtrack";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";
import { SoundtrackDebugPanel } from "@/components/scrapped/SoundtrackDebugPanel";
import {
  API_SCRAPPED_SLIDE_COUNT,
  getApiSlideSoundtrackUri,
  needsArtistSoundtrackResolve,
  needsSecondArtistSoundtrackResolve,
} from "@/lib/api-scrapped-soundtrack";
import type { ScrappedApiReport } from "@/lib/scrapped-api";
import { collectSoundtrackUris } from "@/lib/soundtrack-uris";

const ApiScrappedDeck = dynamic(
  () =>
    import("@/components/scrapped/ApiScrappedDeck").then(
      (m) => m.ApiScrappedDeck,
    ),
  { ssr: false, loading: () => null },
);

const DeckSoundtrack = dynamic(
  () =>
    import("@/components/scrapped/DeckSoundtrack").then(
      (m) => m.DeckSoundtrack,
    ),
  { ssr: false, loading: () => null },
);

type Props = {
  report: ScrappedApiReport;
  /**
   * `walkthrough`: frozen fixture, no artist-top-track API, origin back chrome (D-024, D-040).
   */
  chromeMode?: "session" | "walkthrough";
};

type Phase = "gate" | "loading" | "story";

async function fetchArtistTrackUri(need: {
  artistId: string;
  artistName: string;
  avoidTrackId: string | null;
}): Promise<string | null> {
  const params = new URLSearchParams({
    id: need.artistId,
    name: need.artistName,
  });
  if (need.avoidTrackId) params.set("avoid", need.avoidTrackId);
  try {
    const res = await fetch(`/api/spotify/artist-top-track?${params}`);
    if (!res.ok) return null;
    const body = (await res.json()) as { uri?: string };
    return body?.uri ?? null;
  } catch {
    return null;
  }
}

export function ScrappedExperience({
  report,
  chromeMode = "session",
}: Props) {
  const isWalkthrough = chromeMode === "walkthrough";
  const soundtrackRef = useRef<DeckSoundtrackHandle>(null);
  /** Walkthrough: first story tap has already re-issued play in a gesture. */
  const walkthroughUnlockedRef = useRef(false);
  const pauseApiRef = useRef<ApiScrappedPauseApi | null>(null);
  // Walkthrough skips the ready gate: land straight on slide 0 (D-024).
  const [phase, setPhase] = useState<Phase>(isWalkthrough ? "story" : "gate");
  // Walkthrough has no Continue gesture: start with sound on and unlock the
  // embeds on the first non-button tap (see handleWalkthroughPointerDown).
  const [soundOn, setSoundOn] = useState(isWalkthrough);

  const [deckPaused, setDeckPaused] = useState(false);
  const [artistSoundtrackUri, setArtistSoundtrackUri] = useState<string | null>(
    null,
  );
  const [artistSoundtrackUri2, setArtistSoundtrackUri2] = useState<
    string | null
  >(null);
  const resolveArtistTracks = chromeMode === "session";
  const [warm, setWarm] = useState<SoundtrackWarmState>({
    ready: 0,
    total: 0,
    allReady: false,
    leadReady: false,
    leadAudible: false,
  });
  const [soundtrackModReady, setSoundtrackModReady] = useState(false);
  const [deckModReady, setDeckModReady] = useState(false);
  const modulesReady = soundtrackModReady && deckModReady;

  // Prefetch heavy chunks so the gate stays interactive while they load.
  // Soundtrack can mount (and warm) as soon as its chunk arrives.
  useEffect(() => {
    let cancelled = false;
    void import("@/components/scrapped/DeckSoundtrack").then(() => {
      if (!cancelled) setSoundtrackModReady(true);
    });
    void import("@/components/scrapped/ApiScrappedDeck").then(() => {
      if (!cancelled) setDeckModReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const soundtrackOpts = useMemo(
    () => ({ artistSoundtrackUri, artistSoundtrackUri2 }),
    [artistSoundtrackUri, artistSoundtrackUri2],
  );

  const [soundtrackUri, setSoundtrackUri] = useState<string | null>(() =>
    getApiSlideSoundtrackUri(report, 0),
  );

  const soundtrackPreload = useMemo(
    () =>
      collectSoundtrackUris(
        (i) => getApiSlideSoundtrackUri(report, i, soundtrackOpts),
        API_SCRAPPED_SLIDE_COUNT,
      ),
    [report, soundtrackOpts],
  );

  // Warm artist-act audio on the gate when tops/likes lack distinct samples.
  // Walkthrough skips this: fixture must already carry trackIds (D-024).
  useEffect(() => {
    if (!resolveArtistTracks) {
      setArtistSoundtrackUri(null);
      setArtistSoundtrackUri2(null);
      return;
    }

    let cancelled = false;
    const need1 = needsArtistSoundtrackResolve(report);
    const need2 = needsSecondArtistSoundtrackResolve(report);

    if (!need1) setArtistSoundtrackUri(null);
    if (!need2) setArtistSoundtrackUri2(null);

    void (async () => {
      let resolved1: string | null = null;
      if (need1) {
        resolved1 = await fetchArtistTrackUri(need1);
        if (!cancelled && resolved1) setArtistSoundtrackUri(resolved1);
      }
      if (need2) {
        const uri = await fetchArtistTrackUri({
          ...need2,
          avoidTrackId:
            need2.avoidTrackId ??
            resolved1?.replace(/^spotify:track:/, "") ??
            null,
        });
        if (!cancelled && uri) setArtistSoundtrackUri2(uri);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [report, resolveArtistTracks]);

  // Fallback if Continue raced ahead of a cold embed.
  useEffect(() => {
    if (phase !== "loading") return;
    if (warm.leadAudible) {
      setPhase("story");
      return;
    }
    const fallback = window.setTimeout(() => setPhase("story"), 3500);
    return () => window.clearTimeout(fallback);
  }, [phase, warm.leadAudible]);

  function enableSoundFromGesture() {
    soundtrackRef.current?.playFromUserGesture();
    setSoundOn(true);
  }

  /**
   * Spotify has no mute: arm = play until audible, pause at t=3.
   * Continue click resume()s that buffer (“unmute”).
   */
  function handleContinuePointerDown() {
    soundtrackRef.current?.armLeadFromGesture();
  }

  function handleContinue() {
    enableSoundFromGesture();
    // Enter story immediately; slide 0 copy waits ~500ms so audio can catch up.
    setPhase("story");
  }

  /**
   * Walkthrough: browsers (iOS especially) block embed play() without a
   * gesture. Sound starts "on", so the first story tap unlocks it. Button taps
   * are skipped so Mute / Pause keep their meaning.
   */
  function handleWalkthroughPointerDown(e: React.PointerEvent) {
    if (!isWalkthrough || !soundOn || deckPaused) return;
    if (walkthroughUnlockedRef.current) return;
    if ((e.target as HTMLElement).closest("button")) return;
    walkthroughUnlockedRef.current = true;
    // "Audible" only means the embed reported playback_started; that can fire
    // while the browser still blocks sound (play() ran outside a gesture). So
    // the first tap always re-issues play inside the gesture.
    if (soundtrackRef.current?.isLeadAudible()) {
      soundtrackRef.current.nudgeFromGesture();
    } else {
      enableSoundFromGesture();
    }
  }

  function primeSoundtrackTo(uri: string | null) {
    soundtrackRef.current?.primeTo(uri);
  }

  function cancelSoundtrackPrime() {
    soundtrackRef.current?.cancelPrime();
  }

  function cutSoundtrackTo(uri: string | null) {
    return soundtrackRef.current?.cutTo(uri) ?? Promise.resolve();
  }

  const started = phase === "story";
  const leadWarm =
    warm.leadReady || soundtrackPreload.length === 0;
  const continueEnabled = modulesReady && leadWarm;
  // Mount the deck while Cueing/Continue so play() isn't fighting a remount.
  const deckMounted =
    isWalkthrough || continueEnabled || phase !== "gate";

  return (
    <div
      className="relative w-full"
      onPointerDownCapture={handleWalkthroughPointerDown}
    >
      {!isWalkthrough && phase !== "story" ? (
        <ScrappedGate
          mode={phase === "loading" ? "loading" : "ready"}
          displayName={report.profileName}
          onContinue={phase === "gate" ? handleContinue : undefined}
          onContinuePointerDown={
            phase === "gate" ? handleContinuePointerDown : undefined
          }
          continueEnabled={continueEnabled}
          modulesReady={modulesReady}
          warmReady={warm.ready}
          warmTotal={Math.max(warm.total, phase === "loading" ? warm.total : 1)}
        />
      ) : null}

      {deckMounted ? (
        <div
          className={started ? undefined : "hidden"}
          aria-hidden={!started}
        >
          <ApiScrappedDeck
            report={report}
            soundOn={soundOn}
            artistSoundtrackUri={artistSoundtrackUri}
            artistSoundtrackUri2={artistSoundtrackUri2}
            onEnableSound={enableSoundFromGesture}
            onDisableSound={() => setSoundOn(false)}
            onPausedChange={setDeckPaused}
            onSoundtrackUriChange={setSoundtrackUri}
            onSoundtrackPrimeTo={primeSoundtrackTo}
            onSoundtrackCancelPrime={cancelSoundtrackPrime}
            onSoundtrackCutTo={cutSoundtrackTo}
            held={!started}
            pauseApiRef={pauseApiRef}
            chromeMode={chromeMode}
          />
        </div>
      ) : null}

      {/* Mounted on the gate so Continue can unlock a warm embed in-gesture. */}
      {soundtrackModReady ? (
        <DeckSoundtrack
          ref={soundtrackRef}
          uri={soundtrackUri}
          preloadUris={soundtrackPreload}
          enabled={soundOn && (!started || !deckPaused)}
          onEnabledChange={setSoundOn}
          showToggle={false}
          showPlayer={false}
          onWarmChange={setWarm}
          onExternalPause={() => pauseApiRef.current?.pauseStory()}
          onExternalResume={() => pauseApiRef.current?.resumeStory()}
        />
      ) : null}

      {/* `?debug=soundtrack` only: on-device log + case checklist (no audio control changes). */}
      <SoundtrackDebugPanel />
    </div>
  );
}
