import type { MaterialType, ReportType } from "@/types/database";

export const APP_NAME = "FUNAAB Agric Student";
export const APP_TAGLINE = "Knowledge for Development";
export const APP_FOOTER_MOTTO = "AGRICULTURE FOR A BETTER TOMORROW";
export const UNIVERSITY_NAME = "FEDERAL UNIVERSITY OF AGRICULTURE, ABEOKUTA";
export const NON_MAJOR_NOTICE = "For Non-Major Students Only";

export const SIGNUP_LEVELS = [
  { code: "100", name: "100 LEVEL" },
  { code: "200", name: "200 LEVEL" },
  { code: "300", name: "300 LEVEL" },
  { code: "400", name: "400 LEVEL" },
  { code: "500", name: "500 LEVEL" },
] as const;

export const SIGNUP_COLLEGES = [
  { code: "COLPLANT", name: "COLPLANT" },
  { code: "COLANIM", name: "COLANIM" },
  { code: "COLAMRUD", name: "COLAMRUD" },
] as const;

export type SignupOption = {
  id: string;
  code: string;
  name: string;
  full_name?: string;
};

export function withSignupFallbacks(
  fetched: Array<{ id: string; code: string; name?: string; full_name?: string }> | null | undefined,
  canonical: readonly { code: string; name: string }[],
): SignupOption[] {
  const byCode = new Map(
    (fetched ?? []).map((item) => [item.code.trim().toUpperCase(), item]),
  );

  return canonical.map((option) => {
    const fromDb = byCode.get(option.code.toUpperCase());
    return {
      id: fromDb?.id ?? option.code,
      code: option.code,
      name: option.name,
      full_name: fromDb?.full_name,
    };
  });
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  lecture_note: "Lecture Note",
  handout: "Handout",
  past_question: "Past Question",
  assignment: "Assignment",
  course_outline: "Course Outline",
  other: "Other",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  missing_material: "Course material missing",
  incorrect_material: "Incorrect material",
  incorrect_course: "Incorrect course information",
  feedback: "General feedback",
};

export const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
export const SEARCH_DEBOUNCE_MS = 300;
export const RECENT_VIEWS_LIMIT = 6;
export const DASHBOARD_POPULAR_LIMIT = 6;

export const ACADEMIC_MATERIALS_BUCKET = "academic-materials";
export const AVATARS_BUCKET = "avatars";
