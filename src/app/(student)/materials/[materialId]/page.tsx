import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PdfViewer } from "@/components/materials/pdf-viewer";
import { getMaterialById } from "@/lib/data/catalogue";
import { getSignedViewUrl } from "@/app/(student)/actions";
import { formatDate, formatFileSize, materialTypeLabel } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ materialId: string }>;
}): Promise<Metadata> {
  const { materialId } = await params;
  const material = await getMaterialById(materialId);
  return { title: material?.title ?? "Material" };
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  const material = await getMaterialById(materialId);
  if (!material) notFound();

  const signed = material.file_path ? await getSignedViewUrl(material.id) : { error: "This material is currently unavailable." };
  const course = material.course as { id: string; code: string; title: string } | null;

  return (
    <div>
      <Link href={course ? `/courses/${course.id}` : "/dashboard"} className="text-sm font-medium text-funaab">
        ← Back
      </Link>
      <p className="mt-4 text-xs text-funaab">{materialTypeLabel(material.material_type)}</p>
      <h1 className="mt-1 text-2xl font-semibold">{material.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {course ? `${course.code} · ${course.title}` : "Course"} · {formatFileSize(material.file_size)} ·{" "}
        {formatDate(material.created_at)}
      </p>
      <div className="mt-5">
        {"url" in signed && signed.url ? (
          <PdfViewer src={signed.url} title={material.title} materialId={material.id} />
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
            {signed.error ?? "This material is currently unavailable."}
          </div>
        )}
      </div>
    </div>
  );
}
