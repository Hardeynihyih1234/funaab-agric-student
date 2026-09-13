import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  getCollegeByCode,
  getDepartmentByCode,
  getLevels,
} from "@/lib/data/catalogue";
import { slugifyCode } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ college: string; department: string }>;
}): Promise<Metadata> {
  const { department } = await params;
  return { title: department.toUpperCase() };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ college: string; department: string }>;
}) {
  const { college, department } = await params;
  const collegeRecord = await getCollegeByCode(college);
  if (!collegeRecord) notFound();
  const departmentRecord = await getDepartmentByCode(collegeRecord.id, department);
  if (!departmentRecord) notFound();
  const levels = await getLevels();

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/dashboard", label: "Home" },
          { href: `/colleges/${slugifyCode(collegeRecord.code)}`, label: collegeRecord.code },
          { label: departmentRecord.name },
        ]}
      />
      <p className="text-sm font-semibold text-funaab">{departmentRecord.code}</p>
      <h1 className="mt-1 text-3xl font-semibold">{departmentRecord.full_name}</h1>
      <p className="mt-2 text-sm text-muted">{collegeRecord.full_name}</p>

      <h2 className="mt-8 mb-4 text-lg font-semibold">Available levels</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Link
            key={level.id}
            href={`/colleges/${slugifyCode(collegeRecord.code)}/departments/${slugifyCode(departmentRecord.code)}/levels/${level.code}`}
            className="rounded-3xl border border-line bg-white p-5"
          >
            <h3 className="text-xl font-semibold">{level.name}</h3>
            {level.is_farm_practical ? (
              <p className="mt-2 text-sm text-muted">
                Farm Practical Year / COBFAS structure may apply at this level.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Open semester courses for this level.</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
