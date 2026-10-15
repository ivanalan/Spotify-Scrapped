"use client";

import { SignOutConfirmButton } from "@/components/scrapped/SignOutConfirmButton";
import { SpotifyLabFetchForm } from "@/components/scrapped/SpotifyLabFetchForm";
import { SpotifyRateLimitWait } from "@/components/scrapped/SpotifyRateLimitWait";
import { buttonVariants } from "@/components/ui/button";
import { SCRAPPED_API_YEAR } from "@/lib/scrapped-api-year";
import { cn } from "@/lib/utils";

type Props = {
  message?: string;
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
  "mt-10 h-12 w-full max-w-sm cursor-pointer rounded-2xl bg-[var(--wrapped-ink)] px-8 text-base font-semibold text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90",
);

export function ScrappedGate({
  message,
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
  // 1.0: "Your YEAR" · 1.1: "Name’s YEAR"
  const yearLabel = connected
    ? name
      ? `${name}’s ${SCRAPPED_API_YEAR}`
      : String(SCRAPPED_API_YEAR)
    : `Your ${SCRAPPED_API_YEAR}`;

  return (
    <div
      className="wrapped-story relative left-1/2 flex min-h-[100dvh] w-screen -translate-x-1/2 flex-col"
      data-wrapped-tone="paper"
    >
      {connected ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end px-5 pt-5 md:px-8">
          <div className="pointer-events-auto">
            <SignOutConfirmButton appearance="text" />
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <p className="font-sans text-[clamp(2.75rem,11vw,4.5rem)] font-bold leading-none tracking-tight text-[var(--wrapped-ink)]">
          {yearLabel}
        </p>
        <h1 className="mt-2 font-sans text-[clamp(2.5rem,10vw,3.75rem)] font-bold italic leading-none tracking-tight text-[var(--wrapped-ink)]">
          Scrapped
        </h1>
        <p className="mt-8 max-w-[18rem] font-sans text-base leading-relaxed text-[var(--wrapped-ink)] sm:max-w-xs">
          Scrapped is your <span className="italic">anti-wrapped</span>. Songs
          you hated and artists you skipped.
        </p>

        {mode === "auth" ? (
          <a href="/api/spotify/login" className={gateCtaClass}>
            Log in with Spotify
          </a>
        ) : mode === "ready" ? (
          <button
            type="button"
            onPointerDown={onContinuePointerDown}
            onClick={onContinue}
            disabled={!continueEnabled}
            className={cn(
              gateCtaClass,
              !continueEnabled && "pointer-events-none opacity-50",
            )}
          >
            {continueEnabled ? "Start" : "Cueing…"}
          </button>
        ) : mode === "loading" ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="font-sans text-base font-semibold text-[var(--wrapped-ink)]">
              Starting soundtrack
            </p>
            <p className="max-w-[16rem] font-sans text-xs leading-relaxed text-[var(--wrapped-muted)]">
              Waiting until the first track is actually playing…
              {warmTotal > 0 ? (
                <span className="mt-1 block font-mono tabular-nums">
                  {warmReady} / {warmTotal} warmed
                </span>
              ) : null}
            </p>
            <div
              className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-[var(--wrapped-ink)]/10"
              aria-hidden
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--wrapped-ink)]" />
            </div>
          </div>
        ) : retryAfterSeconds ? (
          <SpotifyRateLimitWait
            message={message ?? ""}
            retryAfterSeconds={retryAfterSeconds}
            quotaExceeded={quotaExceeded}
            className="mt-10 max-w-sm text-sm text-[var(--wrapped-muted)]"
          />
        ) : (
          <div className="mt-10 space-y-3">
            {message ? (
              <p className="max-w-sm text-sm text-[var(--wrapped-muted)]">
                {message}
              </p>
            ) : null}
            <SpotifyLabFetchForm
              next="/"
              label={mode === "fetch" ? "Start" : "Load from Spotify"}
              tone="gate"
            />
          </div>
        )}
      </div>

      <p className="pb-10 text-center font-sans text-sm text-[var(--wrapped-muted)]">
        Created by Alan Matias
      </p>
    </div>
  );
}
