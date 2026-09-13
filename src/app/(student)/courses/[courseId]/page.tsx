import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MaterialActions } from "@/components/materials/material-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById, getMaterialsForCourse } from "@/lib/data/catalogue";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatFileSize, materialTypeLabel, slugifyCode } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  return { title: course ? `${course.code} ${course.title}` : "Course" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const [materials, current] = await Promise.all([
    getMaterialsForCourse(course.id),
    getCurrentUser(),
  ]);

  let favoriteIds = new Set<string>();
  if (current && materials.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("material_id")
      .eq("user_id", current.user.id)
      .in(
        "material_id",
        materials.map((material) => material.id),
      );
    favoriteIds = new Set((data ?? []).map((row) => row.material_id));
  }

  const department = course.department as
    | { code: string; name: string; college?: { code: string } | null }
    | null;
  const collegeCode = department?.college?.code;

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/dashboard", label: "Home" },
          collegeCode
            ? { href: `/colleges/${slugifyCode(collegeCode)}`, label: collegeCode }
            : { label: "College" },
          department
            ? {
                href: collegeCode
                  ? `/colleges/${slugifyCode(collegeCode)}/departments/${slugifyCode(department.code)}`
                  : undefined,
                label: department.name,
              }
            : { label: "Department" },
          { label: course.code },
        ]}
      />
      <p className="text-sm font-semibold text-funaab">{course.code}</p>
      <h1 className="mt-1 text-3xl font-semibold">{course.title}</h1>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-3 border border-line">
          <dt className="text-muted">Department</dt>
          <dd className="font-medium">{department?.name ?? "—"}</dd>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 border border-line">
          <dt className="text-muted">Level</dt>
          <dd className="font-medium">{course.level?.name ?? "—"}</dd>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 border border-line">
          <dt className="text-muted">Semester</dt>
          <dd className="font-medium">{course.semester?.name ?? "—"}</dd>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 border border-line">
          <dt className="text-muted">Course Units</dt>
          <dd className="font-medium">{course.units ?? "Not specified"}</dd>
        </div>
      </dl>

      <h2 className="mt-8 mb-4 text-lg font-semibold">Available Materials</h2>
      {materials.length === 0 ? (
        <EmptyState
          title="No materials have been uploaded for this course yet."
          description="Check back later or report missing material from Support."
        />
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <article key={material.id} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-funaab-soft text-funaab">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-funaab">{materialTypeLabel(material.material_type)}</p>
                  <h3 className="font-semibold">{material.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {material.file_name ?? "No file yet"} · {formatFileSize(material.file_size)} ·{" "}
                    {formatDate(material.created_at)}
                  </p>
                  <div className="mt-4">
                    <MaterialActions
                      materialId={material.id}
                      hasFile={Boolean(material.file_path)}
                      initiallyFavorite={favoriteIds.has(material.id)}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
