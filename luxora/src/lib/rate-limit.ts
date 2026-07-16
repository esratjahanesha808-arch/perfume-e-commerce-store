import type { Ratelimit } from "@upstash/ratelimit";
import { apiError } from "@/lib/api-response";
import { redis } from "@/lib/redis";

type MemoryEntry = { timestamps: number[] };

/** Process-local fallback when Upstash Redis is not configured (dev / single instance). */
const memoryBuckets = new Map<string, MemoryEntry>();

/** Process-local once-keys for helpful-vote dedupe when Redis is unavailable. */
const memoryOnceKeys = new Set<string>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  return request.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

function memoryAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryBuckets.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= limit) {
    memoryBuckets.set(key, entry);
    return false;
  }
  entry.timestamps.push(now);
  memoryBuckets.set(key, entry);
  return true;
}

type EnforceOptions = {
  /** Upstash limiter when Redis is configured; null uses in-memory fallback. */
  limiter: Ratelimit | null;
  key: string;
  /** Fallback limit when Redis is unavailable. */
  fallbackLimit: number;
  /** Fallback window in ms when Redis is unavailable. */
  fallbackWindowMs: number;
  message?: string;
};

/**
 * Returns a 429 response when limited, otherwise null (request may proceed).
 * Always enforces a limit — Redis when available, in-memory otherwise.
 */
export async function enforceRateLimit(
  options: EnforceOptions
): Promise<ReturnType<typeof apiError> | null> {
  const {
    limiter,
    key,
    fallbackLimit,
    fallbackWindowMs,
    message = "Too many requests. Please try again later.",
  } = options;

  if (limiter) {
    const { success } = await limiter.limit(key);
    if (!success) {
      return apiError("RATE_LIMITED", message, 429);
    }
    return null;
  }

  if (!memoryAllow(key, fallbackLimit, fallbackWindowMs)) {
    return apiError("RATE_LIMITED", message, 429);
  }
  return null;
}

/**
 * Claim a one-time action key (e.g. helpful vote per user+review).
 * Returns true if newly claimed, false if already claimed.
 */
export async function claimOnceKey(key: string): Promise<boolean> {
  if (redis) {
    const result = await redis.set(key, "1", { nx: true });
    return result === "OK";
  }

  if (memoryOnceKeys.has(key)) {
    return false;
  }
  memoryOnceKeys.add(key);
  return true;
}

/** Release a once-key after a failed mutation so the user can retry. */
export async function releaseOnceKey(key: string): Promise<void> {
  if (redis) {
    await redis.del(key);
    return;
  }
  memoryOnceKeys.delete(key);
}
