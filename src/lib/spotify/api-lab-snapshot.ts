import "server-only";

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { deflateSync, inflateSync } from "node:zlib";
import { CompactEncrypt, compactDecrypt } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { ScrappedApiReport } from "@/lib/scrapped-api";

const FS_DIR = path.join(process.cwd(), "data", "processed");
const COOKIE_PREFIX = "spotify_lab";
const COOKIE_COUNT = `${COOKIE_PREFIX}_n`;
/** Stay under typical 4KB per-cookie limits after encryption overhead. */
const CHUNK_SIZE = 2800;
/**
 * Hard cap on Lab cookie chunks. Node’s default max header size is ~16KB;
 * more than ~4 chunks of Lab cookies alone can 431 every request.
 */
const MAX_COOKIE_CHUNKS = 4;

export type StoredApiLabSnapshot = {
  fetchedAt: string;
  userId?: string;
  report: ScrappedApiReport;
  likedUris: string[];
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for API lab snapshot cookies");
  }
  return createHash("sha256").update(secret).digest();
}

function cookieOptions() {
  const secure = (process.env.AUTH_URL ?? "").startsWith("https://");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

function fsPathFor(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(FS_DIR, `api-lab-snapshot-${safe}.json`);
}

function legacyFsPath(): string {
  return path.join(FS_DIR, "api-lab-snapshot.json");
}

/** Deck only needs a short list per card; Lab prose is rebuilt on the next full fetch. */
const COOKIE_ITEM_CAP = 5;

/**
 * Shrink the snapshot for sealed cookies without dropping album art.
 *
 * On Vercel the FS write is a no-op, so cookies are the only persistence.
 * Nulling `imageUrl` (the old approach) fit more easily but left every cover
 * blank in production. Drop Lab-only prose and extra rows instead.
 */
function slimForCookie(stored: StoredApiLabSnapshot): StoredApiLabSnapshot {
  const report: ScrappedApiReport = {
    year: stored.report.year,
    fetchedAt: stored.report.fetchedAt,
    profileName: stored.report.profileName,
    headlines: stored.report.headlines.map((h) => ({
      id: h.id,
      percent: h.percent,
      label: h.label,
      detail: "",
    })),
    summary: stored.report.summary,
    cards: stored.report.cards.map((card) => ({
      id: card.id,
      title: card.title,
      calculated: "",
      means: "",
      bar: "",
      source: "",
      headline: card.headline,
      items: card.items.slice(0, COOKIE_ITEM_CAP).map((item) => ({
        id: item.id,
        trackId: item.trackId,
        label: item.label,
        sublabel: item.sublabel,
        detail: item.detail,
        value: item.value,
        imageUrl: item.imageUrl,
      })),
    })),
  };
  return {
    fetchedAt: stored.fetchedAt,
    userId: stored.userId,
    report,
    // Plus joins can use a short sample; full URI list is disk-only locally.
    likedUris: stored.likedUris.slice(0, 40),
  };
}

async function seal(stored: StoredApiLabSnapshot): Promise<string> {
  const compressed = deflateSync(Buffer.from(JSON.stringify(stored), "utf8"));
  return new CompactEncrypt(new Uint8Array(compressed))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secretKey());
}

async function unseal(token: string): Promise<StoredApiLabSnapshot | null> {
  try {
    const { plaintext } = await compactDecrypt(token, secretKey());
    const json = inflateSync(Buffer.from(plaintext)).toString("utf8");
    const parsed = JSON.parse(json) as StoredApiLabSnapshot;
    if (!parsed?.report || !parsed.fetchedAt || !Array.isArray(parsed.likedUris)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function chunkPayload(payload: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + CHUNK_SIZE));
  }
  return chunks.length > 0 ? chunks : [""];
}

function readFsSnapshot(userId?: string): StoredApiLabSnapshot | null {
  const candidates = [
    ...(userId ? [fsPathFor(userId)] : []),
    legacyFsPath(),
  ];
  for (const filePath of candidates) {
    try {
      const parsed = JSON.parse(
        fs.readFileSync(filePath, "utf8"),
      ) as StoredApiLabSnapshot;
      if (!parsed?.report || !parsed.fetchedAt || !Array.isArray(parsed.likedUris)) {
        continue;
      }
      if (userId && parsed.userId && parsed.userId !== userId) continue;
      return parsed;
    } catch {
      // try next
    }
  }
  return null;
}

