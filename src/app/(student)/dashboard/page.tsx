import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bookmark, Clock3, GraduationCap, Landmark } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCollegesWithCounts } from "@/lib/data/catalogue";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { RECENT_VIEWS_LIMIT } from "@/lib/constants";
import { formatDate, one, slugifyCode, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const current = await getCurrentUser();
  if (!current) {
    return (
      <EmptyState
        title="You need to sign in"
        description="Your session is missing. Return to login to continue."
      />
    );
  }

  const supabase = await createClient();
  const firstName = current.profile.full_name.split(" ")[0] || "Student";

  let colleges: Awaited<ReturnType<typeof getCollegesWithCounts>> = [];
  let catalogueError = "";
  try {
    colleges = await getCollegesWithCounts();
  } catch {
    catalogueError =
      "College data could not be loaded. If this continues, run the SQL setup files in your Supabase project.";
  }

  const [{ data: recent }, { data: favorites }, { data: popular }] = await Promise.all([
    supabase
      .from("recent_views")
      .select("viewed_at, material:materials(id, title, course:courses(code, title))")
      .eq("user_id", current.user.id)
      .order("viewed_at", { ascending: false })
      .limit(RECENT_VIEWS_LIMIT),
    supabase
      .from("favorites")
      .select("created_at, material:materials(id, title, course:courses(code))")
      .eq("user_id", current.user.id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("downloads")
      .select("material_id, material:materials(id, title, course:courses(code))")
      .limit(80),
  ]);

  const popularMap = new Map<string, { count: number; title: string; code?: string; id: string }>();
  (popular ?? []).forEach((row) => {
    const material = one(row.material);
    if (!material) return;
    const currentCount = popularMap.get(material.id);
    popularMap.set(material.id, {
      id: material.id,
      title: material.title,
      code: one(material.course)?.code,
      count: (currentCount?.count ?? 0) + 1,
    });
  });
  const popularMaterials = [...popularMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-funaab to-[#054d1f] p-6 text-white sm:p-8">
        <p className="text-sm text-white/80">Welcome back, {firstName}</p>
        <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight">
          Your Academic Resources, All in One Place
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
          Find course materials, notes and PDF resources for your non-major courses.
          {current.profile.level
            ? ` Continue exploring your ${current.profile.level.name} resources.`
            : ""}
        </p>
        <p className="mt-4 text-xs text-white/70">
          For non-major students only. This is not an official FUNAAB portal.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Landmark className="h-5 w-5" />}
          label="My College"
          value={current.profile.college?.code ?? "Not set"}
          detail={current.profile.college?.full_name ?? "Update this in your profile"}
        />
        <InfoCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="My Level"
          value={current.profile.level?.name ?? "Not set"}
          detail="Personalized browsing starts here"
        />
        <Link href="/favorites" className="rounded-3xl border border-line bg-white p-5">
          <Bookmark className="h-5 w-5 text-funaab" />
          <p className="mt-3 text-sm text-muted">Favorites</p>
          <p className="text-xl font-semibold">{favorites?.length ?? 0} saved</p>
        </Link>
        <Link href="/search" className="rounded-3xl border border-line bg-white p-5">
          <Clock3 className="h-5 w-5 text-funaab" />
          <p className="mt-3 text-sm text-muted">Quick Access</p>
          <p className="text-xl font-semibold">Search & browse</p>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently Viewed</h2>
        </div>
        {recent && recent.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((item) => {
              const material = one(item.material);
              if (!material) return null;
              return (
                <Link
                  key={`${material.id}-${item.viewed_at}`}
                  href={`/materials/${material.id}`}
                  className="rounded-3xl border border-line bg-white p-5"
                >
                  <p className="text-xs text-funaab">{one(material.course)?.code ?? "Material"}</p>
                  <p className="mt-1 font-medium">{material.title}</p>
                  <p className="mt-2 text-xs text-muted">{timeAgo(item.viewed_at)}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No recently viewed materials"
            description="Open a PDF and it will appear here for quick return."
          />
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Favorites</h2>
          {favorites && favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((item) => {
                const material = one(item.material);
                if (!material) return null;
                return (
                  <Link
                    key={material.id}
                    href={`/materials/${material.id}`}
                    className="block rounded-3xl border border-line bg-white p-4"
                  >
                    <p className="text-xs text-funaab">{one(material.course)?.code}</p>
                    <p className="font-medium">{material.title}</p>
                    <p className="text-xs text-muted">Saved {formatDate(item.created_at)}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="You haven't saved any materials yet."
              description="Tap Favorite on a material to keep it here."
            />
          )}
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">Popular Materials</h2>
          {popularMaterials.length > 0 ? (
            <div className="space-y-3">
              {popularMaterials.map((item) => (
                <Link
                  key={item.id}
                  href={`/materials/${item.id}`}
                  className="block rounded-3xl border border-line bg-white p-4"
                >
                  <p className="text-xs text-funaab">{item.code}</p>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.count} downloads</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No download activity yet"
              description="Popular materials will appear after real downloads happen."
            />
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Browse Courses</h2>
        {catalogueError ? (
          <EmptyState title="Courses are not available yet" description={catalogueError} />
        ) : colleges.length === 0 ? (
          <EmptyState
            title="No colleges to browse yet"
            description="Academic structure will appear after schema.sql and seed.sql have been run in Supabase."
          />
        ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {colleges.map((college) => (
            <article key={college.id} className="flex flex-col rounded-[1.6rem] border border-line bg-white p-5">
              <p className="text-sm font-semibold text-funaab">{college.code}</p>
              <h3 className="mt-2 text-lg font-semibold leading-6">{college.full_name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{college.description}</p>
              <p className="mt-4 text-xs text-muted">
                {college.department_count} departments · {college.course_count} courses
              </p>
              <Link
                href={`/colleges/${slugifyCode(college.code)}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-funaab px-4 text-sm font-semibold text-white"
              >
                Browse
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <div className="text-funaab">{icon}</div>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}
