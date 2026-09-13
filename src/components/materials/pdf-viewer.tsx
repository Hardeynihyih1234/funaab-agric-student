"use client";

import { Download, Maximize2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { requestDownload } from "@/app/(student)/actions";
import { useToast } from "@/components/ui/toast";

export function PdfViewer({
  src,
  title,
  materialId,
}: {
  src: string;
  title: string;
  materialId: string;
}) {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(100);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    const result = await requestDownload(materialId);
    setDownloading(false);
    if (result.error || !("url" in result) || !result.url) {
      toast(result.error ?? "This material is currently unavailable.", "error");
      return;
    }
    window.location.href = result.url;
  }

  function fullscreen() {
    const frame = document.getElementById("pdf-frame");
    if (frame && "requestFullscreen" in frame) {
      void (frame as HTMLElement).requestFullscreen();
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-3">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(70, value - 10))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-14 text-center text-sm">{zoom}%</span>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(160, value + 10))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={fullscreen}
          className="flex h-10 items-center gap-2 rounded-full border border-line px-3 text-sm"
        >
          <Maximize2 className="h-4 w-4" />
          Fullscreen
        </button>
        <button
          type="button"
          onClick={download}
          disabled={downloading}
          className="ml-auto flex h-10 items-center gap-2 rounded-full bg-funaab px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Preparing..." : "Download"}
        </button>
      </div>
      <div className="h-[72vh] overflow-auto bg-zinc-100">
        <iframe
          id="pdf-frame"
          title={title}
          src={src}
          className="h-full w-full origin-top border-0"
          style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
        />
      </div>
      <p className="px-4 py-3 text-xs text-muted">
        Use the browser PDF controls for page navigation where supported. Downloaded files stay on your device.
      </p>
    </div>
  );
}
