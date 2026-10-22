/**
 * Local seat-invite sender (D-035).
 * Usage: npm run invite -- a@x.com b@y.com
 * 1–5 emails; Resend template `seat-invite`; stamps Neon when on waitlist.
 */
import { neon } from "@neondatabase/serverless";
import {
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
} from "../src/lib/waitlist/email";
import { sendSeatInviteBatch } from "../src/lib/invite/send";

const MAX = 5;

function usage(): never {
  console.error(
    "Usage: npm run invite -- <email> [email...]  (1–5 addresses)\n" +
      "Requires RESEND_API_KEY, RESEND_FROM in .env.local.\n" +
      "Add Spotify Dashboard seats first; CTA is production /ready in the template.",
  );
  process.exit(1);
}

function databaseUrl(): string | null {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    null
  );
}

/** Best-effort stamp when the address is already on the waitlist. */
async function stampInviteSent(email: string): Promise<void> {
  const url = databaseUrl();
  if (!url) {
    console.warn(`stamp skipped for ${email}: no DATABASE_URL`);
    return;
  }
  const sql = neon(url);
  await sql`
    ALTER TABLE waitlist_signups
    ADD COLUMN IF NOT EXISTS invite_email_sent_at TIMESTAMPTZ
  `;
  await sql`
    UPDATE waitlist_signups
    SET invite_email_sent_at = NOW()
    WHERE email = ${email}
  `;
}

async function main() {
  const raw = process.argv.slice(2).filter((a) => a !== "--");
  if (raw.length < 1 || raw.length > MAX) {
    usage();
  }

  const emails: string[] = [];
  const seen = new Set<string>();
  for (const arg of raw) {
    const email = normalizeWaitlistEmail(arg);
    if (!isValidWaitlistEmail(email)) {
      console.error(`Invalid email: ${arg}`);
      process.exit(1);
    }
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  if (emails.length < 1 || emails.length > MAX) {
    usage();
  }

  console.log(`Sending seat-invite to ${emails.length}…`);
  const result = await sendSeatInviteBatch(emails);

  for (const row of result.sent) {
    console.log(`ok  ${row.email}  ${row.id}`);
    try {
      await stampInviteSent(row.email);
    } catch (error) {
      console.warn(
        `stamp skipped for ${row.email}:`,
        error instanceof Error ? error.message : "error",
      );
    }
  }

  for (const row of result.failed) {
    console.error(`fail ${row.email}  ${row.error}`);
  }

  if (result.failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
