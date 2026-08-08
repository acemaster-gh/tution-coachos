/**
 * Admin action audit log.
 *
 * Records who did what and when, so a compromised or malicious admin
 * session leaves a trail. This is both a feature (the admin can review
 * their team's actions) and a non-repudiation control (Security item #8).
 *
 * Writes to data/audit-log.json — same JSON-file approach as everything
 * else in this demo. In production this would be an append-only DB table
 * that no application role can DELETE from.
 */

import crypto from "node:crypto";
import { appendToCollection } from "./db";

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;        // e.g., "enroll_student", "record_score"
  target: string;        // e.g., student ID, resource ID
  detail: string;        // human-readable summary
}

/**
 * Append an audit event. Fire-and-forget — audit logging should never
 * block or fail the primary operation, so callers should `.catch()` this.
 */
export async function logAuditEvent(
  event: Omit<AuditEntry, "id" | "timestamp">
): Promise<void> {
  const entry: AuditEntry = {
    id: `audit_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...event,
  };
  await appendToCollection<AuditEntry>("audit-log.json", entry);
}
