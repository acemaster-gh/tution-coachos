import { listStudents, getStudentStatus } from "./students";
import { listUsers, readCollection, writeCollection } from "./db";
import { notifyOnStudentFlag } from "./messaging";

interface AlertState {
  studentId: string;
  reasonsKey: string; // sorted, joined reasons — used to detect "new" flags
  notifiedAt: string;
}

/**
 * Scans all students, and for anyone newly flagged (or flagged for a new
 * reason since last check) sends the parent+tutor notification and
 * records it in data/alert-state.json so the next check doesn't re-send
 * for the same unresolved issue. If a student's flag clears, their state
 * entry is dropped so a future re-flag notifies again.
 */
export async function runAlertCheck(): Promise<{ checked: number; notified: string[] }> {
  const [students, users, state] = await Promise.all([
    listStudents(),
    listUsers(),
    readCollection<AlertState>("alert-state.json"),
  ]);

  const stateMap = new Map(state.map((s) => [s.studentId, s]));
  const notified: string[] = [];
  const nextState: AlertState[] = [];

  for (const student of students) {
    const status = getStudentStatus(student);

    if (!status.flagged) {
      // Resolved — drop any stored state so a future flag re-notifies.
      continue;
    }

    const reasonsKey = [...status.reasons].sort().join("|");
    const existing = stateMap.get(student.id);

    if (existing && existing.reasonsKey === reasonsKey) {
      // Already notified for this exact set of reasons — keep as-is.
      nextState.push(existing);
      continue;
    }

    const parent = users.find((u) => u.id === student.parentId);
    const tutor = users.find((u) => u.id === student.tutorId);

    if (!parent || !tutor) {
      console.warn(
        `[alerts] skipping ${student.name} — no user record for ${!parent ? "parent" : "tutor"} ` +
        `(${!parent ? student.parentId : student.tutorId}). Will retry on next check.`
      );
      if (existing) nextState.push(existing); // don't lose prior state if it existed
      continue;
    }

    await notifyOnStudentFlag(student, status, parent.email, undefined, tutor.email);
    notified.push(student.name);
    nextState.push({ studentId: student.id, reasonsKey, notifiedAt: new Date().toISOString() });
  }

  await writeCollection("alert-state.json", nextState);
  return { checked: students.length, notified };
}
