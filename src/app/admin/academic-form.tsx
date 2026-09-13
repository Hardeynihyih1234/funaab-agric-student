"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
};

export function AcademicForm({
  action,
  fields,
  hidden,
  defaults,
  options,
  submitLabel,
  includeActive = true,
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  fields: Field[];
  hidden?: Record<string, string>;
  defaults?: Record<string, string | boolean>;
  options?: Record<string, Array<{ value: string; label: string }>>;
  submitLabel: string;
  includeActive?: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await action(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Saved.", "success");
    if (!defaults) event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-line bg-white p-4 sm:grid-cols-2">
      {hidden
        ? Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          <span className="mb-1 block text-muted">{field.label}</span>
          {options?.[field.name] ? (
            <select
              name={field.name}
              defaultValue={String(defaults?.[field.name] ?? "")}
              className="h-12 w-full rounded-2xl border border-line px-3"
            >
              <option value="">Select</option>
              {options[field.name].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              defaultValue={String(defaults?.[field.name] ?? "")}
              className="h-12 w-full rounded-2xl border border-line px-3"
            />
          )}
        </label>
      ))}
      {includeActive ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaults?.is_active !== false}
          />
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
