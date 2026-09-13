const PLACEHOLDER_MARKERS = [
  "your-project",
  "your-anon",
  "your_supabase",
  "your-supabase",
  "replace-me",
  "replace_me",
  "paste_project_url",
  "paste_public_key",
];

/**
 * Next.js only inlines NEXT_PUBLIC_* values into the browser bundle when they
 * are accessed as static property names (process.env.NEXT_PUBLIC_FOO).
 * Dynamic lookups like process.env[name] stay empty on the client.
 */
function readPublic(value: string | undefined) {
  return value?.trim() ?? "";
}

function looksLikePlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

export function getSupabaseUrl() {
  return readPublic(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return readPublic(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getAppUrl(fallbackOrigin?: string) {
  const fromEnv = readPublic(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function isGoogleAuthEnabled() {
  return readPublic(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED).toLowerCase() === "true";
}

function isUsableUrl(value: string) {
  if (!value || looksLikePlaceholder(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isUsableAnonKey(value: string) {
  return value.length >= 20 && !looksLikePlaceholder(value);
}

export function hasSupabaseConfig() {
  return isUsableUrl(getSupabaseUrl()) && isUsableAnonKey(getSupabaseAnonKey());
}

export const SUPABASE_MISSING_CONFIG_MESSAGE =
  "Signup and sign-in need your Supabase Project URL and public/anon key. Put them in .env.local as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart npm run dev.";

export function getPublicSupabaseConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!isUsableUrl(url) || !isUsableAnonKey(anonKey)) {
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
