import type { Metadata } from "next";
import { SettingsForm } from "@/app/admin/settings/settings-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-muted">Basic platform settings for version 1.</p>
      <div className="mt-5">
        <SettingsForm
          settings={
            data ?? {
              platform_name: "FUNAAB Agric Student",
              platform_description:
                "A student academic resource platform for FUNAAB non-major course materials.",
              contact_email: "support@example.com",
              maintenance_mode: false,
            }
          }
        />
      </div>
    </div>
  );
}
