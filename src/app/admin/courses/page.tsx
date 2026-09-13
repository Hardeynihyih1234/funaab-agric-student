import type { Metadata } from "next";
import { AcademicForm } from "@/app/admin/academic-form";
import { saveCourse } from "@/app/admin/actions";
import { CourseDeleteButton } from "@/app/admin/courses/course-delete-button";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  let courseQuery = supabase
    .from("courses")
    .select("*, department:departments(code, name), level:levels(name), semester:semesters(name)")
    .order("code");
  if (q.trim()) {
    const like = `%${q.trim()}%`;
    courseQuery = courseQuery.or(`code.ilike.${like},title.ilike.${like}`);
  }

  const [{ data: courses }, { data: departments }, { data: levels }, { data: semesters }] =
    await Promise.all([
      courseQuery,
      supabase.from("departments").select("id, code, name").order("code"),
      supabase.from("levels").select("id, name").order("sort_order"),
      supabase.from("semesters").select("id, name").order("sort_order"),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Courses</h1>
      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search courses"
          className="h-12 w-full rounded-2xl border border-line bg-white px-4"
        />
      </form>
      <AcademicForm
        action={saveCourse}
        fields={[
          { name: "code", label: "Course code", placeholder: "ANN 501" },
          { name: "title", label: "Course title" },
          { name: "department_id", label: "Department" },
          { name: "level_id", label: "Level" },
          { name: "semester_id", label: "Semester" },
          { name: "units", label: "Units", type: "number" },
          { name: "description", label: "Description" },
        ]}
        options={{
          department_id: (departments ?? []).map((item) => ({
            value: item.id,
            label: `${item.code} · ${item.name}`,
          })),
          level_id: (levels ?? []).map((item) => ({ value: item.id, label: item.name })),
          semester_id: (semesters ?? []).map((item) => ({ value: item.id, label: item.name })),
        }}
        submitLabel="Create course"
      />
      <div className="space-y-3">
        {(courses ?? []).length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            Course information not yet added. Create courses from verified academic records only.
          </p>
        ) : (
          (courses ?? []).map((course) => (
            <article key={course.id} className="rounded-3xl border border-line bg-white p-5">
              <p className="text-sm font-semibold text-funaab">{course.code}</p>
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-muted">
                {one(course.department)?.name} · {one(course.level)?.name} · {one(course.semester)?.name}
              </p>
              <div className="mt-4">
                <CourseDeleteButton courseId={course.id} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
