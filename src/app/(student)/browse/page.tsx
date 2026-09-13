import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getColleges, getDepartmentsByCollege, getLevels, getSemesters } from "@/lib/data/catalogue";
import { createClient } from "@/lib/supabase/server";
import { materialTypeLabel, one, slugifyCode } from "@/lib/utils";
import type { MaterialType } from "@/types/database";

export const metadata: Metadata = { title: "Browse" };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    college?: string;
    department?: string;
    level?: string;
    semester?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const [colleges, levels, semesters] = await Promise.all([
    getColleges(),
    getLevels(),
    getSemesters(),
  ]);

  const selectedCollege = colleges.find(
    (college) => slugifyCode(college.code) === slugifyCode(params.college ?? ""),
  );
  const departments = selectedCollege
    ? await getDepartmentsByCollege(selectedCollege.id)
    : [];
  const selectedDepartment = departments.find(
    (department) => slugifyCode(department.code) === slugifyCode(params.department ?? ""),
  );

  const supabase = await createClient();
  let query = supabase
    .from("materials")
    .select(
      "id, title, material_type, created_at, file_path, course:courses!inner(id, code, title, department_id, level_id, semester_id, department:departments!inner(id, college_id, code))",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(40);

  if (selectedDepartment) {
    query = query.eq("course.department_id", selectedDepartment.id);
  } else if (selectedCollege) {
    query = query.eq("course.department.college_id", selectedCollege.id);
  }
  if (params.level) {
    const level = levels.find((item) => item.code === params.level);
    if (level) query = query.eq("course.level_id", level.id);
  }
  if (params.semester) {
    const semester = semesters.find((item) => item.code === params.semester);
    if (semester) query = query.eq("course.semester_id", semester.id);
  }
  if (params.type) {
    query = query.eq("material_type", params.type);
  }

  const { data: materials } = await query;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Browse</h1>
      <p className="mt-2 text-sm text-muted">
        Filter materials by college, department, level, semester and type.
      </p>

      <form className="mt-5 grid gap-3 rounded-3xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect label="College" name="college" value={params.college} options={colleges.map((item) => ({ value: slugifyCode(item.code), label: item.code }))} />
        <FilterSelect
          label="Department"
          name="department"
          value={params.department}
          options={departments.map((item) => ({ value: slugifyCode(item.code), label: item.name }))}
        />
        <FilterSelect label="Level" name="level" value={params.level} options={levels.map((item) => ({ value: item.code, label: item.name }))} />
        <FilterSelect label="Semester" name="semester" value={params.semester} options={semesters.map((item) => ({ value: item.code, label: item.name }))} />
        <FilterSelect
          label="Material type"
          name="type"
          value={params.type}
          options={(
            ["lecture_note", "handout", "past_question", "assignment", "course_outline", "other"] as MaterialType[]
          ).map((type) => ({ value: type, label: materialTypeLabel(type) }))}
        />
        <button className="h-12 self-end rounded-full bg-funaab text-sm font-semibold text-white" type="submit">
          Apply filters
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {(materials ?? []).length === 0 ? (
          <EmptyState
            title="No materials match these filters."
            description="Course information not yet added, or PDFs have not been uploaded yet."
            action={
              <Link href="/browse" className="text-sm font-medium text-funaab">
                Clear filters
              </Link>
            }
          />
        ) : (
          (materials ?? []).map((material) => (
            <Link
              key={material.id}
              href={`/materials/${material.id}`}
              className="block rounded-3xl border border-line bg-white p-5"
            >
              <p className="text-xs text-funaab">{one(material.course)?.code}</p>
              <h2 className="mt-1 font-semibold">{material.title}</h2>
              <p className="text-sm text-muted">
                {materialTypeLabel(material.material_type as MaterialType)} ·{" "}
                {material.file_path ? "PDF available" : "Material not uploaded yet"}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-12 w-full rounded-2xl border border-line bg-white px-3"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
