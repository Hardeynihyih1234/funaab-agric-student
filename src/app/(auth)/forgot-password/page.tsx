"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { friendlyAuthError } from "@/lib/auth-errors";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { authRedirectUrl } from "@/lib/supabase/env";
import { isValidEmail } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!hasSupabaseConfig()) {
      setError("Supabase is not configured yet. Add your environment variables to continue.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authRedirectUrl("/reset-password", window.location.origin),
      });
      if (resetError) {
        setError(friendlyAuthError(resetError.message));
        return;
      }
      setSuccess("If an account exists for this email, a reset link has been sent.");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      backgroundSrc="/images/campus-entrance.jpg"
      cornerHref="/login"
      cornerLabel="Remember your password?"
      cornerAction="Sign In"
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="text-center">
          <h1 className="text-[1.7rem] font-semibold text-ink">Forgot Password</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter your email and we will send a reset link if an account exists.
          </p>
        </div>
        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</p>
        ) : null}
        {success ? (
          <p className="rounded-2xl bg-funaab-soft px-4 py-3 text-center text-sm text-funaab-dark">
            {success}
          </p>
        ) : null}
        <label className="block" htmlFor="email">
          <span className="sr-only">Email Address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-full border border-[#d9e0dc] bg-white pl-11 pr-4 text-sm"
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
