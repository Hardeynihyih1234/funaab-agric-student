"use client";

import { useState } from "react";
import { submitReport } from "@/app/(student)/actions";
import { useToast } from "@/components/ui/toast";

export function SupportForm({
  types,
}: {
  types: Array<{ value: string; label: string }>;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const result = await submitReport(new FormData(form));
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    form.reset();
    toast("Report sent. Thank you.", "success");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Report type</span>
        <select name="report_type" className="h-12 w-full rounded-2xl border border-line px-4">
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-2xl border border-line px-4 py-3"
          placeholder="Describe the missing or incorrect material."
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send report"}
      </button>
    </form>
  );
}
