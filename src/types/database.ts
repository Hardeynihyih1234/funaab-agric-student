export type UserStatus = "active" | "disabled";

export type MaterialType =
  | "lecture_note"
  | "handout"
  | "past_question"
  | "assignment"
  | "course_outline"
  | "other";

export type ReportType =
  | "missing_material"
  | "incorrect_material"
  | "incorrect_course"
  | "feedback";

export type ReportStatus = "open" | "reviewed" | "resolved";

export type AdminRole = "admin" | "super_admin";

export interface College {
  id: string;
  code: string;
  name: string;
  full_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  college_id: string;
  code: string;
  name: string;
  full_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_farm_practical: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  college_id: string | null;
  level_id: string | null;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  level_id: string;
  semester_id: string;
  code: string;
  title: string;
  units: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  course_id: string;
  title: string;
  material_type: MaterialType;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: number;
  platform_name: string;
  platform_description: string;
  contact_email: string;
  maintenance_mode: boolean;
  updated_at: string;
}

export type CollegeWithCounts = College & {
  department_count: number;
  course_count: number;
};

export type DepartmentWithCollege = Department & {
  college?: College | null;
};

export type CourseWithRelations = Course & {
  department?: Department | null;
  level?: Level | null;
  semester?: Semester | null;
  material_count?: number;
};

export type MaterialWithCourse = Material & {
  course?: CourseWithRelations | null;
  download_count?: number;
  is_favorite?: boolean;
};

export type ProfileWithRelations = Profile & {
  college?: College | null;
  level?: Level | null;
  is_admin?: boolean;
};
