import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  SIGNUP_COLLEGES,
  SIGNUP_LEVELS,
  withSignupFallbacks,
} from "@/lib/constants";
import { getSignupOptions } from "@/lib/data/catalogue";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a FUNAAB Agric Student account for non-major course materials.",
};

export default async function SignupPage() {
  let colleges = withSignupFallbacks([], SIGNUP_COLLEGES);
  let levels = withSignupFallbacks([], SIGNUP_LEVELS);

  if (hasSupabaseConfig()) {
    try {
      const options = await getSignupOptions();
      colleges = options.colleges;
      levels = options.levels;
    } catch {
      colleges = withSignupFallbacks([], SIGNUP_COLLEGES);
      levels = withSignupFallbacks([], SIGNUP_LEVELS);
    }
  }

  return (
    <AuthShell
      backgroundSrc="/images/campus-entrance-signup.jpg"
      cornerHref="/login"
      cornerLabel="Already have an account?"
      cornerAction="Sign In"
    >
      <SignupForm colleges={colleges} levels={levels} />
    </AuthShell>
  );
}
