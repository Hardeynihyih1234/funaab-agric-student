"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Download,
  Home,
  LogOut,
  Menu,
  Search,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { FunaabCrest } from "@/components/brand/funaab-crest";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import type { ProfileWithRelations } from "@/types/database";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/favorites", label: "Favorites", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function StudentShell({
  profile,
  children,
}: {
  profile: ProfileWithRelations;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#f3f8f4]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FunaabCrest size={34} className="mx-0" />
            <span className="hidden text-sm font-semibold tracking-wide text-funaab sm:block">
              FUNAAB Agric Student
            </span>
          </Link>
          <form action="/search" className="relative mx-auto hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              name="q"
              placeholder="Search courses, departments, materials..."
              className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm"
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setNoticeOpen((value) => !value)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href="/profile"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-funaab text-xs font-semibold text-white sm:flex"
              aria-label="Profile"
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                initials(profile.full_name)
              )}
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {noticeOpen ? (
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-3 rounded-3xl border border-line bg-white p-5 text-sm text-muted shadow-sm">
            No notifications yet.
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden">
          <aside className="absolute right-0 top-0 flex h-full w-80 flex-col bg-white p-5">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="mb-6 self-end"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <p className="font-semibold">{profile.full_name || "Student"}</p>
              <p className="text-sm text-muted">{profile.email}</p>
            </div>
            <nav className="space-y-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-funaab-soft"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/downloads"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-funaab-soft"
              >
                <Download className="h-4 w-4" />
                Downloads
              </Link>
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-funaab-soft"
              >
                Support
              </Link>
              {profile.is_admin ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-funaab-soft"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        <aside className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-56 shrink-0 py-6 lg:block">
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                    active ? "bg-funaab text-white" : "text-ink hover:bg-white",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/downloads"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                pathname.startsWith("/downloads")
                  ? "bg-funaab text-white"
                  : "text-ink hover:bg-white",
              )}
            >
              <Download className="h-4 w-4" />
              Downloads
            </Link>
            <Link
              href="/support"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                pathname.startsWith("/support")
                  ? "bg-funaab text-white"
                  : "text-ink hover:bg-white",
              )}
            >
              Support
            </Link>
            {profile.is_admin ? (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-ink hover:bg-white"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>
        <div className="min-w-0 flex-1 pb-8 pt-5 safe-bottom lg:pb-10 lg:pt-6">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
                    active ? "text-funaab" : "text-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
