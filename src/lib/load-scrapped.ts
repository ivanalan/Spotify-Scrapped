import "server-only";

import { dbExists, openDb } from "./db";
import {
  SCRAPPED_YEAR,
  getScrappedReportFromDb,
  likedButScrappedFromDb,
  type ScrappedPageResult,
} from "./scrapped";
import { getLikedTrackUris, getSpotifyAccessToken } from "./spotify";

export async function loadScrappedPage(
  year: number = SCRAPPED_YEAR,
): Promise<ScrappedPageResult> {
  if (!dbExists()) {
    return {
      kind: "empty",
      message:
        "No database yet. Place your export in data/raw/, then run npm run ingest.",
    };
  }

  try {
    const db = openDb();
    const report = getScrappedReportFromDb(db, year);

    if (!report) {
      db.close();
      return {
        kind: "empty",
        message: `No ${year} track plays found. Re-export your Extended Streaming History and run npm run ingest.`,
      };
    }

    const token = await getSpotifyAccessToken();
    if (token) {
      try {
        const likedUris = await getLikedTrackUris();
        report.likedConnected = true;
        report.likedButScrapped = likedButScrappedFromDb(db, year, likedUris);
      } catch {
        report.likedConnected = true;
        report.likedButScrapped = [];
      }
    }

    db.close();
    return { kind: "ready", report };
  } catch {
    return {
      kind: "empty",
      message: "Could not open history.db. Re-run npm run ingest.",
    };
  }
}
