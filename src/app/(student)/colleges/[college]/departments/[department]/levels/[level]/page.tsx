import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCollegeByCode,
  getCoursesForDepartmentLevel,
  getDepartmentByCode,
  getLevelByCode,
  getSemesters,
} from "@/lib/data/catalogue";
import { slugifyCode } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  return { title: `${level} Level` };
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ college: string; department: string; level: string }>;
}) {
  const { college, department, level } = await params;
  const collegeRecord = await getCollegeByCode(college);
  if (!collegeRecord) notFound();
  const departmentRecord = await getDepartmentByCode(collegeRecord.id, department);
  if (!departmentRecord) notFound();
  const levelRecord = await getLevelByCode(level);
  if (!levelRecord) notFound();

  const [semesters, courses] = await Promise.all([
    getSemesters(),
    getCoursesForDepartmentLevel(departmentRecord.id, levelRecord.id),
  ]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/dashboard", label: "Home" },
          { href: `/colleges/${slugifyCode(collegeRecord.code)}`, label: collegeRecord.code },
          {
            href: `/colleges/${slugifyCode(collegeRecord.code)}/departments/${slugifyCode(departmentRecord.code)}`,
            label: departmentRecord.name,
          },
          { label: levelRecord.name },
        ]}
      />
      <h1 className="text-3xl font-semibold">{levelRecord.name}</h1>
      {levelRecord.is_farm_practical ? (
        <p className="mt-3 rounded-3xl bg-funaab-soft px-4 py-3 text-sm text-funaab-dark">
          400 Level may use the Farm Practical Year / COBFAS structure rather than
          ordinary classroom courses. Only supplied course records are shown.
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        {semesters.map((semester) => {
          const semesterCourses = courses.filter(
            (course) => course.semester_id === semester.id,
          );
          return (
            <section key={semester.id}>
              <h2 className="mb-4 text-lg font-semibold">{semester.name}</h2>
              {semesterCourses.length === 0 ? (
                <EmptyState
                  title="Course information not yet added"
                  description="No courses have been added for this semester. An administrator can add them later."
                />
              ) : (
                <div className="grid gap-3">
                  {semesterCourses.map((course) => (
                    <article
                      key={course.id}
                      className="rounded-3xl border border-line bg-white p-5"
                    >
                      <p className="text-sm font-semibold text-funaab">{course.code}</p>
                      <h3 className="mt-1 text-lg font-semibold">{course.title}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {course.units ? `${course.units} units` : "Units not specified"} ·{" "}
                        {course.material_count
                          ? `${course.material_count} materials`
                          : "No materials yet"}
                      </p>
                      <Link
                        href={`/courses/${course.id}`}
                        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-funaab px-4 text-sm font-semibold text-white"
                      >
                        Open Course
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
