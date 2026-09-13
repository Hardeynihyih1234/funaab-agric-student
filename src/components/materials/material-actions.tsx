"use client";

import { Bookmark, Download, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { requestDownload, toggleFavorite } from "@/app/(student)/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function MaterialActions({
  materialId,
  hasFile,
  initiallyFavorite = false,
}: {
  materialId: string;
  hasFile: boolean;
  initiallyFavorite?: boolean;
}) {
  const { toast } = useToast();
  const [favorite, setFavorite] = useState(initiallyFavorite);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onFavorite() {
    setSaving(true);
    const result = await toggleFavorite(materialId);
    setSaving(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    setFavorite((value) => !value);
    toast(favorite ? "Removed from favorites." : "Saved to favorites.", "success");
  }

  async function onDownload() {
    if (!hasFile) {
      toast("This material is currently unavailable.", "error");
      return;
    }
    setDownloading(true);
    const result = await requestDownload(materialId);
    setDownloading(false);
    if (result.error || !("url" in result) || !result.url) {
      toast(result.error ?? "This material is currently unavailable.", "error");
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasFile ? (
        <Link
          href={`/materials/${materialId}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-funaab px-4 text-sm font-semibold text-white"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center rounded-full bg-zinc-100 px-4 text-sm text-muted">
          Material not uploaded yet
        </span>
      )}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading || !hasFile}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {downloading ? "Preparing..." : "Download"}
      </button>
      <button
        type="button"
        onClick={onFavorite}
        disabled={saving}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
          favorite ? "border-funaab bg-funaab-soft text-funaab" : "border-line",
        )}
      >
        <Bookmark className="h-4 w-4" />
        {favorite ? "Saved" : "Favorite"}
      </button>
    </div>
  );
}
