import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { appendToCollectionUnique, appendToCollection, updateCollectionItem } from "./db";
import type { User, Student, Lead } from "./types";

/**
 * Generate a cryptographically secure temporary password.
 *
 * Uses crypto.randomBytes instead of Math.random() — the latter is a
 * non-cryptographic PRNG whose output is predictable given enough
 * samples (Security fix #6 from the threat model).
 *
 * base64url encoding produces URL-safe, readable-ish characters and
 * 6 random bytes → 8 characters of output.
 */
function generateTempPassword(): string {
  return crypto.randomBytes(6).toString("base64url");
}

export interface EnrollInput {
  leadId?: string; // omit for a direct enrollment not sourced from a lead
  studentName: string;
  grade: string;
  subject: string;
  tutorId: string;
  parentName: string;
  parentEmail: string;
}

/**
 * Enrolls a student by creating a parent user account and a student
 * record atomically. The email uniqueness check happens inside the
 * file lock (via appendToCollectionUnique), eliminating the TOCTOU
 * race of the old "check email → create user" two-step pattern
 * (Security fix #1 from the threat model).
 */
export async function enrollStudent(input: EnrollInput): Promise<{ tempPassword: string; studentId: string; parentId: string }> {
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // crypto.randomUUID() is a CSPRNG-backed UUID v4 — no more
  // Date.now() + Math.random() predictability.
  const parentId = `u_${crypto.randomUUID()}`;
  const studentId = `s_${crypto.randomUUID()}`;

  const newUser: User = {
    id: parentId,
    name: input.parentName,
    email: input.parentEmail,
    passwordHash,
    role: "parent",
    studentName: input.studentName,
  };

  // Atomic uniqueness check: if another request enrolled the same email
  // between our check and our write, DuplicateError is thrown — no race.
  await appendToCollectionUnique<User>(
    "users.json",
    newUser,
    (existing) => existing.email.toLowerCase() === input.parentEmail.toLowerCase(),
    "An account with that email already exists."
  );

  const newStudent: Student = {
    id: studentId,
    name: input.studentName,
    grade: input.grade,
    tutorId: input.tutorId,
    parentId,
    scores: [],
    attendance: [],
  };
  await appendToCollection<Student>("students.json", newStudent);

  if (input.leadId) {
    await updateCollectionItem<Lead>(
      "leads.json",
      (l) => l.id === input.leadId,
      (l) => ({ ...l, converted: true })
    ).catch(() => {
      // Lead may already be gone/edited — enrollment itself still succeeded,
      // so this isn't fatal, just means the lead list won't show it as converted.
    });
  }

  return { tempPassword, studentId, parentId };
}
