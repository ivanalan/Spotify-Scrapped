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
} from "@/lib/api-scrapped-soundtrack";
import type { ScrappedApiReport } from "@/lib/scrapped-api";

type Props = {
  report: ScrappedApiReport;
};

type Phase = "gate" | "loading" | "story";

export function ScrappedExperience({ report }: Props) {
  const soundtrackRef = useRef<DeckSoundtrackHandle>(null);
  const [phase, setPhase] = useState<Phase>("gate");
  const [soundOn, setSoundOn] = useState(false);
  const [deckPaused, setDeckPaused] = useState(false);
  const [artistSoundtrackUri, setArtistSoundtrackUri] = useState<string | null>(
    null,
  );
  const [warm, setWarm] = useState<SoundtrackWarmState>({
    ready: 0,
    total: 0,
    allReady: false,
    leadReady: false,
    leadAudible: false,
  });

  const soundtrackOpts = useMemo(
    () => ({ artistSoundtrackUri }),
    [artistSoundtrackUri],
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

  // Warm artist-act audio on the gate (before Continue) when tops/likes lack a track.
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
        if (cancelled) return;
        if (body?.uri) setArtistSoundtrackUri(body.uri);
      })
      .catch(() => {
        /* keep song lead */
      });
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
