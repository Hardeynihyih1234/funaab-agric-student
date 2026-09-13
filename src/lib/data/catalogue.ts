import { SIGNUP_COLLEGES, SIGNUP_LEVELS, withSignupFallbacks } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  College,
  CollegeWithCounts,
  CourseWithRelations,
  Department,
  Level,
  Material,
  Semester,
} from "@/types/database";

export async function getColleges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as College[];
}

export async function getCollegesWithCounts() {
  const supabase = await createClient();
  const { data: colleges, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  const { data: departments } = await supabase
    .from("departments")
    .select("id, college_id")
    .eq("is_active", true);

  const { data: courses } = await supabase
    .from("courses")
    .select("id, department_id")
    .eq("is_active", true);

  const deptByCollege = new Map<string, string[]>();
  (departments ?? []).forEach((dept) => {
    const list = deptByCollege.get(dept.college_id) ?? [];
    list.push(dept.id);
    deptByCollege.set(dept.college_id, list);
  });

  const courseCountByDept = new Map<string, number>();
  (courses ?? []).forEach((course) => {
    courseCountByDept.set(
      course.department_id,
      (courseCountByDept.get(course.department_id) ?? 0) + 1,
    );
  });

  return ((colleges ?? []) as College[]).map((college) => {
    const deptIds = deptByCollege.get(college.id) ?? [];
    return {
      ...college,
      department_count: deptIds.length,
      course_count: deptIds.reduce(
        (sum, id) => sum + (courseCountByDept.get(id) ?? 0),
        0,
      ),
    } satisfies CollegeWithCounts;
  });
}

export async function getCollegeByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error) throw error;
  return data as College | null;
}

export async function getDepartmentsByCollege(collegeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("college_id", collegeId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function getDepartmentByCode(collegeId: string, code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("college_id", collegeId)
    .ilike("code", code)
    .maybeSingle();

  if (error) throw error;
  return data as Department | null;
}

export async function getLevels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Level[];
}

export async function getLevelByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data as Level | null;
}

export async function getSemesters() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Semester[];
}

export async function getCoursesForDepartmentLevel(departmentId: string, levelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, semester:semesters(*), level:levels(*)")
    .eq("department_id", departmentId)
    .eq("level_id", levelId)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;

  const courses = (data ?? []) as CourseWithRelations[];
  if (courses.length === 0) return courses;

  const { data: materials } = await supabase
    .from("materials")
    .select("id, course_id")
    .in(
      "course_id",
      courses.map((course) => course.id),
    )
    .eq("is_active", true);

  const counts = new Map<string, number>();
  (materials ?? []).forEach((material) => {
    counts.set(material.course_id, (counts.get(material.course_id) ?? 0) + 1);
  });

  return courses.map((course) => ({
    ...course,
    material_count: counts.get(course.id) ?? 0,
  }));
}

export async function getCourseById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "*, department:departments(*, college:colleges(*)), level:levels(*), semester:semesters(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CourseWithRelations | null;
}

export async function getMaterialsForCourse(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Material[];
}

export async function getMaterialById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select(
      "*, course:courses(*, department:departments(*, college:colleges(*)), level:levels(*), semester:semesters(*))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchCatalogue(query: string) {
  const supabase = await createClient();
  const term = query.trim();
  if (!term) {
    return { colleges: [], departments: [], courses: [], materials: [] };
  }

  const like = `%${term}%`;

  const [colleges, departments, courses, materials] = await Promise.all([
    supabase
      .from("colleges")
      .select("*")
      .or(`code.ilike.${like},name.ilike.${like},full_name.ilike.${like}`)
      .eq("is_active", true)
      .limit(8),
    supabase
      .from("departments")
      .select("*, college:colleges(*)")
      .or(`code.ilike.${like},name.ilike.${like},full_name.ilike.${like}`)
      .eq("is_active", true)
      .limit(8),
    supabase
      .from("courses")
      .select("*, department:departments(*, college:colleges(*)), level:levels(*), semester:semesters(*)")
      .or(`code.ilike.${like},title.ilike.${like}`)
      .eq("is_active", true)
      .limit(12),
    supabase
      .from("materials")
      .select("*, course:courses(*)")
      .ilike("title", like)
      .eq("is_active", true)
      .limit(12),
  ]);

  return {
    colleges: colleges.data ?? [],
    departments: departments.data ?? [],
    courses: courses.data ?? [],
    materials: materials.data ?? [],
  };
}

export async function getSignupOptions() {
  const supabase = await createClient();
  const [{ data: colleges }, { data: levels }] = await Promise.all([
    supabase.from("colleges").select("id, code, name, full_name").eq("is_active", true).order("sort_order"),
    supabase.from("levels").select("id, code, name").order("sort_order"),
  ]);

  return {
    colleges: withSignupFallbacks(colleges, SIGNUP_COLLEGES),
    levels: withSignupFallbacks(levels, SIGNUP_LEVELS),
  };
}
