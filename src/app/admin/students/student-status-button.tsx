"use client";

import { useState } from "react";
import { setUserStatus } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function StudentStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const next = status === "disabled" ? "active" : "disabled";

  async function confirm() {
    setLoading(true);
    const result = await setUserStatus(userId, next);
    setLoading(false);
    setOpen(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast(next === "disabled" ? "Account disabled." : "Account enabled.", "success");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-line px-3 py-1 text-xs font-medium"
      >
        {status}
      </button>
      <ConfirmDialog
        open={open}
        title={next === "disabled" ? "Disable this account?" : "Enable this account?"}
        description="The student will be blocked from using the platform if disabled. Passwords are never shown."
        confirmLabel={next === "disabled" ? "Disable" : "Enable"}
        danger={next === "disabled"}
        loading={loading}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
