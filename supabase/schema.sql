-- FUNAAB Agric Student — database schema
-- Run this in the Supabase SQL editor first, then rls.sql, seed.sql, and storage.sql.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  full_name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  code text not null,
  name text not null,
  full_name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (college_id, code)
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_farm_practical boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  college_id uuid references public.colleges(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  level_id uuid not null references public.levels(id) on delete restrict,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  code text not null,
  title text not null,
  units integer,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, code, level_id, semester_id)
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  material_type text not null check (
    material_type in (
      'lecture_note',
      'handout',
      'past_question',
      'assignment',
      'course_outline',
      'other'
    )
  ),
  description text,
  file_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, material_id)
);

create table if not exists public.recent_views (
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, material_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  report_type text not null check (
    report_type in (
      'missing_material',
      'incorrect_material',
      'incorrect_course',
      'feedback'
    )
  ),
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  id integer primary key default 1 check (id = 1),
  platform_name text not null default 'FUNAAB Agric Student',
  platform_description text not null default 'A student academic resource platform for FUNAAB non-major course materials.',
  contact_email text not null default 'support@example.com',
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists departments_college_id_idx on public.departments (college_id);
create index if not exists courses_department_id_idx on public.courses (department_id);
create index if not exists courses_level_id_idx on public.courses (level_id);
create index if not exists courses_semester_id_idx on public.courses (semester_id);
create index if not exists courses_code_idx on public.courses (code);
create index if not exists courses_title_idx on public.courses using gin (to_tsvector('simple', title));
create index if not exists materials_course_id_idx on public.materials (course_id);
create index if not exists materials_type_idx on public.materials (material_type);
create index if not exists downloads_user_id_idx on public.downloads (user_id);
create index if not exists downloads_material_id_idx on public.downloads (material_id);
create index if not exists downloads_created_at_idx on public.downloads (created_at desc);
create index if not exists favorites_material_id_idx on public.favorites (material_id);
create index if not exists recent_views_viewed_at_idx on public.recent_views (user_id, viewed_at desc);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists profiles_college_id_idx on public.profiles (college_id);
create index if not exists profiles_level_id_idx on public.profiles (level_id);
create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists colleges_set_updated_at on public.colleges;
create trigger colleges_set_updated_at before update on public.colleges
for each row execute function public.set_updated_at();

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists levels_set_updated_at on public.levels;
create trigger levels_set_updated_at before update on public.levels
for each row execute function public.set_updated_at();

drop trigger if exists semesters_set_updated_at on public.semesters;
create trigger semesters_set_updated_at before update on public.semesters
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at before update on public.materials
for each row execute function public.set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at before update on public.platform_settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_college uuid;
  meta_level uuid;
  college_ref text;
  level_ref text;
begin
  begin
    meta_college := nullif(new.raw_user_meta_data->>'college_id', '')::uuid;
  exception when others then
    meta_college := null;
  end;

  begin
    meta_level := nullif(new.raw_user_meta_data->>'level_id', '')::uuid;
  exception when others then
    meta_level := null;
  end;

  if meta_college is null then
    college_ref := coalesce(
      new.raw_user_meta_data->>'college_code',
      new.raw_user_meta_data->>'college',
      new.raw_user_meta_data->>'college_id',
      ''
    );
    if college_ref <> '' then
      select id into meta_college
      from public.colleges
      where upper(code) = upper(college_ref)
      limit 1;
    end if;
  end if;

  if meta_level is null then
    level_ref := coalesce(
      new.raw_user_meta_data->>'level_code',
      new.raw_user_meta_data->>'level',
      new.raw_user_meta_data->>'level_id',
      ''
    );
    if level_ref <> '' then
      select id into meta_level
      from public.levels
      where upper(code) = upper(level_ref)
         or upper(name) = upper(level_ref)
         or upper(replace(name, ' ', '')) = upper(replace(level_ref, ' ', ''))
      limit 1;
    end if;
  end if;

  insert into public.profiles (id, full_name, email, college_id, level_id, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    meta_college,
    meta_level,
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when public.profiles.full_name = '' then excluded.full_name
          else public.profiles.full_name
        end,
        college_id = coalesce(public.profiles.college_id, excluded.college_id),
        level_id = coalesce(public.profiles.level_id, excluded.level_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;
