"use client";

import { useId } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SHARE_FINALE_KIT as SF } from "@/lib/scrapped-card-palette";
import {
  type ShareFinaleGhostTune,
  type ShareFinaleMoonTune,
} from "@/components/scrapped/ShareFinaleLayoutTune";
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
  /** Liked Songs library total (minimal share metrics). */
  likedCount?: number;
  /** Liked Songs added this year (minimal share metrics). */
  likedThisYearCount?: number;
  /** Live moon overrides from the on-story tune panel. */
  moonTune?: ShareFinaleMoonTune;
  /** Live ghost overrides (hero band). */
  ghostTune?: ShareFinaleGhostTune[];
  /** Brand type size / tracking overrides. */
  brandTune?: { sizeRem: number; letterSpacingEm: number };
  title?: string;
  subtitle?: string;
  leftLabel?: string;
  rightLabel?: string;
  tagline?: string;
  brandLine?: string;
  active?: boolean;
  /**
   * `default`: Plus share card.
   * `receipt`: industrial API look.
   * `minimal`: art + two equal columns (API story finale).
   */
  variant?: "default" | "receipt" | "minimal";
  /** Hero art for `minimal`: typically #1 On sabbatical from the user’s API. */
  heroImageUrl?: string | null;
  heroAlt?: string;
  className?: string;
};

/** Blob ghost: same path as perimeter ghosts (D-028 hem · D-029 face). */
function blobPath() {
  return "M12 48 Q17 54 22 48 Q27 54 32 48 Q37 54 42 48 Q47 54 52 48 C56 32 50 10 32 8 C14 6 8 30 12 48 Z";
}

function GhostSvg() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <path
        d={blobPath()}
        fill={SF.ghostFill}
        stroke="#1c1c1c"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <ellipse cx={17} cy={34} rx={4} ry={2.2} fill="#e8a0b8" opacity={0.7} />
      <ellipse cx={47} cy={34} rx={4} ry={2.2} fill="#e8a0b8" opacity={0.7} />
      <circle cx={24} cy={26} r={3.2} fill={SF.ghostEye} />
      <circle cx={40} cy={26} r={3.2} fill={SF.ghostEye} />
    </svg>
  );
}

/**
 * TR moon in the hero band (D-033). Soft breathe after enter.
 */
