import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { getCollegeByCode, getDepartmentsByCollege } from "@/lib/data/catalogue";
import { slugifyCode } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ college: string }>;
}): Promise<Metadata> {
  const { college } = await params;
  const record = await getCollegeByCode(college);
  return { title: record?.code ?? "College" };
}

export default async function CollegePage({
  params,
}: {
  params: Promise<{ college: string }>;
}) {
  const { college } = await params;
  const record = await getCollegeByCode(college);
  if (!record) notFound();

  const departments = await getDepartmentsByCollege(record.id);

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/dashboard", label: "Home" },
          { label: record.code },
        ]}
      />
      <p className="text-sm font-semibold text-funaab">{record.code}</p>
      <h1 className="mt-1 text-3xl font-semibold">{record.full_name}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{record.description}</p>

      <h2 className="mt-8 mb-4 text-lg font-semibold">Departments</h2>
      {departments.length === 0 ? (
        <EmptyState title="No departments have been added yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {departments.map((department) => (
            <Link
              key={department.id}
              href={`/colleges/${slugifyCode(record.code)}/departments/${slugifyCode(department.code)}`}
              className="rounded-3xl border border-line bg-white p-5"
            >
              <p className="text-xs text-funaab">{department.code}</p>
              <h3 className="mt-1 text-lg font-semibold">{department.name}</h3>
              <p className="mt-2 text-sm text-muted">{department.full_name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
