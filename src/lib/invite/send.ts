import { Resend, type CreateBatchEmailOptions } from "resend";

/** Published Resend template alias (dashboard). */
export const SEAT_INVITE_TEMPLATE_ID = "seat-invite";

export const INVITE_EMAIL_SUBJECT = "You’re off the Scrapped waitlist";

const MAX_BATCH = 5;

function resendClient(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(key);
}

function fromAddress(): string {
  const from = process.env.RESEND_FROM?.trim();
  if (!from) {
    throw new Error("Missing RESEND_FROM");
  }
  return from;
}

export type InviteSendOk = { email: string; id: string };
export type InviteSendFail = { email: string; error: string };

export type InviteBatchResult = {
  sent: InviteSendOk[];
  failed: InviteSendFail[];
};

function batchIds(
  data: unknown,
): Array<{ id: string } | null | undefined> {
  if (Array.isArray(data)) {
    return data as Array<{ id: string }>;
  }
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: Array<{ id: string }> }).data;
  }
  return [];
}

/**
 * Send seat invites via Resend template `seat-invite` (1–5 addresses).
 * One message per recipient (not a shared To list).
 */
export async function sendSeatInviteBatch(
  emails: string[],
): Promise<InviteBatchResult> {
  if (emails.length < 1 || emails.length > MAX_BATCH) {
    throw new Error(`Invite batch must be 1–${MAX_BATCH} emails`);
  }

  const resend = resendClient();
  const from = fromAddress();
  const payload: CreateBatchEmailOptions[] = emails.map((to) => ({
    from,
    to: [to],
    subject: INVITE_EMAIL_SUBJECT,
    template: { id: SEAT_INVITE_TEMPLATE_ID },
  }));

  const { data, error } = await resend.batch.send(payload);

  if (error) {
    return {
      sent: [],
      failed: emails.map((email) => ({
        email,
        error: error.message || "send_failed",
      })),
    };
  }

  const rows = batchIds(data);
  const sent: InviteSendOk[] = [];
  const failed: InviteSendFail[] = [];

  emails.forEach((email, index) => {
    const id = rows[index]?.id;
    if (id) {
      sent.push({ email, id });
    } else {
      failed.push({ email, error: "send_failed" });
    }
  });

  return { sent, failed };
}
