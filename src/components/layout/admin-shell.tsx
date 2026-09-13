"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Building2,
  Download,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/materials", label: "Materials", icon: FileText },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#0f1a14] text-white lg:flex">
      <aside className="border-b border-white/10 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="px-5 py-5">
          <p className="text-xs tracking-[0.2em] text-emerald-300">ADMIN</p>
          <p className="mt-1 font-semibold">FUNAAB Agric Student</p>
          <p className="mt-1 truncate text-xs text-white/60">{email}</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-max items-center gap-2 rounded-2xl px-3 py-2.5 text-sm",
                  active ? "bg-emerald-600 text-white" : "text-white/75 hover:bg-white/5",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link href="/dashboard" className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/5">
            Student app
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-red-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 bg-[#f3f7f4] text-ink">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
