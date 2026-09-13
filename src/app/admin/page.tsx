import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, one } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [
    students,
    colleges,
    departments,
    courses,
    materials,
    downloads,
    recentMaterials,
    recentDownloads,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("colleges").select("id", { count: "exact", head: true }),
    supabase.from("departments").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("materials").select("id", { count: "exact", head: true }),
    supabase.from("downloads").select("id", { count: "exact", head: true }),
    supabase
      .from("materials")
      .select("id, title, created_at, course:courses(code)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("downloads")
      .select("id, created_at, material:materials(title)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    { label: "Students", value: students.count ?? 0 },
    { label: "Colleges", value: colleges.count ?? 0 },
    { label: "Departments", value: departments.count ?? 0 },
    { label: "Courses", value: courses.count ?? 0 },
    { label: "Materials", value: materials.count ?? 0 },
    { label: "Downloads", value: downloads.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted">Overview of the student resource platform.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-line bg-white p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-semibold">Recent uploads</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(recentMaterials.data ?? []).length === 0 ? (
              <li className="text-muted">No materials uploaded yet.</li>
            ) : (
              (recentMaterials.data ?? []).map((item) => (
                <li key={item.id}>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted">
                    {one(item.course)?.code} · {formatDateTime(item.created_at)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(recentDownloads.data ?? []).length === 0 ? (
              <li className="text-muted">No downloads yet.</li>
            ) : (
              (recentDownloads.data ?? []).map((item) => (
                <li key={item.id}>
                    <p className="font-medium">{one(item.material)?.title ?? "Material"}</p>
                  <p className="text-muted">{formatDateTime(item.created_at)}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
