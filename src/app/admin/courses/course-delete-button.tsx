"use client";

import { useState } from "react";
import { deleteCourse } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function CourseDeleteButton({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const result = await deleteCourse(courseId);
    setLoading(false);
    setOpen(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Course deleted.", "success");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
      >
        Delete course
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this course?"
        description="This will also remove materials attached to the course."
        confirmLabel="Delete"
        danger
        loading={loading}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
