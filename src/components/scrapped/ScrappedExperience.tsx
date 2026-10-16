"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApiScrappedDeck } from "@/components/scrapped/ApiScrappedDeck";
import {
  collectSoundtrackUris,
  DeckSoundtrack,
  type DeckSoundtrackHandle,
  type SoundtrackWarmState,
} from "@/components/scrapped/DeckSoundtrack";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";
import {
  API_SCRAPPED_SLIDE_COUNT,
  getApiSlideSoundtrackUri,
  needsArtistSoundtrackResolve,
  needsSecondArtistSoundtrackResolve,
} from "@/lib/api-scrapped-soundtrack";
import type { ScrappedApiReport } from "@/lib/scrapped-api";

type Props = {
  report: ScrappedApiReport;
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

export function ScrappedExperience({ report }: Props) {
  const soundtrackRef = useRef<DeckSoundtrackHandle>(null);
  const [phase, setPhase] = useState<Phase>("gate");
  const [soundOn, setSoundOn] = useState(false);

  // Allow a future needs_fetch visit to auto-Load again (same tab).
  useEffect(() => {
    try {
      sessionStorage.removeItem("scrapped-lab-autostart");
    } catch {
      /* ignore */
    }
  }, []);
  const [deckPaused, setDeckPaused] = useState(false);
  const [artistSoundtrackUri, setArtistSoundtrackUri] = useState<string | null>(
    null,
  );
  const [artistSoundtrackUri2, setArtistSoundtrackUri2] = useState<
    string | null
  >(null);
  const [warm, setWarm] = useState<SoundtrackWarmState>({
    ready: 0,
    total: 0,
    allReady: false,
    leadReady: false,
    leadAudible: false,
  });

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
  useEffect(() => {
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
  }, [report]);

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
   * Spotify has no mute — arm = play until audible, pause at t=3.
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

  function primeSoundtrackTo(uri: string | null) {
    soundtrackRef.current?.primeTo(uri);
  }

  function cutSoundtrackTo(uri: string | null) {
    return soundtrackRef.current?.cutTo(uri) ?? Promise.resolve();
  }

  const started = phase === "story";
  const continueEnabled = warm.leadReady || soundtrackPreload.length === 0;
  // Mount the deck while Cueing/Continue so play() isn't fighting a remount.
  const deckMounted = continueEnabled || phase !== "gate";

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      {phase !== "story" ? (
        <ScrappedGate
          mode={phase === "loading" ? "loading" : "ready"}
          displayName={report.profileName}
          onContinue={phase === "gate" ? handleContinue : undefined}
          onContinuePointerDown={
            phase === "gate" ? handleContinuePointerDown : undefined
          }
          continueEnabled={continueEnabled}
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
            onSoundtrackCutTo={cutSoundtrackTo}
            held={!started}
          />
        </div>
      ) : null}

      {/* Mounted on the gate so Continue can unlock a warm embed in-gesture. */}
      <DeckSoundtrack
        ref={soundtrackRef}
        uri={soundtrackUri}
        preloadUris={soundtrackPreload}
        enabled={soundOn && (!started || !deckPaused)}
        onEnabledChange={setSoundOn}
        showToggle={false}
        showPlayer={started}
        onWarmChange={setWarm}
      />
    </div>
  );
}
