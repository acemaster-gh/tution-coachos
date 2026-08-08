import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { listResources } from "@/lib/resources";
import { getStudentByParent } from "@/lib/students";
import ResourceForm from "@/components/ResourceForm";
import type { Resource } from "@/lib/types";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Content Library — ${siteConfig.instituteName}`,
};

const TYPE_META: Record<Resource["type"], { label: string; icon: string; accent: string; color: string }> = {
  notes:    { label: "Notes",        icon: "📄", accent: "rgba(37,99,235,0.08)",   color: "var(--blue)" },
  video:    { label: "Video",        icon: "🎬", accent: "rgba(193,68,45,0.08)",   color: "var(--red-pen)" },
  practice: { label: "Practice set", icon: "✏️", accent: "rgba(22,163,74,0.08)",   color: "var(--green)" },
};

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) return null;

  const allResources = await listResources();
  const canManage = session.role === "tutor" || session.role === "admin";

  let resources = allResources;
  let scopeNote = "All resources across every batch and grade.";

  if (session.role === "parent") {
    const student = await getStudentByParent(session.sub);
    if (student) {
      resources = allResources.filter((r) => r.grade === student.grade);
      scopeNote = `Showing Class ${student.grade} material, matched to ${student.name}'s grade.`;
    } else {
      resources = [];
      scopeNote = "No student on file to match materials against.";
    }
  }

  // Group by subject
  const bySubject = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    if (!acc[r.subject]) acc[r.subject] = [];
    acc[r.subject].push(r);
    return acc;
  }, {});

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <span className="section-label">institutional library</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">Content Library</h1>
        <p className="text-sm text-ink-soft mt-1">{scopeNote}</p>
      </div>

      {/* Upload form (admin/tutor only) */}
      {canManage && (
        <div
          className="rounded-xl p-6 mb-8"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="font-semibold text-ink mb-4 flex items-center gap-2">
            <span>➕</span> Add resource
          </p>
          <ResourceForm />
        </div>
      )}

      {resources.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)" }}
        >
          <p className="text-5xl mb-4" aria-hidden>📚</p>
          <p className="font-display text-xl font-semibold text-ink mb-2">Nothing here yet</p>
          <p className="text-ink-soft text-sm">
            {canManage ? "Add the first resource using the form above." : "Check back soon — your tutor will add materials here."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(bySubject).map(([subject, items]) => (
            <div key={subject}>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">{subject}</p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)" }}
              >
                {items.map((r, idx) => {
                  const meta = TYPE_META[r.type];
                  return (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors group"
                      style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: meta.accent }}
                        >
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink text-sm group-hover:text-red-pen transition-colors truncate">
                            {r.title}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">Class {r.grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                          style={{ color: meta.color, background: meta.accent, borderColor: `${meta.color}33` }}
                        >
                          {meta.label}
                        </span>
                        <svg className="w-4 h-4 text-ink-muted group-hover:text-ink-soft transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div
        className="mt-8 rounded-xl p-5 text-sm text-ink-soft"
        style={{ border: "1px dashed rgba(201,194,174,0.7)", background: "rgba(255,255,255,0.4)" }}
      >
        <p className="font-semibold text-ink mb-1 flex items-center gap-1.5">ℹ️ Why this exists</p>
        Notes, recordings, and practice sets live here — not on any one tutor&apos;s phone.
        A sub-tutor (or the whole institute) can carry on without a batch losing a week if someone leaves.
      </div>
    </div>
  );
}
