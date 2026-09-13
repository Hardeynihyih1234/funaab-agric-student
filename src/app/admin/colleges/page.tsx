import type { Metadata } from "next";
import { AcademicForm } from "@/app/admin/academic-form";
import { saveCollege } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Colleges" };

export default async function AdminCollegesPage() {
  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from("colleges")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Colleges</h1>
      <AcademicForm
        action={saveCollege}
        fields={[
          { name: "code", label: "Code", placeholder: "COLANIM" },
          { name: "name", label: "Name" },
          { name: "full_name", label: "Full name" },
          { name: "description", label: "Description" },
        ]}
        submitLabel="Save college"
      />
      <div className="space-y-3">
        {(colleges ?? []).map((college) => (
          <article key={college.id} className="rounded-3xl border border-line bg-white p-5">
            <p className="text-sm font-semibold text-funaab">{college.code}</p>
            <h2 className="text-lg font-semibold">{college.full_name}</h2>
            <p className="text-sm text-muted">{college.description}</p>
            <div className="mt-4">
              <AcademicForm
                action={saveCollege}
                hidden={{ id: college.id }}
                defaults={{
                  code: college.code,
                  name: college.name,
                  full_name: college.full_name,
                  description: college.description ?? "",
                  is_active: college.is_active,
                }}
                fields={[
                  { name: "code", label: "Code" },
                  { name: "name", label: "Name" },
                  { name: "full_name", label: "Full name" },
                  { name: "description", label: "Description" },
                ]}
                submitLabel="Update"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
