import "server-only";

import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import {
  ensureApiReportSummary,
  type ScrappedApiReport,
} from "@/lib/scrapped-api";
import { slimReportForDeckPersist } from "@/lib/scrapped-api-slim";
import { sendStoryLinkEmail } from "@/lib/story-snapshot/email";

/** Default keep window for post-seat replay links. */
const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Kill switch for Neon persist + one-shot story-link email (D-041).
 * Plumbing stays; off until `STORY_SNAPSHOT_ENABLED=1` (or true/yes).
 * Replay reads (`/s/[token]`) stay available for any row already stored.
 */
export function isStorySnapshotPersistEnabled(): boolean {
  const v = process.env.STORY_SNAPSHOT_ENABLED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function databaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim();
  return url || null;
}

function sqlClient() {
  const url = databaseUrl();
  if (!url) return null;
  return neon(url);
}

let ensured = false;

async function ensureTable(): Promise<boolean> {
  const sql = sqlClient();
  if (!sql) return false;
  if (ensured) return true;
  await sql`
    CREATE TABLE IF NOT EXISTS story_snapshots (
      token TEXT PRIMARY KEY,
      spotify_user_id TEXT NOT NULL,
      year INT NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      UNIQUE (spotify_user_id, year)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS story_snapshots_user_year_idx
    ON story_snapshots (spotify_user_id, year)
  `;
  // Additive columns for one-shot story-link email (existing tables).
  await sql`
    ALTER TABLE story_snapshots
    ADD COLUMN IF NOT EXISTS email TEXT
  `;
  await sql`
    ALTER TABLE story_snapshots
    ADD COLUMN IF NOT EXISTS story_link_emailed_at TIMESTAMPTZ
  `;
  ensured = true;
  return true;
}

function mintToken(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * Host for shareable `/s/[token]` links (one-shot email).
 * Prefer `STORY_PUBLIC_URL` so local `AUTH_URL=http://127.0.0.1:3000` (OAuth)
 * does not leak into emails. On Vercel, AUTH_URL alone is enough when it is
 * the production origin.
 */
function publicBaseUrl(): string {
  const base =
    process.env.STORY_PUBLIC_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://127.0.0.1:3000";
  return base.replace(/\/$/, "");
}

export function storyUrlForToken(token: string): string {
  return `${publicBaseUrl()}/s/${token}`;
}

export type UpsertStorySnapshotResult = {
  token: string;
  storyUrl: string;
};

/**
 * Persist a deck-slim report for post-seat replay. Soft-noops when persist is
 * disabled, or Neon is unset (local without DATABASE_URL). Reuses the existing
 * token on upsert.
 */
export async function upsertStorySnapshot(input: {
  spotifyUserId: string;
  year: number;
  report: ScrappedApiReport;
  email?: string | null;
}): Promise<UpsertStorySnapshotResult | null> {
  if (!isStorySnapshotPersistEnabled()) return null;
  if (!input.spotifyUserId) return null;
  try {
    if (!(await ensureTable())) return null;
    const sql = sqlClient();
    if (!sql) return null;

    const slim = ensureApiReportSummary(
      slimReportForDeckPersist(input.report),
    );
    const expiresAt = new Date(Date.now() + DEFAULT_TTL_MS).toISOString();
    const email =
      typeof input.email === "string" && input.email.trim()
        ? input.email.trim().toLowerCase()
        : null;

    const existing = await sql`
      SELECT token
      FROM story_snapshots
      WHERE spotify_user_id = ${input.spotifyUserId}
        AND year = ${input.year}
      LIMIT 1
    `;
    const token =
      typeof existing[0]?.token === "string" && existing[0].token
        ? existing[0].token
        : mintToken();

    // Neon serializes JS objects as JSON for jsonb columns (do not stringify).
    await sql`
      INSERT INTO story_snapshots (
        token, spotify_user_id, year, report, expires_at, email
      )
      VALUES (
        ${token},
        ${input.spotifyUserId},
        ${input.year},
        ${slim as unknown as string},
        ${expiresAt},
        ${email}
      )
      ON CONFLICT (spotify_user_id, year) DO UPDATE SET
        report = EXCLUDED.report,
        updated_at = NOW(),
        expires_at = EXCLUDED.expires_at,
        email = COALESCE(EXCLUDED.email, story_snapshots.email)
    `;

    return { token, storyUrl: storyUrlForToken(token) };
  } catch (err) {
    console.error("[story-snapshot] upsert failed", err);
    return null;
  }
}

/**
 * Send the private story URL once per user+year. No-ops if persist is
 * disabled, already stamped, or email/Resend is unavailable.
 */
export async function maybeSendStoryLinkEmailOnce(input: {
  spotifyUserId: string;
  year: number;
  email: string;
  storyUrl: string;
}): Promise<void> {
  if (!isStorySnapshotPersistEnabled()) return;
  const to = input.email.trim().toLowerCase();
  if (!to || !input.spotifyUserId) return;

  try {
    if (!(await ensureTable())) return;
    const sql = sqlClient();
    if (!sql) return;

    const rows = await sql`
      SELECT story_link_emailed_at
      FROM story_snapshots
      WHERE spotify_user_id = ${input.spotifyUserId}
        AND year = ${input.year}
      LIMIT 1
    `;
    if (rows[0]?.story_link_emailed_at != null) return;

    const ok = await sendStoryLinkEmail({ to, storyUrl: input.storyUrl });
    if (!ok) return;

    await sql`
      UPDATE story_snapshots
      SET
        story_link_emailed_at = NOW(),
        email = COALESCE(email, ${to}),
        updated_at = NOW()
      WHERE spotify_user_id = ${input.spotifyUserId}
        AND year = ${input.year}
        AND story_link_emailed_at IS NULL
    `;
  } catch (err) {
    console.error("[story-snapshot] maybeSendStoryLinkEmailOnce failed", err);
  }
}

/** Absolute story URL for a signed-in user, if a non-expired row exists. */
export async function getStoryUrlForUser(
  spotifyUserId: string | undefined,
  year: number,
): Promise<string | null> {
  if (!spotifyUserId) return null;
  try {
    if (!(await ensureTable())) return null;
    const sql = sqlClient();
    if (!sql) return null;

    const rows = await sql`
      SELECT token
      FROM story_snapshots
      WHERE spotify_user_id = ${spotifyUserId}
        AND year = ${year}
        AND expires_at > NOW()
      LIMIT 1
    `;
    const token = rows[0]?.token;
    if (typeof token !== "string" || !token) return null;
    return storyUrlForToken(token);
  } catch (err) {
    console.error("[story-snapshot] getStoryUrlForUser failed", err);
    return null;
  }
}

/** Load a report for `/s/[token]` replay. */
export async function getStoryReportByToken(
  token: string,
): Promise<ScrappedApiReport | null> {
  if (!token || token.length < 16 || token.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;

  try {
    if (!(await ensureTable())) return null;
    const sql = sqlClient();
    if (!sql) return null;

    const rows = await sql`
      SELECT report
      FROM story_snapshots
      WHERE token = ${token}
        AND expires_at > NOW()
      LIMIT 1
    `;
    const raw = rows[0]?.report;
    if (!raw || typeof raw !== "object") return null;
    return ensureApiReportSummary(raw as ScrappedApiReport);
  } catch (err) {
    console.error("[story-snapshot] getStoryReportByToken failed", err);
    return null;
  }
}
