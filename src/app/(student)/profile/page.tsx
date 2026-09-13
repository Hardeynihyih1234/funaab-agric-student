import type { Metadata } from "next";
import { ProfileForm } from "@/app/(student)/profile/profile-form";
import { getColleges, getLevels } from "@/lib/data/catalogue";
import { getCurrentUser } from "@/lib/data/current-user";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const current = await getCurrentUser();
  if (!current) return null;
  const [colleges, levels] = await Promise.all([getColleges(), getLevels()]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-sm text-muted">
        Update your student details. Email and admin status cannot be changed here.
      </p>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5">
        <p className="text-sm text-muted">Email</p>
        <p className="font-medium">{current.profile.email}</p>
        <p className="mt-4 text-sm text-muted">Date joined</p>
        <p className="font-medium">{formatDate(current.profile.created_at)}</p>
      </div>
      <div className="mt-4 rounded-3xl border border-line bg-white p-5">
        <ProfileForm profile={current.profile} colleges={colleges} levels={levels} />
      </div>
    </div>
  );
}
