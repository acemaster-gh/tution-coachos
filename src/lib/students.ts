import { readCollection, updateCollectionItem } from "./db";
import type { Student, TestScore, AttendanceRecord } from "./types";

export async function listStudents(): Promise<Student[]> {
  return readCollection<Student>("students.json");
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const students = await listStudents();
  return students.find((s) => s.id === id);
}

export async function getStudentsByTutor(tutorId: string): Promise<Student[]> {
  const students = await listStudents();
  return students.filter((s) => s.tutorId === tutorId);
}

export async function getStudentByParent(parentId: string): Promise<Student | undefined> {
  const students = await listStudents();
  return students.find((s) => s.parentId === parentId);
}

export function attendancePercent(student: Student): number {
  if (student.attendance.length === 0) return 100;
  const present = student.attendance.filter((a) => a.present).length;
  return Math.round((present / student.attendance.length) * 100);
}

/**
 * Used for the illustrative chart annotation: was there ever a
 * three-test dip in this history, regardless of whether it has since
 * recovered? Scores are assumed to already be in chronological order.
 */
export function hasThreeTestDip(scores: TestScore[]): boolean {
  const pct = scores.map((s) => s.score / s.maxScore);
  for (let i = 2; i < pct.length; i++) {
    if (pct[i] < pct[i - 1] && pct[i - 1] < pct[i - 2]) return true;
  }
  return false;
}

/**
 * Used for live status: is the student CURRENTLY in a dip — i.e. are
 * the most recent three tests each lower than the one before? This is
 * what should drive a tutor's roster flag, so a recovered student
 * correctly returns to "on track" instead of staying flagged forever.
 */
export function isCurrentlyDipping(scores: TestScore[]): boolean {
  const pct = scores.map((s) => s.score / s.maxScore);
  const n = pct.length;
  if (n < 3) return false;
  return pct[n - 1] < pct[n - 2] && pct[n - 2] < pct[n - 3];
}

export interface StudentStatus {
  flagged: boolean;
  reasons: string[];
}

export function getStudentStatus(student: Student): StudentStatus {
  const reasons: string[] = [];

  if (isCurrentlyDipping(student.scores)) {
    reasons.push("three-test score dip in progress");
  }

  const attendance = attendancePercent(student);
  if (attendance < 75) {
    reasons.push(`attendance at ${attendance}%`);
  }

  return { flagged: reasons.length > 0, reasons };
}

/** Marks (or overwrites) today's attendance for a student. */
export async function markAttendance(studentId: string, present: boolean, date = new Date().toISOString().slice(0, 10)): Promise<Student> {
  return updateCollectionItem<Student>(
    "students.json",
    (s) => s.id === studentId,
    (student) => {
      const record: AttendanceRecord = { date, present };
      const existingIndex = student.attendance.findIndex((a) => a.date === date);
      const attendance = [...student.attendance];
      if (existingIndex >= 0) {
        attendance[existingIndex] = record;
      } else {
        attendance.push(record);
      }
      return { ...student, attendance };
    }
  );
}

/** Records a new test score for a student. */
export async function recordScore(studentId: string, score: TestScore): Promise<Student> {
  return updateCollectionItem<Student>(
    "students.json",
    (s) => s.id === studentId,
    (student) => ({ ...student, scores: [...student.scores, score] })
  );
}
