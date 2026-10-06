import { NextResponse } from "next/server";
import { clearApiLabSnapshotCookies } from "@/lib/spotify/api-lab-snapshot";
import { clearSpotifySessionCookie } from "@/lib/spotify/session";

export async function POST() {
  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  const res = NextResponse.redirect(base, { status: 303 });
  await clearSpotifySessionCookie(res);
  await clearApiLabSnapshotCookies(res);
  return res;
}
