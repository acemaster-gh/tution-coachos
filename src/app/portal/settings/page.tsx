"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function SettingsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form            = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword     = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setErrorMessage("New passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setStatus("error");
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to change password.");
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function EyeIcon({ open }: { open: boolean }) {
    return open ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }

  function PasswordField({
    id, label, show, onToggle,
  }: { id: string; label: string; show: boolean; onToggle: () => void }) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-ink-soft mb-1.5">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={id}
            type={show ? "text" : "password"}
            required
            minLength={id !== "currentPassword" ? 6 : undefined}
            autoComplete={id === "currentPassword" ? "current-password" : "new-password"}
            className="input-field pr-10"
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
            aria-label={show ? "Hide" : "Show"}
          >
            <EyeIcon open={show} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <span className="section-label">account</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">Settings</h1>
      </div>

      <div className="max-w-md space-y-6">
        {/* Password card */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(27,36,48,0.06)" }}
            >
              🔒
            </div>
            <div>
              <h2 className="font-semibold text-ink">Change password</h2>
              <p className="text-xs text-ink-muted">Update your portal login password.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="currentPassword"
              label="Current password"
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <PasswordField
              id="newPassword"
              label="New password"
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />

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

            {status === "success" && (
              <div
                className="flex items-start gap-2.5 text-sm p-3 rounded-lg animate-scale-in"
                style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid rgba(22,163,74,0.2)" }}
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Password updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating…
                </>
              ) : (
                "Update password →"
              )}
            </button>
          </form>
        </div>

        {/* Info note */}
        <div
          className="rounded-xl p-5 text-sm text-ink-soft"
          style={{ border: "1px dashed rgba(201,194,174,0.7)", background: "rgba(255,255,255,0.4)" }}
        >
          <p className="font-semibold text-ink mb-1 flex items-center gap-1.5">ℹ️ About passwords</p>
          Passwords are securely hashed with bcrypt. The admin can generate new temporary passwords
          during enrollment — ask parents to change theirs after first login.
        </div>
      </div>
    </div>
  );
}
