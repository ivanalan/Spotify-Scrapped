"use client";

import { chevronUpOutline, playOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";

export type RankBarItem = {
  id: string;
  label: string;
  sublabel?: string | null;
  value: number;
  display: string;
  trackId?: string;
  /** Stable id for the expanded preview, unique per row. */
  previewKey?: string;
};

type Props = {
  items: RankBarItem[];
  maxValue?: number;
  openPreviewKey?: string | null;
  onTogglePreview?: (previewKey: string) => void;
};

export function RankBars({
  items,
  maxValue,
  openPreviewKey,
  onTogglePreview,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough plays in this window for a ranking.
      </p>
    );
  }

  const max = maxValue ?? Math.max(...items.map((i) => i.value), 0.0001);

  return (
    <ol className="space-y-3">
      {items.map((item, i) => {
        const width = Math.max(4, (item.value / max) * 100);
        const expanded =
          item.previewKey != null && item.previewKey === openPreviewKey;
        return (
          <li key={item.id} className="space-y-1.5">
            <div
              className={
                item.previewKey && onTogglePreview
                  ? "flex items-start justify-between gap-3"
                  : "flex items-baseline justify-between gap-3"
              }
            >
              <div className="flex min-w-0 items-start gap-2">
                {item.previewKey && onTogglePreview ? (
                  <button
                    type="button"
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-[var(--duration-fast)] hover:border-ring aria-expanded:border-ring aria-expanded:text-warn"
                    aria-expanded={expanded}
                    aria-label={
                      expanded
                        ? `Hide preview of ${item.label}`
                        : `Show preview of ${item.label}`
                    }
                    onClick={() => onTogglePreview(item.previewKey!)}
                  >
                    <Icon
                      icon={expanded ? chevronUpOutline : playOutline}
                      className="h-3 w-3"
                    />
                  </button>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    <span className="mr-2 font-mono text-xs text-ring">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </p>
                  {item.sublabel ? (
                    <p className="truncate pl-7 text-xs text-muted-foreground">
                      {item.sublabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-warn">
                {item.display}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-full bg-warn transition-[width] duration-[var(--duration-move)] ease-[var(--ease-out)]"
                style={{ width: `${width}%` }}
              />
            </div>
            {expanded && item.trackId ? (
              <iframe
                title={`Preview of ${item.label}`}
                src={`https://open.spotify.com/embed/track/${item.trackId}?utm_source=generator&theme=0`}
                height={152}
                width="100%"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-md"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
