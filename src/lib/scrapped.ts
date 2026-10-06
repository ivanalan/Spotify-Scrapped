import type Database from "better-sqlite3";

export const SCRAPPED_YEAR = 2026;

const MIN_SKIP_COUNT_APPEARANCES = 5;
const MIN_ARTIST_PLAYS = 15;
const MIN_ARC_PLAYS = 4;
const MIN_FINISH_APPEARANCES = 8;
const TOP_N = 5;

const YTD_WHERE = `
  content_kind = 'track'
  AND spotify_track_uri IS NOT NULL
  AND ts >= ?
  AND ts < ?
`;

export type ScrappedTrackRow = {
  spotify_track_uri: string;
  track_name: string | null;
  artist_name: string | null;
  appearances: number;
  skips: number;
  skip_rate: number;
  ms_played_total: number;
};

export type ScrappedArcRow = {
  spotify_track_uri: string;
  track_name: string | null;
  artist_name: string | null;
  early_n: number;
  late_n: number;
  early_skip_rate: number;
  late_metric: number;
  /** Human detail for the bar subtitle. */
  detail: string;
};

export type ScrappedFinishRow = {
  spotify_track_uri: string;
  track_name: string | null;
  artist_name: string | null;
  appearances: number;
  finish_rate: number;
  finishes: number;
};

export type ScrappedArtistRow = {
  artist_name: string;
  appearances: number;
  skips: number;
  skip_rate: number;
  score: number;
};

export type ScrappedSummary = {
  year: number;
  firstTs: string | null;
  lastTs: string | null;
  playCount: number;
  skipCount: number;
  skipRate: number;
  uniqueTracks: number;
  oneListenCount: number;
};

export type ScrappedReport = {
  summary: ScrappedSummary;
  topSkippedByCount: ScrappedTrackRow[];
  abandonedArtists: ScrappedArtistRow[];
  oneListenExamples: ScrappedTrackRow[];
  likedButScrapped: ScrappedTrackRow[];
  likedConnected: boolean;
  secondChanceHeroes: ScrappedArcRow[];
  fellOff: ScrappedArcRow[];
  actuallyFinished: ScrappedFinishRow[];
  hourPoints: { ts: string; is_skip: number }[];
};

export type ScrappedPageResult =
  | { kind: "ready"; report: ScrappedReport }
  | { kind: "empty"; message: string };

