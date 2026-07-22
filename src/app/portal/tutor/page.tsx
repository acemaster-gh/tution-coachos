import { getSession } from "@/lib/session";
import { getStudentsByTutor, getStudentStatus, attendancePercent } from "@/lib/students";

export default async function TutorPortal() {
  const session = await getSession();
  const students = session ? await getStudentsByTutor(session.sub) : [];

  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">your batches</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Student roster</h1>

      {students.length === 0 ? (
        <p className="text-ink-soft">No students assigned to you yet.</p>
      ) : (
        <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
          {students.map((s) => {
            const status = getStudentStatus(s);
            const latestSubject = s.scores.at(-1)?.subject ?? "—";
            return (
              <a
                key={s.id}
                href={`/portal/tutor/student/${s.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors"
              >
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-sm text-ink-soft">Class {s.grade} · {latestSubject} · {attendancePercent(s)}% attendance</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-semibold uppercase tracking-wide border rounded-sm px-2 py-1 ${
                      status.flagged ? "text-red-pen border-red-pen/40" : "text-ink-soft border-rule-line"
                    }`}
                  >
                    {status.flagged ? "Needs attention" : "On track"}
                  </span>
                  {status.flagged && (
                    <p className="text-xs text-ink-soft mt-1">{status.reasons.join(", ")}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        Live roster, computed from data/students.json. A student is flagged
        automatically when their score drops across three consecutive tests,
        or their attendance falls below 75%.
      </div>
    </div>
  );
}
