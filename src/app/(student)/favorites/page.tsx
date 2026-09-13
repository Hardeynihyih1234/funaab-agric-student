import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { formatDate, materialTypeLabel, one } from "@/lib/utils";
import type { MaterialType } from "@/types/database";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const current = await getCurrentUser();
  if (!current) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("created_at, material:materials(id, title, material_type, course:courses(code, title))")
    .eq("user_id", current.user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Favorites</h1>
      <p className="mt-2 text-sm text-muted">Your saved materials for quick access.</p>
      <div className="mt-6 space-y-3">
        {(data ?? []).length === 0 ? (
          <EmptyState
            title="You haven't saved any materials yet."
            description="Open a course and tap Favorite on a PDF to keep it here."
          />
        ) : (
          (data ?? []).map((row) => {
            const material = one(row.material);
            if (!material) return null;
            return (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="block rounded-3xl border border-line bg-white p-5"
              >
                <p className="text-xs text-funaab">
                  {one(material.course)?.code} · {materialTypeLabel(material.material_type as MaterialType)}
                </p>
                <h2 className="mt-1 font-semibold">{material.title}</h2>
                <p className="text-sm text-muted">Saved {formatDate(row.created_at)}</p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
