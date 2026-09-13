"use server";

import { revalidatePath } from "next/cache";
import { ACADEMIC_MATERIALS_BUCKET, MAX_PDF_SIZE_BYTES } from "@/lib/constants";
import { requireAdmin } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

async function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/browse");
}

export async function saveCollege(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    name: String(formData.get("name") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };
  if (!payload.code || !payload.name || !payload.full_name) {
    return { error: "Code, name and full name are required." };
  }
  const query = id
    ? supabase.from("colleges").update(payload).eq("id", id)
    : supabase.from("colleges").insert(payload);
  const { error } = await query;
  if (error) return { error: "Unable to save college." };
  await revalidateAdmin();
  return { success: true };
}

export async function saveDepartment(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    college_id: String(formData.get("college_id") ?? ""),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    name: String(formData.get("name") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };
  if (!payload.college_id || !payload.code || !payload.name) {
    return { error: "College, code and name are required." };
  }
  const query = id
    ? supabase.from("departments").update(payload).eq("id", id)
    : supabase.from("departments").insert(payload);
  const { error } = await query;
  if (error) return { error: "Unable to save department." };
  await revalidateAdmin();
  return { success: true };
}

export async function saveCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const unitsValue = String(formData.get("units") ?? "").trim();
  const payload = {
    department_id: String(formData.get("department_id") ?? ""),
    level_id: String(formData.get("level_id") ?? ""),
    semester_id: String(formData.get("semester_id") ?? ""),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    title: String(formData.get("title") ?? "").trim(),
    units: unitsValue ? Number(unitsValue) : null,
    description: String(formData.get("description") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };
  if (!payload.department_id || !payload.level_id || !payload.semester_id || !payload.code || !payload.title) {
    return { error: "Please complete the required course fields." };
  }
  const query = id
    ? supabase.from("courses").update(payload).eq("id", id)
    : supabase.from("courses").insert(payload);
  const { error } = await query;
  if (error) return { error: "Unable to save course." };
  await revalidateAdmin();
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return { error: "Unable to delete course." };
  await revalidateAdmin();
  return { success: true };
}

export async function saveMaterial(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const materialType = String(formData.get("material_type") ?? "other");
  const description = String(formData.get("description") ?? "").trim() || null;
  const file = formData.get("file");

  if (!courseId || !title) {
    return { error: "Course and material title are required." };
  }

  let fileFields: Record<string, unknown> = {};
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Only PDF files are allowed." };
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      return { error: "The PDF is larger than 25MB." };
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, code, department:departments(code, college:colleges(code)), level:levels(code), semester:semesters(code)")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) return { error: "Selected course was not found." };

    const department = Array.isArray(course.department) ? course.department[0] : course.department;
    const college = department && "college" in department
      ? (Array.isArray(department.college) ? department.college[0] : department.college)
      : null;
    const collegeCode = college?.code ?? "college";
    const deptCode = department?.code ?? "dept";
    const level = Array.isArray(course.level) ? course.level[0] : course.level;
    const semester = Array.isArray(course.semester) ? course.semester[0] : course.semester;
    const levelCode = level?.code ?? "level";
    const semesterCode = semester?.code ?? "semester";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${collegeCode}/${deptCode}/${levelCode}/${semesterCode}/${course.code}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ACADEMIC_MATERIALS_BUCKET)
      .upload(path, file, { contentType: "application/pdf", upsert: false });

    if (uploadError) {
      return { error: "Unable to upload the file. Please try again." };
    }

    fileFields = {
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: "application/pdf",
      uploaded_by: admin.user.id,
    };
  }

  const payload = {
    course_id: courseId,
    title,
    material_type: materialType,
    description,
    ...fileFields,
  };

  const query = id
    ? supabase.from("materials").update(payload).eq("id", id)
    : supabase.from("materials").insert(payload);

  const { error } = await query;
  if (error) return { error: "Unable to save material." };
  await revalidateAdmin();
  return { success: true };
}

export async function deleteMaterial(materialId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: material } = await supabase
    .from("materials")
    .select("file_path")
    .eq("id", materialId)
    .maybeSingle();

  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) return { error: "Unable to delete material." };

  if (material?.file_path) {
    await supabase.storage.from(ACADEMIC_MATERIALS_BUCKET).remove([material.file_path]);
  }

  await revalidateAdmin();
  return { success: true };
}

export async function setUserStatus(userId: string, status: "active" | "disabled") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  if (error) return { error: "Unable to update the student account." };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const service = createServiceClient();
      await service.auth.admin.updateUserById(userId, {
        ban_duration: status === "disabled" ? "876000h" : "none",
      });
    } catch {
      // Profile status still applies even if Auth admin API is unavailable.
    }
  }

  revalidatePath("/admin/students");
  return { success: true };
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update({
      platform_name: String(formData.get("platform_name") ?? "").trim(),
      platform_description: String(formData.get("platform_description") ?? "").trim(),
      contact_email: String(formData.get("contact_email") ?? "").trim(),
      maintenance_mode: formData.get("maintenance_mode") === "on",
    })
    .eq("id", 1);
  if (error) return { error: "Unable to save settings." };
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateReportStatus(reportId: string, status: "open" | "reviewed" | "resolved") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
  if (error) return { error: "Unable to update report." };
  revalidatePath("/admin/reports");
  return { success: true };
}
