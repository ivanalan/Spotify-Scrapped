"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RankBars } from "@/components/scrapped/visuals/RankBars";
import { SpotifyLabFetchForm } from "@/components/scrapped/SpotifyLabFetchForm";
import { SpotifyRateLimitWait } from "@/components/scrapped/SpotifyRateLimitWait";
import type { ApiMetricCard, ScrappedApiReport } from "@/lib/scrapped-api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props =
  | {
      kind: "ready";
      report: ScrappedApiReport;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    }
  | { kind: "needs_auth"; message: string }
  | {
      kind: "needs_fetch";
      message: string;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    }
  | {
      kind: "error";
      message: string;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    };

function MetricCardView({
  card,
  openPreviewKey,
  onTogglePreview,
}: {
  card: ApiMetricCard;
  openPreviewKey: string | null;
  onTogglePreview: (previewKey: string) => void;
}) {
  return (
    <article
      id={card.id}
      className="scroll-mt-24 space-y-4 border-t border-border py-8 first:border-t-0 first:pt-0"
    >
      <header className="space-y-3">
        <h2 className="font-heading text-2xl tracking-[-0.02em] text-foreground">
          {card.title}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground">Calculated. </span>
          {card.calculated}
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground">Means. </span>
          {card.means}
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-warn">Bar. </span>
          {card.bar}
        </p>
        <p className="text-xs text-muted-foreground">{card.source}</p>
      </header>
      {card.headline ? (
        <p className="font-heading text-xl tracking-[-0.02em] text-warn sm:text-2xl">
          {card.headline}
        </p>
      ) : null}
      {card.items.length > 0 ? (
        <RankBars
          openPreviewKey={openPreviewKey}
          onTogglePreview={onTogglePreview}
          items={card.items.map((item) => ({
            id: item.id,
            trackId: item.trackId,
            previewKey: item.trackId ? `${card.id}:${item.trackId}` : undefined,
            label: item.label,
            sublabel: item.sublabel,
            value: item.value,
            display: item.detail,
          }))}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing in the current sample matches this.
        </p>
      )}
    </article>
  );
}

export function ApiMetricsLab(props: Props) {
  const [query, setQuery] = useState("");
  const [openPreviewKey, setOpenPreviewKey] = useState<string | null>(null);

  const cards = props.kind === "ready" ? props.report.cards : [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.calculated.toLowerCase().includes(q) ||
        c.means.toLowerCase().includes(q) ||
        c.items.some(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            (i.sublabel?.toLowerCase().includes(q) ?? false),
        ),
    );
  }, [cards, query]);

  return (
    <div className="space-y-10">
      <header className="animate-rise space-y-4">
        <p className="font-mono text-sm text-ring">Scrapped Lab · API only</p>
        <h1 className="max-w-[16ch] font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Scrapped Lab
        </h1>
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
          Songs and artists that fell out of rotation, came back, or stayed
          on the shelf — including likes that never topped. Tops and Liked
          Songs only.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/scrapped"
            className="text-foreground underline-offset-2 hover:underline"
          >
            ← Scrapped
          </Link>
          <Link
            href="/scrapped/plus"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Scrapped Plus →
          </Link>
          <Link
            href="/scrapped/art"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Art lab →
          </Link>
          <span className="text-muted-foreground">
            Windows: 4 weeks · 6 months · several years. Each list is five.
            Play expands a preview under the song.
          </span>
        </div>
      </header>

      {props.kind === "needs_auth" ? (
        <div className="animate-rise-delay-1 space-y-4 border-y border-border py-8">
          <p className="text-sm text-warn">{props.message}</p>
          <a
            href="/api/spotify/login"
            className="inline-block text-foreground underline-offset-2 hover:underline"
          >
            Connect Spotify →
          </a>
        </div>
      ) : null}

      {props.kind === "needs_fetch" ? (
        <div className="animate-rise-delay-1 space-y-4 border-y border-border py-8">
          <p className="max-w-xl text-sm text-muted-foreground">{props.message}</p>
          {props.retryAfterSeconds ? (
            <SpotifyRateLimitWait
              message={props.message}
              retryAfterSeconds={props.retryAfterSeconds}
              quotaExceeded={props.quotaExceeded}
              className="text-sm text-warn"
            />
          ) : (
            <SpotifyLabFetchForm next="/scrapped/lab" label="Load from Spotify" />
          )}
        </div>
      ) : null}

      {props.kind === "error" ? (
        <SpotifyRateLimitWait
          message={props.message}
          retryAfterSeconds={props.retryAfterSeconds}
          quotaExceeded={props.quotaExceeded}
          className="animate-rise-delay-1 border-y border-border py-6 text-sm text-warn"
        />
      ) : null}

      {props.kind === "ready" ? (
        <>
          <div className="animate-rise-delay-1 space-y-6 border-y border-border py-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {props.report.headlines.map((item) => (
                <div key={item.id}>
                  <p className="font-mono text-[clamp(3rem,8vw,4.5rem)] leading-none tracking-tight text-warn tabular-nums">
                    {item.percent == null ? "—" : `${item.percent}%`}
                  </p>
                  <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-mono text-xs tabular-nums text-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
              Shares of Spotify’s top 50s. The API does not return skips, so
              these count who left a window, not how often a song was skipped.
            </p>
          </div>

          <p className="animate-rise-delay-1 text-xs text-muted-foreground">
            {props.report.profileName
              ? `${props.report.profileName} · `
              : null}
            snapshot {props.report.fetchedAt.slice(0, 19).replace("T", " ")} UTC
            · {props.report.summary.likedCount.toLocaleString()} liked
            · {props.report.summary.likedThisYearCount.toLocaleString()} liked
            this year ·{" "}
            {props.report.summary.likedNeverToppedCount.toLocaleString()} never
            topped · {props.report.summary.shortLikedCount}/
            {props.report.summary.shortTrackCount} four-week tops already liked
            · {props.report.summary.monthOnlyTrackCount} month-only songs
            · {props.report.summary.monthOnlyArtistCount} month-only artists
            · artists {props.report.summary.shortArtistCount}/
            {props.report.summary.mediumArtistCount}/
            {props.report.summary.longArtistCount} (4 weeks / 6 months / years)
          </p>

          {props.retryAfterSeconds ? (
            <SpotifyRateLimitWait
              message="Spotify cooldown is still active. This page is the saved snapshot."
              retryAfterSeconds={props.retryAfterSeconds}
              quotaExceeded={props.quotaExceeded}
              className="text-sm text-warn"
            />
          ) : (
            <SpotifyLabFetchForm
              next="/scrapped/lab"
              label="Refresh from Spotify"
            />
          )}

          <div className="animate-rise-delay-2 space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter metrics or titles…"
              className="max-w-md"
            />
            <div className="flex flex-wrap gap-2 text-xs">
              {props.report.cards.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className={cn(
                    "text-muted-foreground underline-offset-2 hover:text-foreground hover:underline",
                    filtered.some((f) => f.id === c.id) ? "" : "opacity-40",
                  )}
                >
                  {c.title}
                </a>
              ))}
            </div>
          </div>

          <div className="animate-rise-delay-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No metrics match.</p>
            ) : (
              filtered.map((card) => (
                <MetricCardView
                  key={card.id}
                  card={card}
                  openPreviewKey={openPreviewKey}
                  onTogglePreview={(previewKey) =>
                    setOpenPreviewKey((current) =>
                      current === previewKey ? null : previewKey,
                    )
                  }
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
