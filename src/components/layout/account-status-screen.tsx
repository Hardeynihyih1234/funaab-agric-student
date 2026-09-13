"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountStatusScreen({
  title,
  description,
  actionHref = "/login",
  actionLabel = "Back to login",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function goToLogin() {
    if (pending) return;
    setPending(true);

    const destination = actionHref || "/login";

    try {
      if (destination === "/login") {
        const supabase = createClient();
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((resolve) => {
            window.setTimeout(resolve, 1500);
          }),
        ]);
      }
    } catch {
      // Continue to login even if sign-out is slow or fails.
    }

    router.replace(destination);
    window.location.replace(destination);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f3f8f4] px-4">
      <div className="w-full max-w-md rounded-[1.6rem] border border-line bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        <button
          type="button"
          onClick={goToLogin}
          disabled={pending}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-funaab px-5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {pending ? "Opening login..." : actionLabel}
        </button>
      </div>
    </main>
  );
}
