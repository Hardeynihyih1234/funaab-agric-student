import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, one } from "@/lib/utils";

export const metadata: Metadata = { title: "Downloads" };

export default async function DownloadsPage() {
  const current = await getCurrentUser();
  if (!current) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("downloads")
    .select("id, created_at, material:materials(id, title, course:courses(code))")
    .eq("user_id", current.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Downloads</h1>
      <p className="mt-2 text-sm text-muted">
        Your download history. Files remain available through your device downloads.
      </p>
      <div className="mt-6 space-y-3">
        {(data ?? []).length === 0 ? (
          <EmptyState
            title="Your downloaded materials will appear here."
            description="Download a PDF from a course page to start this list."
          />
        ) : (
          (data ?? []).map((row) => {
            const material = one(row.material);
            return (
              <Link
                key={row.id}
                href={material ? `/materials/${material.id}` : "/dashboard"}
                className="block rounded-3xl border border-line bg-white p-5"
              >
                <p className="text-xs text-funaab">{one(material?.course)?.code}</p>
                <h2 className="font-semibold">{material?.title ?? "Material"}</h2>
                <p className="text-sm text-muted">{formatDateTime(row.created_at)}</p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
