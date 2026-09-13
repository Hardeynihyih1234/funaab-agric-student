import type { Metadata } from "next";
import { StudentStatusButton } from "@/app/admin/students/student-status-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate, one } from "@/lib/utils";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, status, created_at, college:colleges(code), level:levels(name)")
    .order("created_at", { ascending: false });

  if (q.trim()) {
    const like = `%${q.trim()}%`;
    query = query.or(`full_name.ilike.${like},email.ilike.${like}`);
  }
  if (status) query = query.eq("status", status);

  const { data: students } = await query;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Students</h1>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="h-12 flex-1 rounded-2xl border border-line bg-white px-4"
        />
        <select name="status" defaultValue={status} className="h-12 rounded-2xl border border-line bg-white px-4">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <button className="h-12 rounded-full bg-funaab px-5 text-sm font-semibold text-white">
          Filter
        </button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-funaab-soft text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">College</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((student) => (
              <tr key={student.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{student.full_name || "—"}</td>
                <td className="px-4 py-3">{student.email}</td>
                <td className="px-4 py-3">{one(student.college)?.code ?? "—"}</td>
                <td className="px-4 py-3">{one(student.level)?.name ?? "—"}</td>
                <td className="px-4 py-3">{formatDate(student.created_at)}</td>
                <td className="px-4 py-3">
                  <StudentStatusButton userId={student.id} status={student.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
