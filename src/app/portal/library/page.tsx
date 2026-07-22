import { getSession } from "@/lib/session";
import { listResources } from "@/lib/resources";
import { getStudentByParent } from "@/lib/students";
import ResourceForm from "@/components/ResourceForm";
import type { Resource } from "@/lib/types";

const TYPE_LABEL: Record<Resource["type"], string> = {
  notes: "Notes",
  video: "Video",
  practice: "Practice set",
};

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) return null; // proxy already guards this route

  const allResources = await listResources();
  const canManage = session.role === "tutor" || session.role === "admin";

  let resources = allResources;
  let scopeNote = "Showing every resource across all batches.";

  if (session.role === "parent") {
    const student = await getStudentByParent(session.sub);
    if (student) {
      resources = allResources.filter((r) => r.grade === student.grade);
      scopeNote = `Showing material for Class ${student.grade}, matching ${student.name}'s grade.`;
    } else {
      resources = [];
      scopeNote = "No student on file to match materials against.";
    }
  }

  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">institutional library</p>
      <h1 className="font-display text-3xl font-semibold mb-2">Content Library</h1>
      <p className="text-sm text-ink-soft mb-8">{scopeNote}</p>

      {canManage && <ResourceForm />}

      {resources.length === 0 ? (
        <p className="text-ink-soft">Nothing here yet.</p>
      ) : (
        <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors"
            >
              <div>
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-sm text-ink-soft">{r.subject} · Class {r.grade}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft border border-rule-line rounded-sm px-2 py-1">
                {TYPE_LABEL[r.type]}
              </span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        This is the institutional-IP piece from the pitch: notes, recordings,
        and practice sets live here rather than with any one tutor, so a
        sub-tutor (or the whole institute) can carry on without a batch
        losing a week if someone leaves.
      </div>
    </div>
  );
}
