"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

type Status = "idle" | "submitting" | "success" | "error";

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "The enquiry couldn't be sent. Please try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-rule-line bg-paper-raised p-8 text-center">
        <p className="font-display text-2xl font-semibold">Enquiry sent.</p>
        <p className="text-ink-soft mt-2">
          Someone from {siteConfig.instituteName} will call you within one business day.
          For anything urgent, message {siteConfig.whatsapp} on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-rule-line bg-paper-raised p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-ink-soft mb-1">
            Parent name
          </label>
          <input
            id="parentName"
            name="parentName"
            required
            className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink-soft mb-1">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[6-9][0-9]{9}"
            title="10-digit Indian mobile number"
            maxLength={10}
            className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-ink-soft mb-1">
            Student&apos;s grade
          </label>
          <select
            id="grade"
            name="grade"
            required
            className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
          >
            <option value="">Select grade</option>
            {["8", "9", "10", "11", "12"].map((g) => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-ink-soft mb-1">
            Subject interested in
          </label>
          <input
            id="subject"
            name="subject"
            placeholder="e.g. Physics"
            required
            className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-red-pen text-sm" role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-sm bg-red-pen text-paper px-6 py-3 font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Book a free trial class"}
      </button>
    </form>
  );
}
