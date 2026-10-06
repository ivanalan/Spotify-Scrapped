import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import type { NextResponse } from "next/server";

export const SPOTIFY_SESSION_COOKIE = "spotify_session";

export type SpotifySession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  displayName?: string | null;
  userId?: string;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: (process.env.AUTH_URL ?? "").startsWith("https://"),
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for Spotify session cookies");
  }
  return createHash("sha256").update(secret).digest();
}

export async function sealSession(session: SpotifySession): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(secretKey());
}

export async function unsealSession(token: string): Promise<SpotifySession | null> {
  try {
    const { payload } = await jwtDecrypt(token, secretKey());
    if (
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresAt,
      displayName:
        typeof payload.displayName === "string" || payload.displayName === null
          ? (payload.displayName as string | null)
          : undefined,
      userId: typeof payload.userId === "string" ? payload.userId : undefined,
    };
  } catch {
    return null;
  }
}

/** Attach session cookie to a redirect/response (required in Route Handlers). */
export async function attachSpotifySessionCookie(
  response: NextResponse,
  session: SpotifySession,
): Promise<void> {
  const value = await sealSession(session);
  response.cookies.set(SPOTIFY_SESSION_COOKIE, value, cookieOptions);
}

export async function clearSpotifySessionCookie(response?: NextResponse): Promise<void> {
  if (response) {
    response.cookies.delete(SPOTIFY_SESSION_COOKIE);
    return;
  }
  const jar = await cookies();
  jar.delete(SPOTIFY_SESSION_COOKIE);
}

export async function readSpotifySession(): Promise<SpotifySession | null> {
  const jar = await cookies();
  const raw = jar.get(SPOTIFY_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return unsealSession(raw);
}

/** Persist a refreshed session during a Server Component / Route Handler read path. */
export async function setSpotifySessionCookie(session: SpotifySession): Promise<void> {
  const jar = await cookies();
  const value = await sealSession(session);
  jar.set(SPOTIFY_SESSION_COOKIE, value, cookieOptions);
}