function ShareFinaleMoon({
  active,
  moon,
}: {
  active?: boolean;
  moon?: ShareFinaleMoonTune;
}) {
  const reduce = useReducedMotion();
  const freeze = Boolean(reduce || !active);
  const moonGrad = useId();
  const sizePx = moon?.sizePx ?? SF.moon.sizePx;
  const insetXPx = moon?.insetXPx ?? SF.moon.insetXPx;
  const insetYPx = moon?.insetYPx ?? SF.moon.insetYPx;
  const opacity = moon?.opacity ?? SF.moon.opacity;

  return (
    <div
      className="pointer-events-none absolute z-[1] overflow-visible"
      style={{
        right: insetXPx,
        top: insetYPx,
        width: sizePx,
        height: sizePx,
      }}
      aria-hidden
    >
      <motion.div
        className="size-full"
        style={{ transformOrigin: "50% 50%" }}
        animate={freeze ? { scale: 1 } : { scale: [1, 1.055, 1] }}
        transition={
          freeze
            ? undefined
            : {
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }
        }
      >
        <svg viewBox="0 0 100 100" className="size-full">
          <defs>
            <radialGradient id={moonGrad} cx="32%" cy="28%" r="72%">
              {SF.moon.stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </radialGradient>
          </defs>
          <motion.circle
            cx={50}
            cy={50}
            r={50}
            fill={`url(#${moonGrad})`}
            opacity={opacity}
            initial={freeze ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity }}
            transition={
              freeze
                ? undefined
                : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
            }
            style={{ transformOrigin: "50px 50px" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * Hero-band ghosts (D-033). `z` places each under or over the cover.
 */
function ShareFinaleGhosts({
  active,
  z,
  ghosts,
}: {
  active?: boolean;
  z: "above" | "below";
  ghosts?: ShareFinaleGhostTune[];
}) {
  const reduce = useReducedMotion();
  const freeze = Boolean(reduce || !active);
  const motionSpec = SF.ghostMotion;
  const source = ghosts ?? SF.ghosts;
  const slots = source.filter((g) => g.z === z);

  if (slots.length === 0) return null;

  return (
    <>
      {slots.map((s, i) => (
        <motion.div
          key={`${z}-${i}`}
          className="pointer-events-none absolute"
          style={{
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            width: s.sizePx,
            height: s.sizePx,
            opacity: s.opacity,
            transformOrigin: "50% 50%",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.28))",
          }}
          initial={false}
          animate={
            freeze
              ? { y: 0, rotate: s.rotDeg }
              : {
                  y: [
                    0,
                    -motionSpec.bobPx,
                    -motionSpec.bobPx * 0.35,
                    0,
                  ],
                  rotate: [
                    s.rotDeg - 2 * motionSpec.wiggle,
                    s.rotDeg + 3 * motionSpec.wiggle,
                    s.rotDeg - 1 * motionSpec.wiggle,
                    s.rotDeg - 2 * motionSpec.wiggle,
                  ],
                }
          }
          transition={
            freeze
              ? undefined
              : {
                  duration: motionSpec.durationSec,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -i * motionSpec.phaseSec,
                }
          }
          aria-hidden
        >
          <GhostSvg />
        </motion.div>
      ))}
    </>
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
 * Minimal share type: size from `--share-type-size` (D-012 / D-033 density).
 */
const MINIMAL_TYPE =
  "font-sans text-[length:var(--share-type-size,0.65rem)] leading-[1.25] tracking-[-0.01em] text-[var(--wrapped-ink)]";

/** Metric / list labels: muted medium type (`--share-metric-label`). */
const MINIMAL_LABEL =
  "font-sans font-medium text-[var(--wrapped-muted)]";

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
          MINIMAL_LABEL,
          "mb-[var(--share-list-label-gap,0.55rem)] truncate",
        )}
        style={{
          fontSize: "var(--share-metric-label, 0.72rem)",
          lineHeight: 1.2,
        }}
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
        <ol className="flex flex-col gap-[var(--share-list-row-gap,0.51rem)]">
          {tracks.map((track, i) => (
            <li
              key={track.id}
              className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-[0.28rem]"
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

/** Portrait share card: screenshot like Wrapped’s closing slide. */
export function ShareRecapCard({
  year,
  skipped,
  stayed,
  skipCount,
  likedCount,
  likedThisYearCount,
  moonTune,
  ghostTune,
  brandTune,
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
    const brandSizeRem = brandTune?.sizeRem ?? SF.brand.sizeRem;
    const brandLetterSpacingEm =
      brandTune?.letterSpacingEm ?? SF.brand.letterSpacingEm;

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
          ["--wrapped-ink" as string]: SF.cardInk,
          ["--wrapped-panel" as string]: SF.cardPanel,
          ["--wrapped-muted" as string]: SF.cardMuted,
        }}
      >
        {/*
          Inset share finale (D-012 IA + D-033 B2): plain teal · TR moon ·
          hero ghosts (mixed z) · flow liked metrics under lists · brand center.
        */}
        <header
          className="relative z-[2] flex w-full shrink-0 items-center justify-center overflow-hidden"
          style={{ height: "var(--share-hero-band, 49%)" }}
        >
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <ShareFinaleMoon active={active} moon={moonTune} />
            <ShareFinaleGhosts active={active} z="below" ghosts={ghostTune} />
          </div>
          <div
            className="relative z-[2] aspect-square max-h-[88%] overflow-hidden bg-[var(--wrapped-panel)]"
            style={{
              width: "min(var(--share-hero-size, 55%), 92%)",
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
          <div className="pointer-events-none absolute inset-0 z-[3]">
            <ShareFinaleGhosts active={active} z="above" ghosts={ghostTune} />
          </div>
        </header>

        <div
          className="relative z-[2] flex min-h-0 w-full flex-1 flex-col"
          style={{
            paddingInline: "var(--share-list-pad-x, 16px)",
            paddingTop: "var(--share-list-pad-y, 0px)",
            paddingBottom: "var(--share-brand-pad-bottom, 16px)",
          }}
        >
          <div
            className="grid w-full shrink-0 grid-cols-2 content-start"
            style={{
              columnGap: "var(--share-list-col-gap, 14px)",
            }}
          >
            <MinimalColumn label={leftLabel} tracks={skipped} />
            <MinimalColumn label={rightLabel} tracks={stayed} />
          </div>

          <div
            className="grid w-full shrink-0 grid-cols-2"
            style={{
              columnGap: "var(--share-list-col-gap, 14px)",
              marginTop: "var(--share-metrics-gap, 29px)",
            }}
          >
            <div className="min-w-0">
              <p
                className={MINIMAL_LABEL}
                style={{
                  fontSize: "var(--share-metric-label, 0.72rem)",
                  lineHeight: 1.2,
                }}
              >
                Liked songs
              </p>
              <p
                className="mt-0.5 font-sans font-extrabold tabular-nums tracking-[-0.03em] text-[var(--wrapped-ink)]"
                style={{
                  fontSize: "var(--share-metric-number, 1.3rem)",
                  lineHeight: 1.05,
                }}
              >
                {(likedCount ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="min-w-0">
              <p
                className={MINIMAL_LABEL}
                style={{
                  fontSize: "var(--share-metric-label, 0.72rem)",
                  lineHeight: 1.2,
                }}
              >
                Liked this year
              </p>
              <p
                className="mt-0.5 font-sans font-extrabold tabular-nums tracking-[-0.03em] text-[var(--wrapped-ink)]"
                style={{
                  fontSize: "var(--share-metric-number, 1.3rem)",
                  lineHeight: 1.05,
                }}
              >
                {(likedThisYearCount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className="w-full shrink-0 text-center font-sans font-bold text-[var(--wrapped-ink)]"
            style={{
              marginTop: "var(--share-brand-gap, 39px)",
              fontSize: `${brandSizeRem}rem`,
              letterSpacing: `${brandLetterSpacingEm}em`,
              lineHeight: 1.15,
              whiteSpace: "nowrap",
            }}
          >
            {SF.brandLine}
          </div>
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
