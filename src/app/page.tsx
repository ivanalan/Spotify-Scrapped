import Link from "next/link";
import { chevronForwardOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { dbExists, getCorpusSummary, openDb, type CorpusSummary } from "@/lib/db";

export const dynamic = "force-dynamic";

type HomeStatus =
  | { kind: "ready"; summary: CorpusSummary }
  | { kind: "empty"; message: string };

function getHomeStatus(): HomeStatus {
  if (!dbExists()) {
    return {
      kind: "empty",
      message:
        "No export database yet. Place your Extended Streaming History in data/raw/, then run npm run ingest — needed for export Scrapped.",
    };
  }

  try {
    const db = openDb();
    const summary = getCorpusSummary(db);
    db.close();
    if (summary.playCount === 0) {
      return {
        kind: "empty",
        message: "Database exists but has no plays. Re-run npm run ingest.",
      };
    }
    return { kind: "ready", summary };
  } catch {
    return {
      kind: "empty",
      message: "Could not open history.db. Re-run npm run ingest.",
    };
  }
}

function formatYearSpan(firstTs: string | null, lastTs: string | null): string {
  if (!firstTs || !lastTs) return "—";
  const start = firstTs.slice(0, 4);
  const end = lastTs.slice(0, 4);
  return start === end ? start : `${start}–${end}`;
}

function formatHours(hours: number): string {
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k`;
  return Math.round(hours).toLocaleString();
}

const destinations = [
  {
    href: "/scrapped",
    index: "01",
    title: "Scrapped",
    blurb:
      "Anti-Wrapped from your export — skips, abandoned artists, and second chances.",
  },
  {
    href: "/scrapped/api",
    index: "02",
    title: "API Scrapped",
    blurb:
      "Story deck from live tops — songs and artists that left the long run or fell out of rotation.",
  },
  {
    href: "/scrapped/lab",
    index: "03",
    title: "API Lab",
    blurb:
      "Same metrics as a searchable list — calculated, means, and bar definitions.",
  },
] as const;

export default function HomePage() {
  const status = getHomeStatus();

  return (
    <div className="space-y-12">
      <section className="animate-rise space-y-5">
        <h1 className="max-w-[12ch] font-heading text-[clamp(2.75rem,8vw,4.25rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Spotify Scrapped
        </h1>
        <p className="max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
          Anti-Wrapped for the songs that didn’t stick — from your full stream
          export, or live probes from the Spotify API.
        </p>
        <div className="h-px w-24 origin-left bg-ring animate-rule" />
      </section>

      {status.kind === "ready" ? (
        <dl className="animate-rise-delay-1 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Plays</dt>
            <dd className="mt-1 font-mono text-xl tabular-nums tracking-tight text-foreground">
              {status.summary.playCount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Hours</dt>
            <dd className="mt-1 font-mono text-xl tabular-nums tracking-tight text-foreground">
              {formatHours(status.summary.listenHours)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tracks</dt>
            <dd className="mt-1 font-mono text-xl tabular-nums tracking-tight text-foreground">
              {status.summary.uniqueTracks.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Span</dt>
            <dd className="mt-1 font-mono text-xl tabular-nums tracking-tight text-foreground">
              {formatYearSpan(status.summary.firstTs, status.summary.lastTs)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="animate-rise-delay-1 border-y border-border py-5 text-sm text-warn">
          {status.message}{" "}
          <Link
            href="/scrapped/lab"
            className="text-foreground underline-offset-2 hover:underline"
          >
            API Lab still works with Connect Spotify
          </Link>
          .
        </p>
      )}

      <section className="animate-rise-delay-2">
        <ul className="divide-y divide-border border-y border-border">
          {destinations.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="pressable group flex items-baseline gap-4 py-5 hover:bg-muted/40 sm:gap-6"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-ring">
                  {item.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-2xl tracking-[-0.02em] text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block max-w-md text-sm leading-relaxed text-muted-foreground">
                    {item.blurb}
                  </span>
                </span>
                <Icon
                  icon={chevronForwardOutline}
                  className="chevron-nudge h-4 w-4 shrink-0 self-center text-muted-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
