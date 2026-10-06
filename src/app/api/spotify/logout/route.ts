import { NextResponse } from "next/server";
import { clearSpotifySessionCookie } from "@/lib/spotify/session";

export async function POST() {
  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  const res = NextResponse.redirect(base, { status: 303 });
  await clearSpotifySessionCookie(res);
  return res;
}
