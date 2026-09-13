function normalizePublicEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "").trim();
}

export function getSupabaseUrl() {
  return normalizePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return normalizePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getAppUrl(fallbackOrigin?: string) {
  const fromEnv = normalizePublicEnv(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function isGoogleAuthEnabled() {
  return normalizePublicEnv(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED).toLowerCase() === "true";
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export { SUPABASE_MISSING_CONFIG_MESSAGE } from "@/lib/constants";

export function getPublicSupabaseConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

export function safeNextPath(next?: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/dashboard";
  }
  return next;
}

export function authRedirectUrl(next = "/dashboard", fallbackOrigin?: string) {
  const url = new URL("/auth/callback", `${getAppUrl(fallbackOrigin)}/`);
  url.searchParams.set("next", safeNextPath(next));
  return url.toString();
}
