/** Shared waitlist email checks (client UX + server authority). */

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWaitlistEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidWaitlistEmail(value: string): boolean {
  if (!value || value.length > EMAIL_MAX) return false;
  return EMAIL_RE.test(value);
}
