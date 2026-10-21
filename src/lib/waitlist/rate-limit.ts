import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Friends-scale flood brake: 5 Joins per IP per 10 minutes. */
const LIMIT = 5;
const WINDOW = "10 m";

let limiter: Ratelimit | null = null;

function getRedis(): Redis {
  // Vercel Upstash integration usually sets UPSTASH_*; some setups use KV_REST_API_*.
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (url && token) {
    return new Redis({ url, token });
  }
  return Redis.fromEnv();
}

function getLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: "scrapped:waitlist",
    });
  }
  return limiter;
}

export async function limitWaitlistJoin(ip: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const result = await getLimiter().limit(ip || "unknown");
  return { success: result.success, remaining: result.remaining };
}
