"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Shared email + password form for /login and /signup.
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setNotice(
            "Account created. Check your email to confirm it, then sign in.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-amber-500/60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
          Agent HQ
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          {mode === "login" ? "Welcome back." : "Create your HQ."}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {mode === "login"
            ? "Sign in to enter your office."
            : "Your office, your APIs, your data — nobody else can see it."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputCls}
            autoComplete="email"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputCls}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-amber-400">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {busy
              ? "Working…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-white underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-white underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
