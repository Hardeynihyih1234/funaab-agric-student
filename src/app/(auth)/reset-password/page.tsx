"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { friendlyAuthError } from "@/lib/auth-errors";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { passwordStrength } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(password);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!strength.checks.length || !strength.checks.letter || !strength.checks.number) {
      setError("Password must be at least 8 characters and include letters and numbers.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!hasSupabaseConfig()) {
      setError("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(friendlyAuthError(updateError.message));
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
      cornerLabel="Back to"
      cornerAction="Sign In"
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="text-center">
          <h1 className="text-[1.7rem] font-semibold text-ink">Reset Password</h1>
          <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>
        </div>
        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</p>
        ) : null}
        <PasswordField
          id="password"
          name="password"
          label="New password"
          placeholder="New password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          showStrength
          strengthLabel={strength.label}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
