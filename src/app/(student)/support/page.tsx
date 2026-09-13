import type { Metadata } from "next";
import { SupportForm } from "@/app/(student)/support/support-form";
import { REPORT_TYPE_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Support</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Report missing or incorrect course materials. This is a student resource
        platform, not the official FUNAAB helpdesk.
      </p>
      <div className="mt-5 rounded-3xl border border-line bg-white p-5 text-sm">
        <p className="text-muted">Contact email placeholder</p>
        <p className="font-medium">support@example.com</p>
      </div>
      <div className="mt-4 rounded-3xl border border-line bg-white p-5">
        <SupportForm
          types={Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
    </div>
  );
}
