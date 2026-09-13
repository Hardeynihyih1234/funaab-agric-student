"use client";

import { useState } from "react";
import { saveMaterial } from "@/app/admin/actions";
import { useToast } from "@/components/ui/toast";
import { MATERIAL_TYPE_LABELS } from "@/lib/constants";

export function MaterialAdminForm({
  courses,
}: {
  courses: Array<{ id: string; label: string }>;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setProgress("Uploading...");
    const result = await saveMaterial(new FormData(event.currentTarget));
    setLoading(false);
    setProgress("");
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Material saved.", "success");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-line bg-white p-4 sm:grid-cols-2">
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-muted">Course</span>
        <select name="course_id" required className="h-12 w-full rounded-2xl border border-line px-3">
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Material title</span>
        <input name="title" required className="h-12 w-full rounded-2xl border border-line px-3" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Material type</span>
        <select name="material_type" className="h-12 w-full rounded-2xl border border-line px-3">
          {Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-muted">Description</span>
        <input name="description" className="h-12 w-full rounded-2xl border border-line px-3" />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-muted">PDF file</span>
        <input
          name="file"
          type="file"
          accept="application/pdf"
          className="block w-full text-sm"
        />
      </label>
      {progress ? <p className="text-sm text-muted sm:col-span-2">{progress}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"
      >
        {loading ? "Uploading..." : "Upload material"}
      </button>
    </form>
  );
}
