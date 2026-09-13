"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Mail, User } from "lucide-react";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField } from "@/components/auth/password-field";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  NON_MAJOR_NOTICE,
  SIGNUP_COLLEGES,
  SIGNUP_LEVELS,
  withSignupFallbacks,
  type SignupOption,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  authRedirectUrl,
  hasSupabaseConfig,
  isGoogleAuthEnabled,
  SUPABASE_MISSING_CONFIG_MESSAGE,
} from "@/lib/supabase/env";
import { isValidEmail, passwordStrength } from "@/lib/utils";

export function SignupForm({
  colleges,
  levels,
}: {
  colleges: SignupOption[];
  levels: SignupOption[];
}) {
  const levelOptions = withSignupFallbacks(levels, SIGNUP_LEVELS);
  const collegeOptions = withSignupFallbacks(colleges, SIGNUP_COLLEGES);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [levelId, setLevelId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = passwordStrength(password);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!strength.checks.length || !strength.checks.letter || !strength.checks.number) {
      setError("Password must be at least 8 characters and include letters and numbers.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!levelId) {
      setError("Please select your level.");
      return;
    }
    if (!collegeId) {
      setError("Please select your college.");
      return;
    }
    if (!hasSupabaseConfig()) {
      setError(SUPABASE_MISSING_CONFIG_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const selectedCollege = collegeOptions.find((college) => college.id === collegeId);
      const selectedLevel = levelOptions.find((level) => level.id === levelId);
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            college_id: collegeId,
            level_id: levelId,
            college_code: selectedCollege?.code,
            level_code: selectedLevel?.code,
          },
          emailRedirectTo: authRedirectUrl("/dashboard", window.location.origin),
        },
      });

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess("Account created. Check your email to confirm your address, then sign in.");
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
          redirectTo: authRedirectUrl("/dashboard", window.location.origin),
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
    <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
      <div className="text-center">
        <h1 className="text-[1.7rem] font-semibold leading-tight text-ink">
          Create Your Account
        </h1>
        <p className="mt-2 text-[15px] font-medium text-ink">{NON_MAJOR_NOTICE}</p>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-5 text-muted">
          Sign up to access course materials, notes and resources for non-major courses.
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
      {success ? (
        <p className="rounded-2xl bg-funaab-soft px-4 py-3 text-center text-sm text-funaab-dark" role="status">
          {success}
        </p>
      ) : null}

      <label className="block" htmlFor="fullName">
        <span className="sr-only">Full Name</span>
        <span className="relative block">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-12 w-full rounded-full border border-[#d9e0dc] bg-white pl-11 pr-4 text-sm text-ink placeholder:text-zinc-400"
          />
        </span>
      </label>

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
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        showStrength
        strengthLabel={strength.label}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm Password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <label className="block" htmlFor="level">
        <span className="sr-only">Level</span>
        <span className="relative block">
          <GraduationCap className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <select
            id="level"
            name="level"
            value={levelId}
            onChange={(event) => setLevelId(event.target.value)}
            className="h-12 w-full appearance-none rounded-full border border-[#d9e0dc] bg-white pl-11 pr-10 text-sm text-ink"
          >
            <option value="">Level (e.g. 100 Level)</option>
            {levelOptions.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className="block" htmlFor="college">
        <span className="sr-only">College</span>
        <span className="relative block">
          <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <select
            id="college"
            name="college"
            value={collegeId}
            onChange={(event) => setCollegeId(event.target.value)}
            className="h-12 w-full appearance-none rounded-full border border-[#d9e0dc] bg-white pl-11 pr-10 text-sm text-ink"
          >
            <option value="">College</option>
            {collegeOptions.map((college) => (
              <option key={college.id} value={college.id}>
                {college.code}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || googleLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-funaab text-sm font-semibold text-white transition hover:bg-funaab-dark disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create Account"}
        <span aria-hidden>→</span>
      </button>

      <p className="px-2 text-center text-[11px] leading-5 text-muted">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="font-medium text-funaab underline-offset-2 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-funaab underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center gap-3 pt-1 text-[11px] tracking-[0.2em] text-zinc-400">
        <span className="h-px flex-1 bg-[#e4e8e5]" />
        OR
        <span className="h-px flex-1 bg-[#e4e8e5]" />
      </div>

      <GoogleButton
        label="Sign up with Google"
        onClick={signInWithGoogle}
        loading={googleLoading}
        disabled={loading}
      />
    </form>
  );
}
