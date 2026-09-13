"use server";

import { revalidatePath } from "next/cache";
import { ACADEMIC_MATERIALS_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(materialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to continue." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("material_id")
    .eq("user_id", user.id)
    .eq("material_id", materialId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("material_id", materialId);
    if (error) return { error: "Unable to update favorites." };
  } else {
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      material_id: materialId,
    });
    if (error) return { error: "Unable to save this material." };
  }

  revalidatePath("/favorites");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function recordView(materialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("recent_views").upsert({
    user_id: user.id,
    material_id: materialId,
    viewed_at: new Date().toISOString(),
  });
}

export async function requestDownload(materialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to continue." };

  const { data: material } = await supabase
    .from("materials")
    .select("id, file_path, file_name, is_active")
    .eq("id", materialId)
    .maybeSingle();

  if (!material || !material.is_active || !material.file_path) {
    return { error: "This material is currently unavailable." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(ACADEMIC_MATERIALS_BUCKET)
    .createSignedUrl(material.file_path, 60, {
      download: material.file_name ?? undefined,
    });

  if (signError || !signed?.signedUrl) {
    return { error: "This material is currently unavailable." };
  }

  const { error } = await supabase.from("downloads").insert({
    user_id: user.id,
    material_id: materialId,
  });
  if (error) {
    return { error: "Unable to record this download. Please try again." };
  }

  revalidatePath("/downloads");
  return { url: signed.signedUrl };
}

export async function getSignedViewUrl(materialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to continue." };

  const { data: material } = await supabase
    .from("materials")
    .select("id, file_path, is_active")
    .eq("id", materialId)
    .maybeSingle();

  if (!material || !material.is_active || !material.file_path) {
    return { error: "This material is currently unavailable." };
  }

  const { data: signed, error } = await supabase.storage
    .from(ACADEMIC_MATERIALS_BUCKET)
    .createSignedUrl(material.file_path, 120);

  if (error || !signed?.signedUrl) {
    return { error: "This material is currently unavailable." };
  }

  await supabase.from("recent_views").upsert({
    user_id: user.id,
    material_id: materialId,
    viewed_at: new Date().toISOString(),
  });

  return { url: signed.signedUrl };
}

export async function submitReport(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to continue." };

  const message = String(formData.get("message") ?? "").trim();
  const reportType = String(formData.get("report_type") ?? "feedback");
  const courseId = String(formData.get("course_id") ?? "") || null;
  const materialId = String(formData.get("material_id") ?? "") || null;

  if (message.length < 8) {
    return { error: "Please describe the issue in a little more detail." };
  }

  const { error } = await supabase.from("reports").insert({
    user_id: user.id,
    report_type: reportType,
    message,
    course_id: courseId,
    material_id: materialId,
  });

  if (error) {
    return { error: "Unable to send your report. Please try again." };
  }

  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to continue." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const collegeId = String(formData.get("college_id") ?? "") || null;
  const levelId = String(formData.get("level_id") ?? "") || null;

  if (!fullName) return { error: "Full name is required." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      college_id: collegeId,
      level_id: levelId,
    })
    .eq("id", user.id);

  if (error) return { error: "Unable to update your profile." };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
