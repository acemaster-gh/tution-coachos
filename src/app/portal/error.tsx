"use client";

import { useEffect } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16 px-6 text-center max-w-md mx-auto">
      <div
        className="rounded-2xl p-10"
        style={{ background: "var(--paper-card)", border: "1px solid rgba(193,68,45,0.2)", boxShadow: "var(--shadow-md)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
          style={{ background: "var(--red-pen-bg)" }}
        >
          ⚠️
        </div>
        <p className="font-display text-xl font-semibold text-ink mb-2">Something went wrong</p>
        <p className="text-sm text-ink-soft leading-relaxed mb-6">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary text-sm py-2.5 px-5">
            Try again
          </button>
          <a href="/portal" className="btn-outline text-sm py-2.5 px-5">
            Dashboard
          </a>
        </div>
        {error.digest && (
          <p className="mt-5 text-xs text-ink-muted font-mono">ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
