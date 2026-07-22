import bcrypt from "bcryptjs";
import { appendToCollection, updateCollectionItem } from "./db";
import type { User, Student, Lead } from "./types";

function generateTempPassword(): string {
  // Readable-ish random password for a founder to hand a parent over the
  // phone — not meant to be memorable long-term, just easy to relay once.
  return Math.random().toString(36).slice(2, 10);
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

export async function enrollStudent(input: EnrollInput): Promise<{ tempPassword: string; studentId: string; parentId: string }> {
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const parentId = `u_${suffix}`;
  const studentId = `s_${suffix}`;

  const newUser: User = {
    id: parentId,
    name: input.parentName,
    email: input.parentEmail,
    passwordHash,
    role: "parent",
    studentName: input.studentName,
  };
  await appendToCollection<User>("users.json", newUser);

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
