import type { Metadata } from "next";
import { ReportStatusForm } from "@/app/admin/reports/report-status-form";
import { createClient } from "@/lib/supabase/server";
import { REPORT_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, one } from "@/lib/utils";
import type { ReportType } from "@/types/database";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*, user:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="mt-5 space-y-3">
        {(reports ?? []).length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            No student reports yet.
          </p>
        ) : (
          (reports ?? []).map((report) => (
            <article key={report.id} className="rounded-3xl border border-line bg-white p-5">
              <p className="text-xs text-funaab">
                {REPORT_TYPE_LABELS[report.report_type as ReportType]} · {report.status}
              </p>
              <p className="mt-2 text-sm">{report.message}</p>
              <p className="mt-2 text-xs text-muted">
                {one(report.user)?.full_name || one(report.user)?.email} · {formatDateTime(report.created_at)}
              </p>
              <div className="mt-3">
                <ReportStatusForm reportId={report.id} status={report.status} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
