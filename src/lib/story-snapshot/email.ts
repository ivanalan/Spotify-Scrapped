import "server-only";

import { Resend } from "resend";

/** Published Resend template alias (dashboard). Variable: STORY_URL */
export const STORY_LINK_TEMPLATE_ID = "story-link";

export const STORY_LINK_EMAIL_SUBJECT = "Your Scrapped story link";

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string | null {
  const from = process.env.RESEND_FROM?.trim();
  return from || null;
}

/**
 * One transactional send of the private `/s/[token]` URL.
 * Soft-fails (returns false) when Resend env or template is missing.
 */
export async function sendStoryLinkEmail(input: {
  to: string;
  storyUrl: string;
}): Promise<boolean> {
  const resend = resendClient();
  const from = fromAddress();
  if (!resend || !from) {
    console.warn("[story-snapshot] story-link email skipped: missing RESEND_*");
    return false;
  }

  const { error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: STORY_LINK_EMAIL_SUBJECT,
    template: {
      id: STORY_LINK_TEMPLATE_ID,
      variables: {
        STORY_URL: input.storyUrl,
      },
    },
  });

  if (error) {
    console.error("[story-snapshot] story-link email failed", error);
    return false;
  }
  return true;
}
