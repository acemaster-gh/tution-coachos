import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Student, TestScore, AttendanceRecord } from "./types";

// ---------------------------------------------------------------------------
// Row -> domain mapping. Keeping the Student/TestScore/AttendanceRecord
// shapes exactly as they were under the JSON-file version means
// DashboardPreview, the tutor roster, the parent portal, etc. need ZERO
// changes — only this data-access layer changed.
// ---------------------------------------------------------------------------
interface StudentRow {
  id: string;
  name: string;
  grade: string;
  tutor_id: string;
  parent_id: string;
  test_scores: { subject: string; score: number; max_score: number; date: string }[];
  attendance: { date: string; present: boolean }[];
}

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    tutorId: row.tutor_id,
    parentId: row.parent_id,
    scores: (row.test_scores ?? [])
      .map((s) => ({ subject: s.subject, score: s.score, maxScore: s.max_score, date: s.date }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    attendance: (row.attendance ?? [])
      .map((a) => ({ date: a.date, present: a.present }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

const STUDENT_SELECT = "id, name, grade, tutor_id, parent_id, test_scores(subject, score, max_score, date), attendance(date, present)";

/**
 * `client` defaults to the RLS-scoped request client, which is correct
 * for any page/route with a real logged-in user. Background jobs (the
 * alert-check and reminder cron routes) have NO user session at all —
 * under RLS that means my_institute_id() returns null and every row
 * gets silently filtered out. Those callers must pass the admin client
 * explicitly instead of relying on the default.
 */
export async function listStudents(client?: SupabaseClient): Promise<Student[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("students").select(STUDENT_SELECT);
  if (error) throw new Error(`Failed to list students: ${error.message}`, { cause: error });
  return (data as unknown as StudentRow[]).map(mapStudent);
}

export async function getStudentById(id: string, client?: SupabaseClient): Promise<Student | undefined> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("students").select(STUDENT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch student ${id}: ${error.message}`, { cause: error });
  return data ? mapStudent(data as unknown as StudentRow) : undefined;
}

export async function getStudentsByTutor(tutorId: string, client?: SupabaseClient): Promise<Student[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("students").select(STUDENT_SELECT).eq("tutor_id", tutorId);
  if (error) throw new Error(`Failed to list students for tutor ${tutorId}: ${error.message}`, { cause: error });
  return (data as unknown as StudentRow[]).map(mapStudent);
}

export async function getStudentByParent(parentId: string, client?: SupabaseClient): Promise<Student | undefined> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("students").select(STUDENT_SELECT).eq("parent_id", parentId).maybeSingle();
  if (error) throw new Error(`Failed to fetch student for parent ${parentId}: ${error.message}`, { cause: error });
  return data ? mapStudent(data as unknown as StudentRow) : undefined;
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

/**
 * Marks (or overwrites) attendance for a student on a given date.
 * Relies on the RLS policy (admin, or the assigned tutor) to enforce who
 * can write this — the caller's own authenticated session is used here
 * deliberately, NOT the admin/service client, so that protection stays
 * enforced at the database layer as well as the API-route layer above it.
 */
export async function markAttendance(studentId: string, present: boolean, date = new Date().toISOString().slice(0, 10)): Promise<Student> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .upsert({ student_id: studentId, date, present }, { onConflict: "student_id,date" });
  if (error) throw new Error(`Failed to mark attendance: ${error.message}`, { cause: error });

  const updated = await getStudentById(studentId);
  if (!updated) throw new Error("Student not found after marking attendance.");
  return updated;
}

/** Records a new test score for a student. Same RLS-enforced pattern as markAttendance. */
export async function recordScore(studentId: string, score: TestScore): Promise<Student> {
  const supabase = await createClient();
  const { error } = await supabase.from("test_scores").insert({
    student_id: studentId,
    subject: score.subject,
    score: score.score,
    max_score: score.maxScore,
    date: score.date,
  });
  if (error) throw new Error(`Failed to record score: ${error.message}`, { cause: error });

  const updated = await getStudentById(studentId);
  if (!updated) throw new Error("Student not found after recording score.");
  return updated;
}
