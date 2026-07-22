"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TutorOption {
  id: string;
  name: string;
}

interface EnrollFormProps {
  leadId: string;
  parentName: string;
  grade: string;
  subject: string;
  tutors: TutorOption[];
}

export default function EnrollLeadForm({ leadId, parentName, grade, subject, tutors }: EnrollFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ tempPassword: string; parentEmail: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/admin/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, leadId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't enroll this student.");
      setResult({ tempPassword: body.tempPassword, parentEmail: String(data.parentEmail) });
      setStatus("done");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="mt-2 rounded-sm border border-rule-line bg-paper p-3 text-xs">
        <p className="font-medium text-ink">Enrolled. Share these login details with the parent:</p>
        <p className="text-ink-soft mt-1">Email: {result.parentEmail}</p>
        <p className="text-ink-soft">Temporary password: <span className="font-mono">{result.tempPassword}</span></p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-red-pen hover:underline">
        Enroll
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-sm border border-rule-line bg-paper p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input name="studentName" placeholder="Student name" required className="rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2" />
        <input name="parentName" defaultValue={parentName} placeholder="Parent name" required className="rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2" />
        <input name="parentEmail" type="email" placeholder="Parent email (becomes login)" required className="col-span-2 rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2" />
        <input name="grade" defaultValue={grade} placeholder="Grade" required className="rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2" />
        <input name="subject" defaultValue={subject} placeholder="Subject" required className="rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2" />
        <select name="tutorId" required defaultValue="" className="col-span-2 rounded-sm border border-rule-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus-visible:outline-2">
          <option value="" disabled>Assign tutor</option>
          {tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {status === "error" && <p className="text-red-pen text-xs" role="alert">{message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "submitting"} className="rounded-sm bg-red-pen text-paper px-3 py-1.5 text-xs font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60">
          {status === "submitting" ? "Enrolling…" : "Confirm enrollment"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft hover:text-ink transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
