import type { Metadata } from "next";
import { MaterialAdminForm } from "@/app/admin/materials/material-admin-form";
import { MaterialDeleteButton } from "@/app/admin/materials/material-delete-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatFileSize, materialTypeLabel, one } from "@/lib/utils";

export const metadata: Metadata = { title: "Materials" };

export default async function AdminMaterialsPage() {
  const supabase = await createClient();
  const [{ data: materials }, { data: courses }, { data: downloads }] = await Promise.all([
    supabase
      .from("materials")
      .select("*, course:courses(code, title)")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("id, code, title").order("code"),
    supabase.from("downloads").select("material_id"),
  ]);

  const counts = new Map<string, number>();
  (downloads ?? []).forEach((row) => {
    counts.set(row.material_id, (counts.get(row.material_id) ?? 0) + 1);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">PDF materials</h1>
      <MaterialAdminForm
        courses={(courses ?? []).map((course) => ({
          id: course.id,
          label: `${course.code} · ${course.title}`,
        }))}
      />
      <div className="space-y-3">
        {(materials ?? []).length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            Material not uploaded yet. Use the form above to add real PDFs.
          </p>
        ) : (
          (materials ?? []).map((material) => (
            <article key={material.id} className="rounded-3xl border border-line bg-white p-5">
              <p className="text-xs text-funaab">
                {one(material.course)?.code} · {materialTypeLabel(material.material_type)}
              </p>
              <h2 className="font-semibold">{material.title}</h2>
              <p className="text-sm text-muted">
                {material.file_name ?? "No file"} · {formatFileSize(material.file_size)} ·{" "}
                {formatDate(material.created_at)} · {counts.get(material.id) ?? 0} downloads
              </p>
              <div className="mt-3">
                <MaterialDeleteButton materialId={material.id} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
