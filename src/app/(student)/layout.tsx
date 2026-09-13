import { redirect } from "next/navigation";
import { AccountStatusScreen } from "@/components/layout/account-status-screen";
import { StudentShell } from "@/components/layout/student-shell";
import { getAuthState } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await getAuthState();

  if (state.status === "unconfigured" || state.status === "unauthenticated") {
    redirect("/login");
  }

  if (state.status === "disabled") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?error=disabled");
  }

  if (state.status === "database_error") {
    return (
      <AccountStatusScreen
        title="Dashboard could not finish loading"
        description={state.message}
      />
    );
  }

  if (state.status === "no_profile") {
    return (
      <AccountStatusScreen
        title="Your profile is not ready yet"
        description={state.message}
      />
    );
  }

  return <StudentShell profile={state.profile}>{children}</StudentShell>;
}
