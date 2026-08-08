"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site";

export default function Error({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 py-20 text-center">
      <div className="absolute inset-0 ruled-bg opacity-25 pointer-events-none" />
      <div className="relative z-10 max-w-md">
        <p className="font-display text-[7rem] font-bold leading-none text-rule-line select-none mb-2">500</p>
        <span className="font-marginalia text-2xl text-red-pen -rotate-2 block mb-4">something went wrong</span>
        <h1 className="font-display text-2xl font-semibold text-ink mb-3">
          An error occurred
        </h1>
        <p className="text-ink-soft text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {error.message || "Something unexpected happened. Please try again or contact the front desk if it keeps happening."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <a href="/" className="btn-outline">← Back to {siteConfig.instituteName}</a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-ink-muted font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
