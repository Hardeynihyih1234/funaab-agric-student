import type { Metadata } from "next";
import { AcademicForm } from "@/app/admin/academic-form";
import { saveDepartment } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Departments" };

export default async function AdminDepartmentsPage() {
  const supabase = await createClient();
  const [{ data: departments }, { data: colleges }] = await Promise.all([
    supabase
      .from("departments")
      .select("*, college:colleges(code)")
      .order("sort_order"),
    supabase.from("colleges").select("id, code").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Departments</h1>
      <AcademicForm
        action={saveDepartment}
        fields={[
          { name: "college_id", label: "College" },
          { name: "code", label: "Code", placeholder: "ANN" },
          { name: "name", label: "Name" },
          { name: "full_name", label: "Full name" },
        ]}
        options={{
          college_id: (colleges ?? []).map((college) => ({
            value: college.id,
            label: college.code,
          })),
        }}
        submitLabel="Create department"
      />
      <div className="space-y-3">
        {(departments ?? []).map((department) => (
          <article key={department.id} className="rounded-3xl border border-line bg-white p-5">
            <p className="text-xs text-funaab">{one(department.college)?.code}</p>
            <h2 className="text-lg font-semibold">
              {department.code} · {department.name}
            </h2>
          </article>
        ))}
      </div>
    </div>
  );
}
