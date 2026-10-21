"use client";

import Link from "next/link";
import { preloadIonIcon } from "@/components/Icon";
import { GateWaitlistForm } from "@/components/scrapped/GateWaitlistForm";
import { ScrappedOrbitArt } from "@/components/scrapped/orbit/ScrappedOrbitArt";
import { SignOutConfirmButton } from "@/components/scrapped/SignOutConfirmButton";
import { SpotifyLabFetchForm } from "@/components/scrapped/SpotifyLabFetchForm";
import { SpotifyRateLimitWait } from "@/components/scrapped/SpotifyRateLimitWait";
import {
  gatePrimaryChromeClass,
  gatePrimaryTone,
  gateSecondaryChromeClass,
} from "@/components/scrapped/gateChrome";
import { buttonVariants } from "@/components/ui/button";
import { SCRAPPED_API_YEAR } from "@/lib/scrapped-api-year";
import { cn } from "@/lib/utils";

// Warm ion-icon while the user is on Sign in (and on return) so Load’s
// refresh glyph isn’t blank until a late useEffect + dynamic import.
preloadIonIcon();

type Props = {
  message?: string;
  /** OAuth failure shown on the auth gate (from `?spotify_error=`). */
  authError?: string;
  mode: "auth" | "fetch" | "error" | "ready" | "loading";
  displayName?: string | null;
  retryAfterSeconds?: number;
  quotaExceeded?: boolean;
  /** Ready mode: continue into the story deck. */
  onContinue?: () => void;
  /**
   * Fire on Continue pointerdown so Spotify play() starts before click/story mount
   * (cold embeds need that head start to feel instant).
   */
  onContinuePointerDown?: () => void;
  /** When false, Continue waits until the lead soundtrack embed is primed. */
  continueEnabled?: boolean;
  /** Soundtrack warm progress (ready gate + loading). */
  warmReady?: number;
  warmTotal?: number;
};

const gateCtaClass = cn(
  buttonVariants({ size: "lg" }),
  gatePrimaryTone,
  "mt-8 h-12 w-full rounded-2xl px-8 text-base font-semibold",
);

export function ScrappedGate({
  message,
  authError,
  mode,
  displayName,
  retryAfterSeconds,
  quotaExceeded,
  onContinue,
  onContinuePointerDown,
  continueEnabled = true,
  warmReady = 0,
  warmTotal = 0,
}: Props) {
  const connected = mode !== "auth";
  const name = displayName?.trim() || null;

  return (
    <div
      className="wrapped-story relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-10"
      data-wrapped-tone="ink"
      data-scrapped-field="intro-dusk"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <ScrappedOrbitArt
          slideIndex={0}
          pattern="intro"
          active
          introKit="gate-d6"
        />
      </div>
      {/* D-022 kit D6 — soft top scrim so About + brand stay ink-readable. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[22%] opacity-75"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, #12101a 88%, transparent) 0%, color-mix(in oklab, #12101a 45%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-dvh w-full max-w-sm flex-col items-stretch py-10 text-left">
        <div className="mb-8 flex w-full shrink-0 items-center justify-between gap-3">
          <Link href="/about" className={gateSecondaryChromeClass}>
            About
          </Link>
          {connected ? (
            <SignOutConfirmButton appearance="text" />
          ) : (
            <a
              href="/api/spotify/login"
              className={gatePrimaryChromeClass}
              aria-label="Sign in to Spotify"
            >
              Sign in
            </a>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col justify-center">
          <p className="text-display w-full text-[var(--wrapped-ink)]">
            {SCRAPPED_API_YEAR}
          </p>
          <h1 className="text-display mt-1 w-full italic text-[var(--wrapped-ink)]">
            Scrapped
          </h1>
          <p className="text-body mt-6 w-full text-[var(--wrapped-ink)]">
            Scrapped is your <span className="italic">anti-wrapped</span>. Songs
            you ghosted and artists you left on read.
          </p>
          {mode === "auth" ? (
            <p className="text-body mt-4 w-full text-[var(--wrapped-muted)]">
              There’s a waitlist right now. Join below and we’ll email you a
              link when it’s ready.
            </p>
          ) : null}

          {mode === "auth" ? (
            <div className="mt-8 w-full space-y-3">
              {authError ? (
                <p className="text-caption w-full text-[var(--wrapped-muted)]">
                  {authError}
                </p>
              ) : null}
              <GateWaitlistForm />
            </div>
          ) : mode === "ready" || mode === "loading" ? (
            <div className="mt-8 flex w-full flex-col items-stretch">
              <button
                type="button"
                onPointerDown={
                  continueEnabled && mode === "ready"
                    ? onContinuePointerDown
                    : undefined
                }
                onClick={
                  continueEnabled && mode === "ready" ? onContinue : undefined
                }
                disabled={!continueEnabled || mode === "loading"}
                aria-busy={!continueEnabled || mode === "loading"}
                className={cn(
                  gateCtaClass,
                  "mt-0",
                  (!continueEnabled || mode === "loading") &&
                    "pointer-events-none opacity-80",
                )}
              >
                {continueEnabled && mode === "ready" ? (
                  "Continue"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-[var(--wrapped-canvas)] border-t-transparent"
                      aria-hidden
                    />
                    Loading…
                  </span>
                )}
              </button>
              {continueEnabled && mode === "ready" && name ? (
                <p className="text-caption mt-3 w-full text-center text-[var(--wrapped-muted)]">
                  Signed in to Spotify as {name}
                </p>
              ) : null}
              {!continueEnabled || mode === "loading" ? (
                <p
                  className="text-caption mt-3 w-full text-center text-[var(--wrapped-muted)]"
                  aria-live="polite"
                >
                  {mode === "loading"
                    ? "Starting soundtrack…"
                    : "Warming the first track…"}
                  {warmTotal > 0 ? (
                    <span className="mt-1 block font-mono tabular-nums">
                      {warmReady} / {warmTotal}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          ) : retryAfterSeconds ? (
            <SpotifyRateLimitWait
              message={message ?? ""}
              retryAfterSeconds={retryAfterSeconds}
              quotaExceeded={quotaExceeded}
              className="text-caption mt-8 w-full text-[var(--wrapped-muted)]"
            />
          ) : (
            <div className="mt-8 w-full space-y-3">
              {message ? (
                <p className="text-caption w-full text-[var(--wrapped-muted)]">
                  {message}
                </p>
              ) : null}
              <SpotifyLabFetchForm
                next="/"
                label={mode === "fetch" ? "Load data" : "Load from Spotify"}
                tone="gate"
                autoStart={mode === "fetch"}
                className="w-full"
              />
              {name ? (
                <p className="text-caption w-full text-center text-[var(--wrapped-muted)]">
                  Signed in to Spotify as {name}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <p className="text-caption mt-10 w-full shrink-0 text-center text-[var(--wrapped-muted)]">
          Created by Alan Matias
        </p>
      </div>
    </div>
  );
}
