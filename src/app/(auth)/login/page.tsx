import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to access FUNAAB non-major course materials.",
};

export default function LoginPage() {
  return (
    <AuthShell
      backgroundSrc="/images/campus-entrance-login.jpg"
      cornerHref="/signup"
      cornerLabel="Don't have an account?"
      cornerAction="Sign Up"
    >
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-3xl bg-funaab-soft" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
