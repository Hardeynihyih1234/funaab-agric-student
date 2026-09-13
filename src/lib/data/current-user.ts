import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ProfileWithRelations } from "@/types/database";

export type AuthState =
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "disabled"; user: User }
  | { status: "database_error"; user: User; message: string }
  | { status: "no_profile"; user: User; message: string }
  | {
      status: "ok";
      user: User;
      profile: ProfileWithRelations;
    };

function databaseSetupMessage(errorMessage?: string | null) {
  const value = (errorMessage ?? "").toLowerCase();
  if (
    value.includes("does not exist") ||
    value.includes("schema cache") ||
    value.includes("could not find the table")
  ) {
    return "The database tables have not been created yet. In the Supabase SQL editor, run supabase/schema.sql, then rls.sql, seed.sql, and storage.sql.";
  }
  if (value.includes("row-level security") || value.includes("permission denied")) {
    return "Your account does not have permission to load this data. Confirm Row Level Security policies from supabase/rls.sql are applied.";
  }
  return "We could not load your student profile from the database. Please try again.";
}

async function loadProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, college:colleges(*), level:levels(*)")
    .eq("id", userId)
    .maybeSingle();

  return { profile: data as ProfileWithRelations | null, error };
}

async function tryCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
) {
  const metadata = user.user_metadata ?? {};
  const collegeRef = String(metadata.college_code ?? metadata.college_id ?? "").trim();
  const levelRef = String(metadata.level_code ?? metadata.level_id ?? "").trim();

  let collegeId: string | null = null;
  let levelId: string | null = null;

  const looksLikeId = /^[0-9a-f-]{36}$/i.test(collegeRef);
  if (collegeRef) {
    const query = supabase.from("colleges").select("id");
    const { data } = looksLikeId
      ? await query.eq("id", collegeRef).maybeSingle()
      : await query.ilike("code", collegeRef).maybeSingle();
    collegeId = data?.id ?? null;
  }

  const levelLooksLikeId = /^[0-9a-f-]{36}$/i.test(levelRef);
  if (levelRef) {
    const query = supabase.from("levels").select("id");
    const { data } = levelLooksLikeId
      ? await query.eq("id", levelRef).maybeSingle()
      : await query.ilike("code", levelRef).maybeSingle();
    levelId = data?.id ?? null;
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: String(metadata.full_name ?? metadata.name ?? "").trim(),
    email: user.email ?? "",
    college_id: collegeId,
    level_id: levelId,
    status: "active",
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return { profile: null, error };
  }

  return loadProfile(supabase, user.id);
}

export async function getAuthState(): Promise<AuthState> {
  if (!hasSupabaseConfig()) {
    return { status: "unconfigured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const firstLoad = await loadProfile(supabase, user.id);
  if (firstLoad.error) {
    return {
      status: "database_error",
      user,
      message: databaseSetupMessage(firstLoad.error.message),
    };
  }

  let profile = firstLoad.profile;
  if (!profile) {
    const created = await tryCreateProfile(supabase, user);
    if (created.error) {
      return {
        status: "no_profile",
        user,
        message: databaseSetupMessage(created.error.message),
      };
    }
    profile = created.profile;
  }

  if (!profile) {
    return {
      status: "no_profile",
      user,
      message:
        "Your account exists, but a student profile has not been created yet. Run supabase/schema.sql so the profile trigger can run, then sign out and sign in again.",
    };
  }

  if (profile.status === "disabled") {
    return { status: "disabled", user };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    status: "ok",
    user,
    profile: {
      ...profile,
      is_admin: Boolean(admin),
    },
  };
}

export async function getCurrentUser() {
  const state = await getAuthState();
  if (state.status !== "ok") return null;
  return { user: state.user, profile: state.profile };
}

export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("UNAUTHENTICATED");
  }
  return current;
}

export async function requireAdmin() {
  const current = await requireUser();
  if (!current.profile.is_admin) {
    throw new Error("FORBIDDEN");
  }
  return current;
}
