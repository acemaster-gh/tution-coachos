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
      <div
        className="rounded-2xl p-10 text-center animate-scale-in"
        style={{
          background: "var(--paper-card)",
          border: "1px solid rgba(22,163,74,0.25)",
          boxShadow: "0 0 40px rgba(22,163,74,0.08), var(--shadow-md)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{
            background: "linear-gradient(135deg, var(--green), #34d399)",
            boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
          }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-display text-2xl font-semibold text-ink mb-2">
          Enquiry sent!
        </p>
        <p className="text-ink-soft max-w-sm mx-auto leading-relaxed">
          Someone from {siteConfig.instituteName} will call you within one business day.
          For anything urgent, WhatsApp us at{" "}
          <a
            href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
            className="text-red-pen underline"
          >
            {siteConfig.whatsapp}
          </a>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-8 space-y-5"
      style={{
        background: "var(--paper-card)",
        border: "1px solid rgba(201,194,174,0.5)",
        boxShadow: "var(--shadow-md)",
      }}
      noValidate
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-ink-soft mb-1.5">
            Parent name <span className="text-red-pen">*</span>
          </label>
          <input
            id="parentName"
            name="parentName"
            required
            placeholder="e.g. Priya Sharma"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink-soft mb-1.5">
            Phone number <span className="text-red-pen">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-ink-soft mb-1.5">
            Student&apos;s grade <span className="text-red-pen">*</span>
          </label>
          <select id="grade" name="grade" required className="input-field">
            <option value="">Select grade</option>
            {["8", "9", "10", "11", "12"].map((g) => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-ink-soft mb-1.5">
            Subject interested in <span className="text-red-pen">*</span>
          </label>
          <input
            id="subject"
            name="subject"
            placeholder="e.g. Physics, Chemistry…"
            required
            className="input-field"
          />
        </div>
      </div>

      {status === "error" && (
        <div
          className="flex items-start gap-2.5 text-sm p-3 rounded-lg animate-scale-in"
          role="alert"
          style={{ color: "var(--red-pen)", background: "var(--red-pen-bg)", border: "1px solid rgba(193,68,45,0.2)" }}
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        id="lead-form-submit"
        disabled={status === "submitting"}
        className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Book a free trial class
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <span className="text-green">✓</span> Free 2-week trial
        </span>
        <span className="w-px h-3 bg-rule-line" />
        <span className="flex items-center gap-1">
          <span className="text-green">✓</span> No commitment
        </span>
        <span className="w-px h-3 bg-rule-line" />
        <span className="flex items-center gap-1">
          <span className="text-green">✓</span> Call within 24 hrs
        </span>
      </div>
    </form>
  );
}
