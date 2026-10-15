import { NextResponse } from "next/server";
import { fetchAndStoreScrappedApiLab } from "@/lib/load-scrapped-api-lab";
import {
  attachApiLabSnapshotCookies,
  clearApiLabSnapshotCookies,
} from "@/lib/spotify/api-lab-snapshot";

const ALLOWED_NEXT = new Set(["/", "/scrapped", "/scrapped/lab"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const raw = String(form.get("next") ?? "/");
  const next = ALLOWED_NEXT.has(raw) ? raw : "/";

  const result = await fetchAndStoreScrappedApiLab();

  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );

  if (result.kind === "ready" && result.stored) {
    const res = NextResponse.redirect(`${base}${next}`, { status: 303 });
    // Always clear first — old multi-chunk jars are what trigger HTTP 431.
    await clearApiLabSnapshotCookies(res);
    await attachApiLabSnapshotCookies(res, result.stored);
    return res;
  }

  if (result.kind === "needs_auth") {
    return NextResponse.redirect(`${base}/api/spotify/login`, { status: 303 });
  }

  const params = new URLSearchParams();
  if (result.kind === "error") {
    params.set("spotify_error", result.message.slice(0, 180));
  }
  const qs = params.toString();
  return NextResponse.redirect(`${base}${next}${qs ? `?${qs}` : ""}`, {
    status: 303,
  });
}
