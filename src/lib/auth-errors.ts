import { SUPABASE_MISSING_CONFIG_MESSAGE } from "@/lib/constants";

export function friendlyAuthError(message?: string | null) {
  const value = (message ?? "").toLowerCase();

  if (!value) {
    return "Something went wrong. Please check your connection and try again.";
  }
  if (value.includes("invalid login credentials") || value.includes("invalid_credentials")) {
    return "Incorrect email or password.";
  }
  if (value.includes("already registered") || value.includes("user already exists")) {
    return "An account with this email already exists.";
  }
  if (value.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (value.includes("user is banned") || value.includes("disabled")) {
    return "This account has been disabled. Contact support if you need help.";
  }
  if (value.includes("rate limit") || value.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (value.includes("network") || value.includes("fetch")) {
    return "Something went wrong. Please check your connection and try again.";
  }
  if (value.includes("provider is not enabled") || value.includes("unsupported provider")) {
    return "Google sign-in is not enabled yet. Please use email and password.";
  }
  if (value.includes("not configured")) {
    return SUPABASE_MISSING_CONFIG_MESSAGE;
  }
  if (value.includes("password")) {
    return "Please choose a stronger password of at least 8 characters.";
  }

  return "Something went wrong. Please check your connection and try again.";
}
