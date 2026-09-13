import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

function weekAgoIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const weekAgo = weekAgoIso();

  const [users, newUsers, downloads, downloadRows] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("downloads").select("id", { count: "exact", head: true }),
    supabase
      .from("downloads")
      .select("material:materials(id, title, course:courses(id, code, department_id, level_id, department:departments(name)))"),
  ]);

  const materialCounts = new Map<string, { title: string; count: number }>();
  const courseCounts = new Map<string, { code: string; count: number }>();
  const levelCounts = new Map<string, number>();
  const deptCounts = new Map<string, number>();

  (downloadRows.data ?? []).forEach((row) => {
    const material = one(row.material);
    if (!material) return;
    materialCounts.set(material.id, {
      title: material.title,
      count: (materialCounts.get(material.id)?.count ?? 0) + 1,
    });
    const course = one(material.course);
    if (course) {
      courseCounts.set(course.id, {
        code: course.code,
        count: (courseCounts.get(course.id)?.count ?? 0) + 1,
      });
      if (course.level_id) {
        levelCounts.set(course.level_id, (levelCounts.get(course.level_id) ?? 0) + 1);
      }
      const deptName = one(course.department)?.name;
      if (deptName) {
        deptCounts.set(deptName, (deptCounts.get(deptName) ?? 0) + 1);
      }
    }
  });

  const topMaterials = [...materialCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topCourses = [...courseCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topDepartments = [...deptCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Based only on real registered users and downloads.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Total users" value={users.count ?? 0} />
        <Stat label="New users (7 days)" value={newUsers.count ?? 0} />
        <Stat label="Total downloads" value={downloads.count ?? 0} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarList title="Most downloaded materials" items={topMaterials.map((item) => ({ label: item.title, value: item.count }))} />
        <BarList title="Most downloaded courses" items={topCourses.map((item) => ({ label: item.code, value: item.count }))} />
        <BarList title="Most accessed departments" items={topDepartments.map(([label, value]) => ({ label, value }))} />
        <BarList
          title="Most active levels"
          items={[...levelCounts.entries()].map(([label, value]) => ({ label, value }))}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function BarList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-funaab-soft">
                <div
                  className="h-2 rounded-full bg-funaab"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
