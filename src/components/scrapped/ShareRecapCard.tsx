"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type ShareRecapTrack = {
  id: string;
  title: string;
  artist: string;
};

type Props = {
  year: number;
  /** Left column (warn accent). */
  skipped: ShareRecapTrack[];
  /** Right column (ring accent). */
  stayed: ShareRecapTrack[];
  /** Used for the default export subtitle when `subtitle` is omitted. */
  skipCount?: number;
  title?: string;
  subtitle?: string;
  leftLabel?: string;
  rightLabel?: string;
  tagline?: string;
  brandLine?: string;
  active?: boolean;
  /**
   * `default` — Plus share card.
   * `receipt` — industrial API look.
   * `minimal` — art + two equal columns (API story finale).
   */
  variant?: "default" | "receipt" | "minimal";
  /** Hero art for `minimal` — typically #1 On sabbatical from the user’s API. */
  heroImageUrl?: string | null;
  heroAlt?: string;
  className?: string;
};

function TrackList({
  label,
  accent,
  tracks,
  receipt,
}: {
  label: string;
  accent: "warn" | "ring";
  tracks: ShareRecapTrack[];
  receipt?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <p
        className={cn(
          "font-mono text-[0.65rem] uppercase tracking-[0.14em]",
          receipt
            ? accent === "warn"
              ? "text-[var(--wrapped-accent)]"
              : "text-[var(--wrapped-ink)]"
            : accent === "warn"
              ? "text-warn"
              : "text-ring",
        )}
      >
        {label}
      </p>
      {tracks.length === 0 ? (
        <p
          className={cn(
            "text-sm",
            receipt ? "text-[var(--wrapped-muted)]" : "text-muted-foreground",
          )}
        >
          Nothing in this window.
        </p>
      ) : (
        <ol className="space-y-2">
          {tracks.map((track, i) => (
            <li key={track.id} className="flex min-w-0 items-baseline gap-2.5">
              <span
                className={cn(
                  "shrink-0 font-mono text-xs tabular-nums",
                  receipt
                    ? accent === "warn"
                      ? "text-[var(--wrapped-accent)]"
                      : "text-[var(--wrapped-muted)]"
                    : accent === "warn"
                      ? "text-warn"
                      : "text-ring",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm",
                    receipt
                      ? "font-semibold uppercase tracking-tight text-[var(--wrapped-ink)]"
                      : "text-foreground",
                  )}
                >
                  {track.title}
                </span>
                <span
                  className={cn(
                    "block truncate text-xs",
                    receipt
                      ? "text-[var(--wrapped-muted)]"
                      : "text-muted-foreground",
                  )}
                >
                  {track.artist}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function MinimalColumn({
  label,
  tracks,
}: {
  label: string;
  tracks: ShareRecapTrack[];
}) {
  return (
    <div className="min-w-0">
      <p className="mb-3 text-[0.72rem] font-bold tracking-[0.02em] text-[var(--wrapped-ink)]">
        {label}
      </p>
      {tracks.length === 0 ? (
        <p className="text-sm text-[var(--wrapped-muted)]">Nothing here.</p>
      ) : (
        <ol className="flex flex-col gap-[0.55rem]">
          {tracks.map((track, i) => (
            <li
              key={track.id}
              className="grid min-w-0 grid-cols-[1.1rem_minmax(0,1fr)] items-baseline gap-[0.35rem] text-[var(--wrapped-ink)]"
            >
              <span className="tabular-nums text-[0.92rem] font-semibold text-[var(--wrapped-muted)]">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.92rem] font-bold leading-[1.15] tracking-[-0.02em]">
                  {track.title}
                </span>
                {track.artist ? (
                  <span className="block truncate text-[0.7rem] font-medium leading-snug text-[var(--wrapped-muted)]">
                    {track.artist}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Portrait share card — screenshot like Wrapped’s closing slide. */
export function ShareRecapCard({
  year,
  skipped,
  stayed,
  skipCount,
  title = "Scrapped Plus",
  subtitle,
  leftLabel = "Top skipped",
  rightLabel = "Top Stayed",
  tagline = "Taste is a revision history.",
  brandLine = "Scrapped · Anti-Wrapped",
  active = false,
  variant = "default",
  heroImageUrl = null,
  heroAlt = "",
  className,
}: Props) {
  const receipt = variant === "receipt";
  const minimal = variant === "minimal";
  const resolvedSubtitle =
    subtitle ??
    (skipCount != null
      ? `${skipCount.toLocaleString()} skips · taste under revision`
      : "Taste under revision");

  if (minimal) {
    return (
      <div
        className={cn(
          "relative mx-auto grid h-full max-h-full w-full max-w-[20rem] grid-rows-[minmax(0,1fr)_auto] gap-4 bg-[var(--wrapped-canvas)] px-4 text-[var(--wrapped-ink)] transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)] sm:gap-5 sm:px-5",
          active ? "opacity-100" : "opacity-55",
          className,
        )}
      >
        {/* Art fills leftover height after lists — shrinks on short phones so rows 1–5 stay visible. */}
        <div className="relative mx-auto aspect-square h-full max-h-full w-auto max-w-full min-h-0 overflow-hidden bg-[var(--wrapped-panel)]">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={heroAlt}
              fill
              sizes="320px"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 sm:gap-5">
          <MinimalColumn label={leftLabel} tracks={skipped} />
          <MinimalColumn label={rightLabel} tracks={stayed} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[28rem] overflow-hidden transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)]",
        receipt
          ? "border-2 border-[var(--wrapped-accent)] bg-[var(--wrapped-panel)]"
          : "rounded-sm border border-border shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)]",
        active ? "opacity-100" : "opacity-55",
        className,
      )}
    >
      {!receipt ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 10% -10%, color-mix(in oklab, var(--warn) 22%, transparent), transparent 55%), radial-gradient(90% 70% at 100% 100%, color-mix(in oklab, var(--ring) 18%, transparent), transparent 50%), linear-gradient(165deg, var(--secondary) 0%, var(--background) 55%, color-mix(in oklab, var(--warn-soft) 55%, var(--background)) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-12deg, transparent, transparent 11px, var(--foreground) 11px, var(--foreground) 12px)",
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--wrapped-ink) 1px, transparent 1px), linear-gradient(90deg, var(--wrapped-ink) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      <div className="relative flex aspect-[9/16] max-h-[min(68dvh,36rem)] flex-col px-5 py-7 sm:px-7">
        <header className="space-y-1">
          <p
            className={cn(
              "font-mono text-xs",
              receipt
                ? "uppercase tracking-[0.16em] text-[var(--wrapped-accent)]"
                : "text-ring",
            )}
          >
            {year}
          </p>
          <h3
            className={cn(
              "leading-[0.95] tracking-[-0.03em]",
              receipt
                ? "font-sans text-[clamp(2rem,8vw,2.75rem)] font-extrabold uppercase text-[var(--wrapped-ink)]"
                : "font-heading text-[clamp(2rem,8vw,2.75rem)] text-foreground",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-sm",
              receipt
                ? "text-[var(--wrapped-muted)]"
                : "text-muted-foreground",
            )}
          >
            {resolvedSubtitle}
          </p>
        </header>

        <div
          className={cn(
            "my-5 h-1 w-16 origin-left",
            receipt ? "bg-[var(--wrapped-accent)]" : "h-px w-12 bg-warn animate-rule",
          )}
        />

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden sm:gap-6">
          <TrackList
            label={leftLabel}
            accent="warn"
            tracks={skipped}
            receipt={receipt}
          />
          <TrackList
            label={rightLabel}
            accent="ring"
            tracks={stayed}
            receipt={receipt}
          />
        </div>

        <footer
          className={cn(
            "mt-5 space-y-1 border-t pt-4",
            receipt
              ? "border-[var(--wrapped-ink)]/20"
              : "border-border",
          )}
        >
          <p
            className={cn(
              "text-lg tracking-[-0.02em]",
              receipt
                ? "font-sans font-extrabold uppercase text-[var(--wrapped-accent)]"
                : "font-heading text-warn",
            )}
          >
            {tagline}
          </p>
          <p
            className={cn(
              "font-mono text-[0.65rem] uppercase tracking-[0.12em]",
              receipt
                ? "text-[var(--wrapped-muted)]"
                : "text-muted-foreground",
            )}
          >
            {brandLine}
          </p>
        </footer>
      </div>
    </div>
  );
}
