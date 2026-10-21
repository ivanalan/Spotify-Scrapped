import "server-only";

import { neon } from "@neondatabase/serverless";

function databaseUrl(): string {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim();
  if (!url) {
    throw new Error("Missing DATABASE_URL (Neon)");
  }
  return url;
}

/** Insert email; ignore duplicates (UNIQUE). Returns whether a new row was written. */
export async function insertWaitlistEmail(email: string): Promise<boolean> {
  const sql = neon(databaseUrl());
  const rows = await sql`
    INSERT INTO waitlist_signups (email)
    VALUES (${email})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}
