import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { ApiListeningSnapshot } from "@/lib/scrapped-api";

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "data",
  "processed",
  "api-lab-snapshot.json",
);

export type StoredApiLabSnapshot = {
  fetchedAt: string;
  userId?: string;
  snap: ApiListeningSnapshot;
};

export function readApiLabSnapshot(): StoredApiLabSnapshot | null {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(SNAPSHOT_PATH, "utf8"),
    ) as StoredApiLabSnapshot;
    if (!parsed?.snap || !parsed.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeApiLabSnapshot(stored: StoredApiLabSnapshot): void {
  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(stored, null, 2)}\n`);
}

export function cachedLikedTrackUris(): string[] {
  const stored = readApiLabSnapshot();
  if (!stored) return [];
  const uris: string[] = [];
  for (const row of stored.snap.liked) {
    if (row.track?.uri) uris.push(row.track.uri);
  }
  return uris;
}
