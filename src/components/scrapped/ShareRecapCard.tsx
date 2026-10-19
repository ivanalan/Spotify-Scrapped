"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SHARE_FINALE_KIT as SF } from "@/lib/scrapped-card-palette";
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

/** Blob ghost — same path as D-010 perimeter ghosts. */
function blobPath() {
  return "M12 48 Q20 54 32 48 Q44 54 52 48 C56 32 50 10 32 8 C14 6 8 30 12 48 Z";
}

/**
 * Two wash ghosts framing the album art (TL + BR) — D-014 kit J8.
 * Positions/sizes from SHARE_FINALE_KIT (explore lock).
 */
function ShareFinaleGhosts({ active }: { active?: boolean }) {
  const reduce = useReducedMotion();
  const freeze = Boolean(reduce || !active);
  const g = SF.ghosts;
  const slots = [
    { ...g.tl, delay: 0 },
    { ...g.br, delay: g.phaseSec },
  ] as const;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      style={{ opacity: g.opacity }}
      aria-hidden
    >
      {slots.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            width: s.sizePx,
            height: s.sizePx,
          }}
          initial={false}
          animate={
            freeze
              ? { y: 0, rotate: -2 }
              : {
                  y: [0, -g.bobPx, -g.bobPx * 0.35, 0],
                  rotate: [-2 * g.wiggle, 3 * g.wiggle, -1 * g.wiggle, -2 * g.wiggle],
                }
          }
          transition={
            freeze
              ? undefined
              : {
                  duration: g.durationSec,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -s.delay,
                }
          }
        >
          <svg viewBox="0 0 64 64" className="size-full overflow-visible">
            <path d={blobPath()} fill={SF.ghostFill} />
            <circle cx={24} cy={26} r={3.2} fill={SF.ghostEye} />
            <circle cx={40} cy={26} r={3.2} fill={SF.ghostEye} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

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

/**
 * Minimal share type — size from `--share-type-size` (D-012 density).
 * Fallback 0.93rem matches the pre-inset tune.
 */
const MINIMAL_TYPE =
  "font-sans text-[length:var(--share-type-size,0.93rem)] leading-[1.3] tracking-[-0.01em] text-[var(--wrapped-ink)]";

function MinimalColumn({
  label,
  tracks,
}: {
  label: string;
  tracks: ShareRecapTrack[];
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          MINIMAL_TYPE,
          "mb-[var(--share-list-label-gap,1.25rem)] truncate font-bold",
        )}
      >
        {label}
      </p>
      {tracks.length === 0 ? (
        <p
          className={cn(
            MINIMAL_TYPE,
            "truncate font-semibold text-[var(--wrapped-muted)]",
          )}
        >
          Nothing here.
        </p>
      ) : (
        <ol
          className="flex flex-col gap-[var(--share-list-row-gap,1.1rem)]"
        >
          {tracks.map((track, i) => (
            <li
              key={track.id}
              className="grid min-w-0 grid-cols-[0.8rem_minmax(0,1fr)] items-center gap-1"
            >
              <span className={cn(MINIMAL_TYPE, "font-semibold tabular-nums")}>
                {i + 1}
              </span>
              <span
                className={cn(MINIMAL_TYPE, "min-w-0 truncate font-semibold")}
              >
                {track.title}
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
          "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden text-[var(--wrapped-ink)] transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)]",
          active ? "opacity-100" : "opacity-55",
          className,
        )}
        style={{
          background: SF.cardBg,
          color: SF.cardInk,
          // Override nested tone tokens so lists/hero panel match teal kit.
          ["--wrapped-ink" as string]: SF.cardInk,
          ["--wrapped-panel" as string]: SF.cardPanel,
        }}
      >
        {/*
          Inset share finale (D-012 IA + D-014 kit J8): teal card, framing
          ghosts, MyScrapped.com. Density from --share-* on the deck host.
        */}
        <ShareFinaleGhosts active={active} />
        <header
          className="relative z-[1] flex w-full shrink-0 items-center justify-center [container-type:size]"
          style={{ height: "var(--share-hero-band, 44%)" }}
        >
          <div
            className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[var(--wrapped-panel)]"
            style={{
              width:
                "min(var(--share-hero-size, 63%), var(--share-hero-size, 63%))",
            }}
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroAlt}
                fill
                sizes="40vh"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </header>

        <div
          className="relative z-[1] grid min-h-0 w-full flex-1 grid-cols-2 content-start pt-0"
          style={{
            columnGap: "var(--share-list-col-gap, 0.375rem)",
            paddingInline: "var(--share-list-pad-x, 0px)",
            paddingBottom: "0px",
          }}
        >
          <MinimalColumn label={leftLabel} tracks={skipped} />
          <MinimalColumn label={rightLabel} tracks={stayed} />
        </div>

        <footer
          className="relative z-[1] shrink-0 text-center font-semibold tracking-[-0.01em]"
          style={{
            paddingInline: "var(--share-list-pad-x, 0px)",
            paddingBottom: "var(--share-list-pad-y, 0px)",
            paddingTop: "10px",
            fontSize: "0.68rem",
            color: SF.cardMuted,
          }}
        >
          {SF.brandLine}
        </footer>
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