function writeFsSnapshot(stored: StoredApiLabSnapshot): void {
  try {
    fs.mkdirSync(FS_DIR, { recursive: true });
    const filePath = stored.userId
      ? fsPathFor(stored.userId)
      : legacyFsPath();
    fs.writeFileSync(filePath, `${JSON.stringify(stored, null, 2)}\n`);
  } catch {
    // Vercel / read-only FS — cookie path is the source of truth there.
  }
}

async function readCookieSnapshot(): Promise<StoredApiLabSnapshot | null> {
  try {
    const jar = await cookies();
    const nRaw = jar.get(COOKIE_COUNT)?.value;
    const n = Number(nRaw);
    if (!Number.isFinite(n) || n < 1 || n > MAX_COOKIE_CHUNKS) return null;
    let payload = "";
    for (let i = 0; i < n; i += 1) {
      const part = jar.get(`${COOKIE_PREFIX}_${i}`)?.value;
      if (!part) return null;
      payload += part;
    }
    return unseal(payload);
  } catch {
    return null;
  }
}

function applySnapshotCookies(
  response: NextResponse,
  chunks: string[],
): void {
  const opts = cookieOptions();
  response.cookies.set(COOKIE_COUNT, String(chunks.length), opts);
  for (let i = 0; i < chunks.length; i += 1) {
    response.cookies.set(`${COOKIE_PREFIX}_${i}`, chunks[i]!, opts);
  }
  // Clear any leftover higher-index chunks from a previous larger snapshot.
  for (let i = chunks.length; i < 40; i += 1) {
    response.cookies.delete(`${COOKIE_PREFIX}_${i}`);
  }
}

export async function clearApiLabSnapshotCookies(
  response?: NextResponse,
): Promise<void> {
  if (response) {
    response.cookies.delete(COOKIE_COUNT);
    for (let i = 0; i < 40; i += 1) {
      response.cookies.delete(`${COOKIE_PREFIX}_${i}`);
    }
    return;
  }
  try {
    const jar = await cookies();
    jar.delete(COOKIE_COUNT);
    for (let i = 0; i < 40; i += 1) {
      jar.delete(`${COOKIE_PREFIX}_${i}`);
    }
  } catch {
    // ignore
  }
}

/**
 * Attach sealed snapshot cookies when they fit the header budget.
 * Oversized payloads clear Lab cookies and rely on the FS snapshot instead
 * (local only — Vercel has no durable FS for this path).
 * @returns whether cookies were written
 */
export async function attachApiLabSnapshotCookies(
  response: NextResponse,
  stored: StoredApiLabSnapshot,
): Promise<boolean> {
  const sealed = await seal(slimForCookie(stored));
  const chunks = chunkPayload(sealed);
  if (chunks.length > MAX_COOKIE_CHUNKS) {
    await clearApiLabSnapshotCookies(response);
    return false;
  }
  applySnapshotCookies(response, chunks);
  return true;
}

export async function readApiLabSnapshot(
  userId?: string,
): Promise<StoredApiLabSnapshot | null> {
  // Prefer disk locally — avoids 431 from fat cookie jars after Lab grew.
  const fromFs = readFsSnapshot(userId);
  if (fromFs) {
    if (userId && fromFs.userId && fromFs.userId !== userId) {
      /* fall through */
    } else {
      return fromFs;
    }
  }
  const fromCookie = await readCookieSnapshot();
  if (fromCookie) {
    if (userId && fromCookie.userId && fromCookie.userId !== userId) {
      return null;
    }
    return fromCookie;
  }
  return null;
}

export async function writeApiLabSnapshot(
  stored: StoredApiLabSnapshot,
  response?: NextResponse,
): Promise<boolean> {
  writeFsSnapshot(stored);
  if (response) {
    return attachApiLabSnapshotCookies(response, stored);
  }
  return true;
}

export async function cachedLikedTrackUris(userId?: string): Promise<string[]> {
  const stored = await readApiLabSnapshot(userId);
  return stored?.likedUris ?? [];
}
