/**
 * Token-bucket rate limiter. Each key (e.g. an IP address) gets a bucket
 * that holds up to `capacity` tokens, refilling at `refillPerSecond`
 * tokens/sec. Every request costs 1 token; if the bucket's empty, the
 * request is rejected. This is the standard primitive for "allow bursts,
 * but cap sustained rate" — a fixed-window counter would either allow a
 * burst of 2x the limit right at a window boundary, or reject bursts
 * that should be fine; token bucket avoids both failure modes.
 *
 * HONEST LIMIT: this is in-memory, per-process. It works correctly on a
 * single long-running server (or this sandbox's dev server), but:
 *   - Resets on every process restart/redeploy.
 *   - Each serverless instance gets its OWN bucket — on Vercel, N
 *     concurrent instances effectively multiply the real limit by N.
 * At real production traffic, replace the Map below with a shared store
 * (Upstash Redis's rate-limit primitives are the standard choice for
 * Vercel deployments) — the token-bucket *algorithm* stays identical,
 * only the storage backend changes.
 */

interface Bucket {
  tokens: number;
  lastRefill: number; // epoch ms
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  capacity: number;
  refillPerSecond: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: options.capacity, lastRefill: now };

  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const refilled = Math.min(options.capacity, bucket.tokens + elapsedSeconds * options.refillPerSecond);

  if (refilled < 1) {
    const secondsToOneToken = (1 - refilled) / options.refillPerSecond;
    buckets.set(key, { tokens: refilled, lastRefill: now });
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil(secondsToOneToken) };
  }

  const remaining = refilled - 1;
  buckets.set(key, { tokens: remaining, lastRefill: now });
  return { allowed: true, remaining: Math.floor(remaining), retryAfterSeconds: 0 };
}

// Periodic cleanup so the Map doesn't grow unboundedly from one-off IPs —
// a bucket that's been full (unused) for over an hour is safe to forget.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > 60 * 60 * 1000) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
