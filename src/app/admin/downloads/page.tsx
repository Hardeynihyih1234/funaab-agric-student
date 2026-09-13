import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, one } from "@/lib/utils";

export const metadata: Metadata = { title: "Downloads" };

export default async function AdminDownloadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("downloads")
    .select("id, created_at, material:materials(title, course:courses(code)), user:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Downloads</h1>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-funaab-soft text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={3}>
                  No downloads have been recorded yet.
                </td>
              </tr>
            ) : (
              (data ?? []).map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-4 py-3">{one(row.user)?.full_name || one(row.user)?.email}</td>
                  <td className="px-4 py-3">
                    {one(one(row.material)?.course)?.code} · {one(row.material)?.title}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(row.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
