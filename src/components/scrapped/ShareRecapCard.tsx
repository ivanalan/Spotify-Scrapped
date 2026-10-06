"use client";

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
  className?: string;
};

function TrackList({
  label,
  accent,
  tracks,
}: {
  label: string;
  accent: "warn" | "ring";
  tracks: ShareRecapTrack[];
}) {
  return (
    <div className="space-y-2.5">
      <p
        className={cn(
          "font-mono text-[0.65rem] uppercase tracking-[0.14em]",
          accent === "warn" ? "text-warn" : "text-ring",
        )}
      >
        {label}
      </p>
      {tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing in this window.</p>
      ) : (
        <ol className="space-y-2">
          {tracks.map((track, i) => (
            <li key={track.id} className="flex items-baseline gap-2.5 min-w-0">
              <span
                className={cn(
                  "shrink-0 font-mono text-xs tabular-nums",
                  accent === "warn" ? "text-warn" : "text-ring",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">
                  {track.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
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

/** Portrait share card — screenshot like Wrapped’s closing slide. */
export function ShareRecapCard({
  year,
  skipped,
  stayed,
  skipCount,
  title = "Spotify Scrapped",
  subtitle,
  leftLabel = "Top skipped",
  rightLabel = "Top Stayed",
  tagline = "Taste is a revision history.",
  brandLine = "Scrapped · Anti-Wrapped",
  active = false,
  className,
}: Props) {
  const resolvedSubtitle =
    subtitle ??
    (skipCount != null
      ? `${skipCount.toLocaleString()} skips · taste under revision`
      : "Taste under revision");

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[28rem] overflow-hidden rounded-sm border border-border shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)]",
        active ? "opacity-100" : "opacity-55",
        className,
      )}
    >
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

      <div className="relative flex aspect-[9/16] max-h-[min(68dvh,36rem)] flex-col px-5 py-7 sm:px-7">
        <header className="space-y-1">
          <p className="font-mono text-xs text-ring">{year}</p>
          <h3 className="font-heading text-[clamp(2rem,8vw,2.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{resolvedSubtitle}</p>
        </header>

        <div className="my-5 h-px w-12 origin-left bg-warn animate-rule" />

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden sm:gap-6">
          <TrackList label={leftLabel} accent="warn" tracks={skipped} />
          <TrackList label={rightLabel} accent="ring" tracks={stayed} />
        </div>

        <footer className="mt-5 space-y-1 border-t border-border pt-4">
          <p className="font-heading text-lg tracking-[-0.02em] text-warn">
            {tagline}
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            {brandLine}
          </p>
        </footer>
      </div>
    </div>
  );
}
