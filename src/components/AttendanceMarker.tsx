"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AttendanceMarker({ studentId, todayRecord }: { studentId: string; todayRecord?: { present: boolean } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function mark(present: boolean) {
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch(`/api/students/${studentId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ present }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't mark attendance.");
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div>
      <p className="font-medium text-ink mb-2">Today&apos;s attendance</p>
      <div className="flex gap-2">
        <button
          onClick={() => mark(true)}
          disabled={status === "submitting"}
          className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            todayRecord?.present === true
              ? "bg-ink text-paper border-ink"
              : "border-rule-line hover:bg-paper"
          }`}
        >
          Present
        </button>
        <button
          onClick={() => mark(false)}
          disabled={status === "submitting"}
          className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            todayRecord?.present === false
              ? "bg-red-pen text-paper border-red-pen"
              : "border-rule-line hover:bg-paper"
          }`}
        >
          Absent
        </button>
      </div>
      {status === "error" && <p className="text-red-pen text-sm mt-2" role="alert">{message}</p>}
    </div>
  );
}
