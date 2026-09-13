import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";

export { hasSupabaseConfig } from "@/lib/supabase/env";

export function createClient() {
  const config = getPublicSupabaseConfig();

  if (!config) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(config.url, config.anonKey);
}
