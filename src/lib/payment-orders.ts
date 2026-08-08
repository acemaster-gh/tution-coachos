/**
 * In-memory tracker for pending Razorpay orders.
 *
 * Prevents the "spam the Pay button" problem (Security item #9) — if an
 * order is already pending for a given feeId, the existing order is
 * returned instead of creating a duplicate.
 *
 * Entries auto-expire after 30 minutes (Razorpay orders expire too).
 *
 * NOT suitable for multi-instance deployments — same caveat as the
 * rate limiter.
 */

interface PendingOrder {
  orderId: string;
  keyId: string;
  order: unknown;
  createdAt: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const store = new Map<string, PendingOrder>();

// Prune expired entries periodically
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(key);
  }
}

/**
 * Check if there's an existing pending order for the given feeId.
 * Returns the cached order data if so, or null if no pending order exists.
 */
export function getPendingOrder(feeId: string): PendingOrder | null {
  pruneIfNeeded();
  const entry = store.get(feeId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(feeId);
    return null;
  }
  return entry;
}

/**
 * Record that a Razorpay order has been created for a fee.
 */
export function setPendingOrder(feeId: string, orderId: string, keyId: string, order: unknown): void {
  store.set(feeId, { orderId, keyId, order, createdAt: Date.now() });
}

/**
 * Clear the pending order for a fee (e.g., after successful payment).
 */
export function clearPendingOrder(feeId: string): void {
  store.delete(feeId);
}
