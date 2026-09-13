"use client";

import { useState } from "react";
import { updateSettings } from "@/app/admin/actions";
import { useToast } from "@/components/ui/toast";

export function SettingsForm({
  settings,
}: {
  settings: {
    platform_name: string;
    platform_description: string;
    contact_email: string;
    maintenance_mode: boolean;
  };
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await updateSettings(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) toast(result.error, "error");
    else toast("Settings saved.", "success");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-line bg-white p-5">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Platform name</span>
        <input
          name="platform_name"
          defaultValue={settings.platform_name}
          className="h-12 w-full rounded-2xl border border-line px-4"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Description</span>
        <textarea
          name="platform_description"
          defaultValue={settings.platform_description}
          rows={4}
          className="w-full rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Contact email</span>
        <input
          name="contact_email"
          type="email"
          defaultValue={settings.contact_email}
          className="h-12 w-full rounded-2xl border border-line px-4"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="maintenance_mode" defaultChecked={settings.maintenance_mode} />
        Maintenance mode
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-funaab font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
