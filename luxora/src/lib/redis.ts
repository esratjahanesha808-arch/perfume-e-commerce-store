import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

/** True when real Upstash credentials are set (not .env placeholders). */
export const isRedisConfigured =
  redisUrl.length > 0 &&
  redisToken.length > 0 &&
  !redisUrl.includes("placeholder") &&
  !redisToken.includes("placeholder");

export const redis = isRedisConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Rate limiter: 5 auth attempts per 15 minutes per IP
export const authRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "luxora:auth",
    })
  : null;

// Rate limiter: 100 requests per minute for general API
export const apiRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "luxora:api",
    })
  : null;

// Rate limiter: write endpoints (checkout, reviews, coupon validate) — 30 / minute
export const writeRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "luxora:write",
    })
  : null;

// Rate limiter: admin write mutations — 60 / minute
export const adminRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "luxora:admin",
    })
  : null;

// Rate limiter: review helpful votes — 20 / hour per key (user or IP)
export const helpfulRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "luxora:helpful",
    })
  : null;
