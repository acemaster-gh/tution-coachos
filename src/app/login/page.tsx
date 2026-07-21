"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/portal";

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Couldn't sign in.");
      }
      router.push(next.startsWith("/portal") && next !== "/portal" ? next : `/portal/${body.role}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-marginalia text-2xl text-red-pen -rotate-1 mb-1">welcome back</p>
        <h1 className="font-display text-3xl font-semibold mb-6">{siteConfig.instituteName} Portal</h1>

        <form onSubmit={handleSubmit} className="rounded-sm border border-rule-line bg-paper-raised p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-sm border border-rule-line bg-paper px-3 py-2 outline-none focus-visible:outline-2"
            />
          </div>

          {status === "error" && <p className="text-red-pen text-sm" role="alert">{errorMessage}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-sm bg-red-pen text-paper px-6 py-3 font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60"
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-ink-soft">
          <p className="font-medium text-ink mb-1">Demo accounts (seeded):</p>
          <ul className="space-y-0.5">
            <li>admin@ascentlearning.example / demo1234</li>
            <li>tutor@ascentlearning.example / demo1234</li>
            <li>parent@ascentlearning.example / demo1234</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
