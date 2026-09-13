import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser } from "@/lib/data/current-user";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (!current.profile.is_admin) redirect("/dashboard");

  return <AdminShell email={current.profile.email}>{children}</AdminShell>;
}
