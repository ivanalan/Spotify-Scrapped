import { NextResponse } from "next/server";
import { clearApiLabSnapshotCookies } from "@/lib/spotify/api-lab-snapshot";

/** One-shot recovery from HTTP 431 caused by oversized Lab snapshot cookies. */
export async function GET() {
  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );
  const res = NextResponse.redirect(`${base}/scrapped/lab`, { status: 303 });
  await clearApiLabSnapshotCookies(res);
  return res;
}
