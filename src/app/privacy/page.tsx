import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/signup" className="text-sm font-medium text-funaab">
        Back
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>
          We collect your name, email, college, level, and optional profile photo
          so we can personalize your dashboard and keep your favorites, downloads,
          and recently viewed materials.
        </p>
        <p>
          Passwords are handled by Supabase Auth and are never stored in readable
          form in this application. Administrators cannot view your password.
        </p>
        <p>
          Download history and reports are stored so the platform can improve
          material coverage. We do not sell student data.
        </p>
      </div>
    </main>
  );
}
