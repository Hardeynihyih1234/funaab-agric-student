"use client";

import { updateReportStatus } from "@/app/admin/actions";
import { useToast } from "@/components/ui/toast";

export function ReportStatusForm({
  reportId,
  status,
}: {
  reportId: string;
  status: "open" | "reviewed" | "resolved";
}) {
  const { toast } = useToast();

  async function change(next: "open" | "reviewed" | "resolved") {
    const result = await updateReportStatus(reportId, next);
    if (result.error) toast(result.error, "error");
    else toast("Report updated.", "success");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(["open", "reviewed", "resolved"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => change(value)}
          className={`rounded-full px-3 py-1 text-xs ${
            status === value ? "bg-funaab text-white" : "border border-line"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
