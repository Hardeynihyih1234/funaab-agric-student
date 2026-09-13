"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField } from "@/components/auth/password-field";
import { friendlyAuthError } from "@/lib/auth-errors";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import {
  authRedirectUrl,
  isGoogleAuthEnabled,
  SUPABASE_MISSING_CONFIG_MESSAGE,
} from "@/lib/supabase/env";
import { isValidEmail } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const callbackError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(
    callbackError === "config"
      ? SUPABASE_MISSING_CONFIG_MESSAGE
      : callbackError === "auth"
        ? "Sign-in could not be completed. Please try again."
        : callbackError === "disabled"
          ? "This account has been disabled. Contact support if you need help."
          : "",
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (!hasSupabaseConfig()) {
      setError(SUPABASE_MISSING_CONFIG_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(friendlyAuthError(signInError.message));
        return;
      }

      if (!remember) {
        window.sessionStorage.setItem("funaab-remember", "0");
      }

      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!hasSupabaseConfig()) {
      setError(SUPABASE_MISSING_CONFIG_MESSAGE);
      return;
    }
    if (!isGoogleAuthEnabled()) {
      setError("Google sign-in is not enabled yet. Please use email and password.");
      return;
    }
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: authRedirectUrl(next.startsWith("/") ? next : "/dashboard", window.location.origin),
        },
      });
      if (oauthError) {
        setError(friendlyAuthError(oauthError.message));
        setGoogleLoading(false);
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="text-center">
        <h1 className="text-[1.85rem] font-semibold leading-tight text-ink">
          Welcome Back
        </h1>
        <p className="mt-1 text-[17px] text-ink">Login to your account</p>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-5 text-muted">
          Access course materials, notes and resources for non-major courses.
        </p>
      </div>

      {!hasSupabaseConfig() || error === SUPABASE_MISSING_CONFIG_MESSAGE ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
          role="status"
        >
          {SUPABASE_MISSING_CONFIG_MESSAGE}
        </p>
      ) : error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <label className="block" htmlFor="email">
        <span className="sr-only">Email Address</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-full border border-[#d9e0dc] bg-white pl-11 pr-4 text-sm text-ink placeholder:text-zinc-400"
          />
        </span>
      </label>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      <div className="flex items-center justify-between px-1 text-sm">
        <label className="flex items-center gap-2 text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-line text-funaab accent-funaab"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-ink underline-offset-2 hover:underline">
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading || googleLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-funaab text-sm font-semibold text-white transition hover:bg-funaab-dark disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Login"}
        <span aria-hidden>→</span>
      </button>

      <div className="flex items-center gap-3 pt-1 text-[11px] tracking-[0.2em] text-zinc-400">
        <span className="h-px flex-1 bg-[#e4e8e5]" />
        OR
        <span className="h-px flex-1 bg-[#e4e8e5]" />
      </div>

      <GoogleButton
        label="Continue with Google"
        onClick={signInWithGoogle}
        loading={googleLoading}
        disabled={loading}
      />
    </form>
  );
}