function yearBounds(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01T00:00:00.000Z`,
    end: `${year + 1}-01-01T00:00:00.000Z`,
  };
}

function midYearIso(year: number): string {
  return `${year}-07-01T00:00:00.000Z`;
}

function q1End(year: number): string {
  return `${year}-04-01T00:00:00.000Z`;
}

function q3Start(year: number): string {
  return `${year}-07-01T00:00:00.000Z`;
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

type PlayRow = {
  ts: string;
  spotify_track_uri: string;
  track_name: string | null;
  artist_name: string | null;
  is_skip: number;
  reason_end: string;
  ms_played: number;
};

export function getScrappedReportFromDb(
  db: Database.Database,
  year: number = SCRAPPED_YEAR,
): ScrappedReport | null {
  const { start, end } = yearBounds(year);
  const mid = midYearIso(year);
  const q1e = q1End(year);
  const q3s = q3Start(year);

  const plays = db
    .prepare(
      `
      SELECT
        ts, spotify_track_uri, track_name, artist_name,
        is_skip, reason_end, ms_played
      FROM plays
      WHERE ${YTD_WHERE}
      ORDER BY ts ASC
      `,
    )
    .all(start, end) as PlayRow[];

  if (plays.length === 0) return null;

  let skipCount = 0;
  const uriAgg = new Map<
    string,
    {
      track_name: string | null;
      artist_name: string | null;
      n: number;
      skips: number;
      ms: number;
      done: number;
    }
  >();

  type Half = { n: number; skips: number; done: number };
  const halfMap = new Map<
    string,
    { early: Half; late: Half; name: string | null; artist: string | null }
  >();
  const qMap = new Map<
    string,
    { q1: Half; late: Half; name: string | null; artist: string | null }
  >();

  for (const p of plays) {
    skipCount += p.is_skip;

    let a = uriAgg.get(p.spotify_track_uri);
    if (!a) {
      a = {
        track_name: p.track_name,
        artist_name: p.artist_name,
        n: 0,
        skips: 0,
        ms: 0,
        done: 0,
      };
      uriAgg.set(p.spotify_track_uri, a);
    }
    a.n += 1;
    a.skips += p.is_skip;
    a.ms += p.ms_played;
    if (p.reason_end === "trackdone") a.done += 1;
    if (!a.track_name && p.track_name) a.track_name = p.track_name;
    if (!a.artist_name && p.artist_name) a.artist_name = p.artist_name;

    let h = halfMap.get(p.spotify_track_uri);
    if (!h) {
      h = {
        early: { n: 0, skips: 0, done: 0 },
        late: { n: 0, skips: 0, done: 0 },
        name: p.track_name,
        artist: p.artist_name,
      };
      halfMap.set(p.spotify_track_uri, h);
    }
    const hb = p.ts < mid ? h.early : h.late;
    hb.n += 1;
    hb.skips += p.is_skip;
    if (p.reason_end === "trackdone") hb.done += 1;

    let q = qMap.get(p.spotify_track_uri);
    if (!q) {
      q = {
        q1: { n: 0, skips: 0, done: 0 },
        late: { n: 0, skips: 0, done: 0 },
        name: p.track_name,
        artist: p.artist_name,
      };
      qMap.set(p.spotify_track_uri, q);
    }
    if (p.ts < q1e) {
      q.q1.n += 1;
      q.q1.skips += p.is_skip;
      if (p.reason_end === "trackdone") q.q1.done += 1;
    } else if (p.ts >= q3s) {
      q.late.n += 1;
      q.late.skips += p.is_skip;
      if (p.reason_end === "trackdone") q.late.done += 1;
    }
  }

  const uriList = [...uriAgg.entries()].map(([uri, a]) => ({
    spotify_track_uri: uri,
    ...a,
    skip_rate: a.n > 0 ? a.skips / a.n : 0,
  }));

  const topSkippedByCount: ScrappedTrackRow[] = [...uriList]
    .filter((a) => a.n >= MIN_SKIP_COUNT_APPEARANCES)
    .sort((a, b) => b.skips - a.skips || b.skip_rate - a.skip_rate)
    .slice(0, TOP_N)
    .map((a) => ({
      spotify_track_uri: a.spotify_track_uri,
      track_name: a.track_name,
      artist_name: a.artist_name,
      appearances: a.n,
      skips: a.skips,
      skip_rate: a.skip_rate,
      ms_played_total: a.ms,
    }));

  const oneListen = uriList.filter((a) => a.n === 1);
  const oneListenExamples: ScrappedTrackRow[] = [...oneListen]
    .sort((a, b) => b.skips - a.skips || b.ms - a.ms)
    .slice(0, TOP_N)
    .map((a) => ({
      spotify_track_uri: a.spotify_track_uri,
      track_name: a.track_name,
      artist_name: a.artist_name,
      appearances: 1,
      skips: a.skips,
      skip_rate: a.skip_rate,
      ms_played_total: a.ms,
    }));

  const secondChanceHeroes: ScrappedArcRow[] = [];
  for (const [uri, h] of halfMap) {
    if (h.early.n < MIN_ARC_PLAYS || h.late.n < MIN_ARC_PLAYS) continue;
    const earlySkip = h.early.skips / h.early.n;
    const lateDone = h.late.done / h.late.n;
    if (earlySkip >= 0.6 && lateDone >= 0.5) {
      secondChanceHeroes.push({
        spotify_track_uri: uri,
        track_name: h.name,
        artist_name: h.artist,
        early_n: h.early.n,
        late_n: h.late.n,
        early_skip_rate: earlySkip,
        late_metric: lateDone,
        detail: `H1 skip ${pct(earlySkip)} → H2 finish ${pct(lateDone)}`,
      });
    }
  }
  secondChanceHeroes.sort(
    (a, b) =>
      b.late_metric - a.late_metric ||
      b.early_skip_rate - a.early_skip_rate ||
      b.early_n + b.late_n - (a.early_n + a.late_n),
  );

  const fellOff: ScrappedArcRow[] = [];
  for (const [uri, q] of qMap) {
    if (q.q1.n < MIN_ARC_PLAYS || q.late.n < MIN_ARC_PLAYS) continue;
    const q1Skip = q.q1.skips / q.q1.n;
    const lateSkip = q.late.skips / q.late.n;
    if (q1Skip <= 0.35 && lateSkip >= 0.55) {
      fellOff.push({
        spotify_track_uri: uri,
        track_name: q.name,
        artist_name: q.artist,
        early_n: q.q1.n,
        late_n: q.late.n,
        early_skip_rate: q1Skip,
        late_metric: lateSkip,
        detail: `Q1 skip ${pct(q1Skip)} → Q3+ ${pct(lateSkip)}`,
      });
    }
  }
  fellOff.sort(
    (a, b) =>
      b.late_metric - a.late_metric ||
      a.early_skip_rate - b.early_skip_rate ||
      b.early_n + b.late_n - (a.early_n + a.late_n),
  );

  const actuallyFinished: ScrappedFinishRow[] = [...uriList]
    .filter((a) => a.n >= MIN_FINISH_APPEARANCES)
    .map((a) => ({
      spotify_track_uri: a.spotify_track_uri,
      track_name: a.track_name,
      artist_name: a.artist_name,
      appearances: a.n,
      finishes: a.done,
      finish_rate: a.done / a.n,
    }))
    .sort(
      (a, b) =>
        b.finish_rate - a.finish_rate || b.appearances - a.appearances,
    )
    .slice(0, TOP_N);

  const artistMap = new Map<string, { n: number; skips: number }>();
  for (const p of plays) {
    if (!p.artist_name) continue;
    const cur = artistMap.get(p.artist_name) ?? { n: 0, skips: 0 };
    cur.n += 1;
    cur.skips += p.is_skip;
    artistMap.set(p.artist_name, cur);
  }
  const abandonedArtists: ScrappedArtistRow[] = [...artistMap.entries()]
    .filter(([, v]) => v.n >= MIN_ARTIST_PLAYS)
    .map(([artist_name, v]) => {
      const skip_rate = v.skips / v.n;
      return {
        artist_name,
        appearances: v.n,
        skips: v.skips,
        skip_rate,
        score: v.skips * skip_rate,
      };
    })
    .sort((a, b) => b.score - a.score || b.skips - a.skips)
    .slice(0, TOP_N);

  return {
    summary: {
      year,
      firstTs: plays[0]?.ts ?? null,
      lastTs: plays[plays.length - 1]?.ts ?? null,
      playCount: plays.length,
      skipCount,
      skipRate: skipCount / plays.length,
      uniqueTracks: uriAgg.size,
      oneListenCount: oneListen.length,
    },
    topSkippedByCount,
    abandonedArtists,
    oneListenExamples,
    likedButScrapped: [],
    likedConnected: false,
    secondChanceHeroes: secondChanceHeroes.slice(0, TOP_N),
    fellOff: fellOff.slice(0, TOP_N),
    actuallyFinished,
    hourPoints: plays.map((p) => ({ ts: p.ts, is_skip: p.is_skip })),
  };
}

export function likedButScrappedFromDb(
  db: Database.Database,
  year: number,
  likedUris: string[],
): ScrappedTrackRow[] {
  if (likedUris.length === 0) return [];

  const { start, end } = yearBounds(year);
  const placeholders = likedUris.map(() => "?").join(", ");

  return db
    .prepare(
      `
      SELECT
        spotify_track_uri,
        MAX(track_name) AS track_name,
        MAX(artist_name) AS artist_name,
        COUNT(*) AS appearances,
        SUM(is_skip) AS skips,
        CAST(SUM(is_skip) AS REAL) / COUNT(*) AS skip_rate,
        COALESCE(SUM(ms_played), 0) AS ms_played_total
      FROM plays
      WHERE ${YTD_WHERE}
        AND spotify_track_uri IN (${placeholders})
      GROUP BY spotify_track_uri
      HAVING COUNT(*) >= ?
        AND SUM(is_skip) > 0
      ORDER BY skips DESC, skip_rate DESC
      LIMIT ?
      `,
    )
    .all(
      start,
      end,
      ...likedUris,
      MIN_SKIP_COUNT_APPEARANCES,
      TOP_N,
    ) as ScrappedTrackRow[];
}

export function formatPct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatDateRange(
  firstTs: string | null,
  lastTs: string | null,
): string {
  if (!firstTs || !lastTs) return "—";
  return `${firstTs.slice(0, 10)} → ${lastTs.slice(0, 10)}`;
}
