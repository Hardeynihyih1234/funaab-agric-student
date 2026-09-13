"use client";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
export const googleAuthEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function hasBrowserSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function browserAuthRedirectUrl(next = "/dashboard", origin = "") {
  const base = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, "") || "http://localhost:3000";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/dashboard";
  const url = new URL("/auth/callback", `${base}/`);
  url.searchParams.set("next", safeNext);
  return url.toString();
}
