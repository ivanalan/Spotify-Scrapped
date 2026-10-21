import { NextRequest, NextResponse } from "next/server";
import {
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
} from "@/lib/waitlist/email";
import { insertWaitlistEmail } from "@/lib/waitlist/db";
import { limitWaitlistJoin } from "@/lib/waitlist/rate-limit";

const BODY_MAX_BYTES = 2_048;

/** Same success shape whether new or duplicate — avoid email enumeration. */
function ok() {
  return NextResponse.json({ ok: true });
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > BODY_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const emailRaw = (body as { email?: unknown }).email;
  if (typeof emailRaw !== "string") {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const email = normalizeWaitlistEmail(emailRaw);
  if (!isValidWaitlistEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const { success } = await limitWaitlistJoin(clientIp(req));
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 },
      );
    }

    await insertWaitlistEmail(email);
    return ok();
  } catch (error) {
    console.error("[waitlist] join failed", error instanceof Error ? error.name : "error");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
