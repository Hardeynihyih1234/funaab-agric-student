import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/signup" className="text-sm font-medium text-funaab">
        Back
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>
          FUNAAB Agric Student is a student-built academic resource platform for
          non-major course materials. It is not an official portal of the Federal
          University of Agriculture, Abeokuta.
        </p>
        <p>
          You agree to use this platform only for lawful educational purposes, to
          respect copyright in uploaded materials, and not to share accounts or
          attempt to access admin features without authorization.
        </p>
        <p>
          Materials are contributed for learning support. Availability is not
          guaranteed and content may be incomplete until an administrator uploads
          it.
        </p>
      </div>
    </main>
  );
}
