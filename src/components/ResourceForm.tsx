"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResourceForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't add that resource.");
      e.currentTarget.reset();
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-rule-line bg-paper-raised p-5 space-y-3 mb-8">
      <p className="font-medium text-ink">Add to the library</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="title" placeholder="Title" required className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2" />
        <input name="subject" placeholder="Subject" required className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2" />
        <select name="grade" required defaultValue="" className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2">
          <option value="" disabled>Grade</option>
          {["8", "9", "10", "11", "12"].map((g) => <option key={g} value={g}>Class {g}</option>)}
        </select>
        <select name="type" required defaultValue="" className="rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2">
          <option value="" disabled>Type</option>
          <option value="notes">Notes</option>
          <option value="video">Video</option>
          <option value="practice">Practice set</option>
        </select>
        <input name="url" type="url" placeholder="Link (PDF, video, etc.)" required className="sm:col-span-2 rounded-sm border border-rule-line bg-paper px-3 py-2 text-sm outline-none focus-visible:outline-2" />
      </div>
      {status === "error" && <p className="text-red-pen text-sm" role="alert">{message}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-sm bg-red-pen text-paper px-5 py-2 text-sm font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add resource"}
      </button>
    </form>
  );
}
