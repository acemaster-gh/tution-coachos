/**
 * In-memory sliding window rate limiter.
 *
 * NOT suitable for multi-instance deployments (use Redis there). This is
 * correct for a single-process Next.js server and keeps the dependency
 * footprint zero.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 5 minutes to avoid unbounded memory growth
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneIfNeeded(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  const cutoff = now - windowMs * 2; // keep a 2x buffer before pruning
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check whether the given `key` (typically an IP or email) is allowed to
 * perform an action. Returns `allowed: false` if the limit is exceeded.
 *
 * @param key       Unique identifier for the client (IP address, email, etc.)
 * @param maxHits   Maximum number of requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  maxHits: number,
  windowMs: number
): RateLimitResult {
  pruneIfNeeded(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Drop timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxHits) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxHits - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract a best-effort client IP from the request headers.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  // Standard forwarded header (set by most reverse proxies)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

// ── Login-specific rate limiting ─────────────────────────────────────────

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60 * 1000; // 1 minute

export function checkLoginRate(ip: string): RateLimitResult {
  return rateLimit(`login:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
}

// ── Lead form rate limiting ──────────────────────────────────────────────

const LEAD_MAX_SUBMISSIONS = 3;
const LEAD_WINDOW_MS = 60 * 1000; // 1 minute

export function checkLeadRate(ip: string): RateLimitResult {
  return rateLimit(`lead:${ip}`, LEAD_MAX_SUBMISSIONS, LEAD_WINDOW_MS);
}

// ── Account lockout tracking ─────────────────────────────────────────────

const LOCKOUT_MAX_FAILURES = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15-minute lockout window

/**
 * Track a failed login attempt against a specific email address.
 * Returns whether the account is now locked.
 */
export function trackFailedLogin(email: string): { locked: boolean; retryAfterSeconds: number } {
  const key = `lockout:${email.toLowerCase()}`;
  const result = rateLimit(key, LOCKOUT_MAX_FAILURES, LOCKOUT_WINDOW_MS);
  if (!result.allowed) {
    return { locked: true, retryAfterSeconds: result.retryAfterSeconds };
  }
  return { locked: false, retryAfterSeconds: 0 };
}

/**
 * Check if an email is currently locked out (without consuming an attempt).
 */
export function isAccountLocked(email: string): { locked: boolean; retryAfterSeconds: number } {
  const key = `lockout:${email.toLowerCase()}`;
  const entry = store.get(key);
  if (!entry) return { locked: false, retryAfterSeconds: 0 };

  const now = Date.now();
  const cutoff = now - LOCKOUT_WINDOW_MS;
  const recentFailures = entry.timestamps.filter((t) => t > cutoff);

  if (recentFailures.length >= LOCKOUT_MAX_FAILURES) {
    const oldestInWindow = recentFailures[0];
    const retryAfterMs = oldestInWindow + LOCKOUT_WINDOW_MS - now;
    return { locked: true, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  return { locked: false, retryAfterSeconds: 0 };
}
