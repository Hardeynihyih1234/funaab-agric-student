import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { searchCatalogue } from "@/lib/data/catalogue";
import { one, slugifyCode } from "@/lib/utils";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchCatalogue(q) : null;
  const empty =
    results &&
    results.colleges.length === 0 &&
    results.departments.length === 0 &&
    results.courses.length === 0 &&
    results.materials.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Search</h1>
      <form className="mt-4">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="ANN 501, Animal Nutrition, COLANIM..."
          className="h-12 w-full rounded-full border border-line bg-white px-5 text-sm"
        />
      </form>

      {!q.trim() ? (
        <p className="mt-6 text-sm text-muted">
          Search course codes, titles, departments, colleges and material titles.
        </p>
      ) : empty ? (
        <div className="mt-6">
          <EmptyState title="No results found." description={`Nothing matched “${q}”.`} />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <ResultGroup title="Colleges">
            {results?.colleges.map((college) => (
              <Link
                key={college.id}
                href={`/colleges/${slugifyCode(college.code)}`}
                className="block rounded-3xl border border-line bg-white p-4"
              >
                <p className="font-semibold">{college.code}</p>
                <p className="text-sm text-muted">{college.full_name}</p>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title="Departments">
            {results?.departments.map((department) => (
              <Link
                key={department.id}
                href={
                  one(department.college)
                    ? `/colleges/${slugifyCode(one(department.college)!.code)}/departments/${slugifyCode(department.code)}`
                    : "/browse"
                }
                className="block rounded-3xl border border-line bg-white p-4"
              >
                <p className="font-semibold">{department.name}</p>
                <p className="text-sm text-muted">{department.code}</p>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title="Courses">
            {results?.courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block rounded-3xl border border-line bg-white p-4"
              >
                <p className="text-xs text-funaab">{course.code}</p>
                <p className="font-semibold">{course.title}</p>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title="Materials">
            {results?.materials.map((material) => (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="block rounded-3xl border border-line bg-white p-4"
              >
                <p className="font-semibold">{material.title}</p>
                <p className="text-sm text-muted">{one(material.course)?.code}</p>
              </Link>
            ))}
          </ResultGroup>
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
