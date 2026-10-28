"use client";

import Image from "next/image";
import { SHARE_ALL_TIME_FAVS_KIT as K } from "@/lib/scrapped-card-palette";
import { cn } from "@/lib/utils";
import "@/components/scrapped/share-all-time-favs.css";

export type ShareAllTimeFavsTrack = {
  id: string;
  title: string;
};

type Props = {
  tracks: ShareAllTimeFavsTrack[];
  heroImageUrl?: string | null;
  heroAlt?: string;
  active?: boolean;
  className?: string;
};

function FilmStrip({ edge }: { edge: "top" | "bot" }) {
  const f = K.film;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[2] overflow-hidden"
      style={{
        [edge === "top" ? "top" : "bottom"]: 0,
        height: f.railHeightPx,
        background: f.bg,
      }}
      aria-hidden
    >
      <div
        className="share-favs-film-perfs"
        data-dir={edge}
        style={{
          gap: f.sprocketGapPx,
          paddingInline: f.sprocketPadXPx,
          ["--share-favs-film-dur" as string]: `${f.scrollTopSec}s`,
          ["--share-favs-film-dur-bot" as string]: `${f.scrollBotSec}s`,
        }}
      >
        {Array.from({ length: f.perfCount }, (_, i) => (
          <i
            key={i}
            style={{
              width: f.sprocketPx,
              height: f.sprocketPx,
              background: f.hole,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Share finale card 1: All time favs · yellow G3 cinema · centered brand (D-043).
 * Same 300×533 design canvas as the teal minimal card (D-033 / D-012).
 * Liked metrics removed; `myscrapped.com` sits under the list.
 */
export function ShareAllTimeFavsCard({
  tracks,
  heroImageUrl = null,
  heroAlt = "",
  active = false,
  className,
}: Props) {
  const listLabelType = {
    fontSize: `${K.listLabelRem}rem`,
    lineHeight: 1.2,
  } as const;

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
      <FilmStrip edge="top" />
      <FilmStrip edge="bot" />

      <header
        className="relative z-[3] flex w-full shrink-0 items-center justify-center overflow-visible"
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
          paddingBottom: K.film.railHeightPx + K.bodyPadBottomExtraPx,
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
            {tracks.length === 0 ? (
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
                {tracks.map((track, i) => (
                  <li
                    key={track.id}
                    className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-[0.28rem] font-sans font-semibold tracking-[-0.01em]"
                    style={{
                      fontSize: `${K.typeRem}rem`,
                      lineHeight: 1.25,
                      color: K.cardInk,
                    }}
                  >
                    <span className="tabular-nums">{i + 1}</span>
                    <span className="min-w-0 truncate">{track.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

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
