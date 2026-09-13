"use client";

import { useState } from "react";
import { updateProfile } from "@/app/(student)/actions";
import { useToast } from "@/components/ui/toast";
import type { College, Level, Profile } from "@/types/database";

export function ProfileForm({
  profile,
  colleges,
  levels,
}: {
  profile: Profile;
  colleges: College[];
  levels: Level[];
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await updateProfile(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Profile updated.", "success");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Full Name</span>
        <input
          name="full_name"
          defaultValue={profile.full_name}
          className="h-12 w-full rounded-2xl border border-line px-4"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">College</span>
        <select
          name="college_id"
          defaultValue={profile.college_id ?? ""}
          className="h-12 w-full rounded-2xl border border-line px-4"
        >
          <option value="">Select college</option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.code}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Level</span>
        <select
          name="level_id"
          defaultValue={profile.level_id ?? ""}
          className="h-12 w-full rounded-2xl border border-line px-4"
        >
          <option value="">Select level</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-funaab text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
