"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScoreEntryForm({ studentId, defaultSubject }: { studentId: string; defaultSubject?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`/api/students/${studentId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject,
          score: Number(data.score),
          maxScore: Number(data.maxScore),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't record that score.");
      form.reset();
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-medium text-ink">Record a test score</p>
      <div className="grid grid-cols-3 gap-2">
        <input
          name="subject"
          placeholder="Subject"
          defaultValue={defaultSubject}
          required
          className="col-span-3 sm:col-span-1 rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2"
        />
        <input
          name="score"
          type="number"
          min="0"
          placeholder="Score"
          required
          className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2"
        />
        <input
          name="maxScore"
          type="number"
          min="1"
          placeholder="Out of"
          defaultValue={100}
          required
          className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2"
        />
      </div>
      {status === "error" && <p className="text-red-pen text-sm" role="alert">{message}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-sm bg-red-pen text-paper px-5 py-2 text-sm font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Add score"}
      </button>
    </form>
  );
}
