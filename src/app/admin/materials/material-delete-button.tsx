"use client";

import { useState } from "react";
import { deleteMaterial } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function MaterialDeleteButton({ materialId }: { materialId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const result = await deleteMaterial(materialId);
    setLoading(false);
    setOpen(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Material deleted.", "success");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
      >
        Delete
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this material?"
        description="The PDF will be removed from storage."
        confirmLabel="Delete"
        danger
        loading={loading}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
