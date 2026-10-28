"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { SHARE_ONE_LIKE_ARTISTS_KIT as K } from "@/lib/scrapped-card-palette";
import { cn } from "@/lib/utils";
import "@/components/scrapped/share-one-like-artists.css";

export type ShareOneLikeArtistRow = {
  id: string;
  /** Artist name (list label is `"1 like" artists`). */
  title: string;
};

type Props = {
  artists: ShareOneLikeArtistRow[];
  likedCount?: number;
  likedThisYearCount?: number;
  heroImageUrl?: string | null;
  heroAlt?: string;
  active?: boolean;
  className?: string;
};

/** Ionicons heart path (512 viewBox); same as scene 4 / explore. */
const HEART_PATH =
  "M256 448l-35.5-32.3C132 334 48 258.6 48 168.4 48 105.1 97.5 56 160.4 56c36.3 0 70.8 17.2 95.6 46.1C280.8 73.2 315.3 56 351.6 56 414.5 56 464 105.1 464 168.4c0 90.2-84 165.6-172.5 247.3L256 448z";

/**
 * Share finale card 2: `"1 like" artists` · ocean nest + rising hearts (D-048).
 * Layout outline matches card 0 / G3. Liked metrics hidden; brand under list.
 */
export function ShareOneLikeArtistsCard({
  artists,
  likedCount = 0,
  likedThisYearCount = 0,
  heroImageUrl = null,
  heroAlt = "",
  active = false,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const listLabelType = {
    fontSize: `${K.listLabelRem}rem`,
    lineHeight: 1.2,
  } as const;
  const metricLabelType = {
    fontSize: `${K.metricLabelRem}rem`,
    lineHeight: 1.2,
  } as const;
  const showMetrics = K.showMetrics;

  return (
    <div
      className={cn(
        "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)]",
        active ? "opacity-100" : "opacity-55",
        className,
      )}
      style={{
        background: K.cardBg,
        color: K.cardInk,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[8] overflow-hidden"
        aria-hidden
      >
        {Array.from({ length: K.floaters.count }, (_, i) => {
          const size = K.floaters.sizesPx[i]!;
          const soft = i === 2;
          return (
            <div
              key={i}
              className="share-one-like-floater"
              data-soft={soft ? "1" : "0"}
              style={{
                left: `${K.floaters.leftPct[i]}%`,
                color: K.floaters.colors[i],
                ["--share-one-dx" as string]: `${K.floaters.dxPx[i]}px`,
                animationDuration: reduceMotion
                  ? undefined
                  : `${K.floaters.durationSec[i]}s`,
                animationDelay: reduceMotion
                  ? undefined
                  : `${K.floaters.delaySec[i]}s`,
                animationPlayState:
                  active && !reduceMotion ? "running" : "paused",
              }}
            >
              <svg
                viewBox="0 0 512 512"
                width={size}
                height={size}
                aria-hidden
              >
                <path d={HEART_PATH} />
              </svg>
            </div>
          );
        })}
      </div>

      <header
        className="relative z-[5] flex w-full shrink-0 items-center justify-center overflow-visible"
        style={{ height: `${K.heroBandPct}%` }}
      >
        <div
          className="relative z-[10] aspect-square max-h-[88%] overflow-hidden"
          style={{
            width: `min(${K.heroSizePct}%, 92%)`,
            background: K.cardPanel,
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
        className="relative z-[4] flex min-h-0 w-full flex-1 flex-col"
        style={{
          marginTop: -K.listPullUpPx,
          paddingInline: K.listPadXPx,
          paddingBottom: K.brandPadBottomPx,
          paddingTop: 0,
        }}
      >
        <div className="flex w-full shrink-0 flex-col items-center">
          <div className="min-w-0" style={{ width: `${K.listWidthPct}%` }}>
            <p
              className="truncate font-sans font-medium"
              style={{
                ...listLabelType,
                color: K.cardMuted,
                marginBottom: `${K.listLabelGapRem}rem`,
              }}
            >
              {K.listLabel}
            </p>
            {artists.length === 0 ? (
              <p
                className="truncate font-sans font-semibold"
                style={{
                  fontSize: `${K.typeRem}rem`,
                  lineHeight: 1.25,
                  color: K.cardMuted,
                }}
              >
                Nothing here.
              </p>
            ) : (
              <ol
                className="flex flex-col"
                style={{ gap: `${K.listRowGapRem}rem` }}
              >
                {artists.map((row, i) => (
                  <li
                    key={row.id}
                    className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-[0.28rem] font-sans font-semibold tracking-[-0.01em]"
                    style={{
                      fontSize: `${K.typeRem}rem`,
                      lineHeight: 1.25,
                      color: K.cardInk,
                    }}
                  >
                    <span className="tabular-nums">{i + 1}</span>
                    <span className="min-w-0 truncate">{row.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {showMetrics ? (
          <div
            className="grid w-full shrink-0 grid-cols-2"
            style={{
              columnGap: K.listColGapPx,
              marginTop: K.metricsGapAfterListPx,
            }}
          >
            <div className="min-w-0">
              <p
                className="font-sans font-medium"
                style={{ ...metricLabelType, color: K.cardMuted }}
              >
                Liked songs
              </p>
              <p
                className="mt-0.5 font-sans font-extrabold tabular-nums tracking-[-0.03em]"
                style={{
                  fontSize: `${K.metricNumberRem}rem`,
                  lineHeight: 1.05,
                  color: K.cardInk,
                }}
              >
                {likedCount.toLocaleString()}
              </p>
            </div>
            <div className="min-w-0">
              <p
                className="font-sans font-medium"
                style={{ ...metricLabelType, color: K.cardMuted }}
              >
                Liked this year
              </p>
              <p
                className="mt-0.5 font-sans font-extrabold tabular-nums tracking-[-0.03em]"
                style={{
                  fontSize: `${K.metricNumberRem}rem`,
                  lineHeight: 1.05,
                  color: K.cardInk,
                }}
              >
                {likedThisYearCount.toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        <div
          className="w-full shrink-0 text-center font-sans font-bold"
          style={{
            marginTop: K.brandGapAfterListPx,
            fontSize: `${K.brand.sizeRem}rem`,
            letterSpacing: `${K.brand.letterSpacingEm}em`,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            color: K.cardInk,
          }}
        >
          {K.brandLine}
        </div>
      </div>
    </div>
  );
}
