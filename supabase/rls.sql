-- Row Level Security policies
-- Students can read public academic data and manage only their own records.
-- Admins can manage academic structure, materials, users, and reports.
-- Safe to re-run: existing policies are dropped before they are created.

alter table public.colleges enable row level security;
alter table public.departments enable row level security;
alter table public.levels enable row level security;
alter table public.semesters enable row level security;
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.courses enable row level security;
alter table public.materials enable row level security;
alter table public.downloads enable row level security;
alter table public.favorites enable row level security;
alter table public.recent_views enable row level security;
alter table public.reports enable row level security;
alter table public.platform_settings enable row level security;

-- Academic catalogues
drop policy if exists "Authenticated users can read active colleges" on public.colleges;
create policy "Authenticated users can read active colleges"
  on public.colleges for select
  to authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage colleges" on public.colleges;
create policy "Admins can manage colleges"
  on public.colleges for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read active departments" on public.departments;
create policy "Authenticated users can read active departments"
  on public.departments for select
  to authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments"
  on public.departments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read levels" on public.levels;
create policy "Authenticated users can read levels"
  on public.levels for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage levels" on public.levels;
create policy "Admins can manage levels"
  on public.levels for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read semesters" on public.semesters;
create policy "Authenticated users can read semesters"
  on public.semesters for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage semesters" on public.semesters;
create policy "Admins can manage semesters"
  on public.semesters for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read active courses" on public.courses;
create policy "Authenticated users can read active courses"
  on public.courses for select
  to authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read active materials" on public.materials;
create policy "Authenticated users can read active materials"
  on public.materials for select
  to authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage materials" on public.materials;
create policy "Admins can manage materials"
  on public.materials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own non-privileged profile" on public.profiles;
create policy "Users can update own non-privileged profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and status = 'active');

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Trigger or admin can insert profiles" on public.profiles;
create policy "Trigger or admin can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

-- Admins table: users can see only their own admin row; only existing admins can insert
drop policy if exists "Users can read own admin row" on public.admins;
create policy "Users can read own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage admin rows" on public.admins;
create policy "Admins can manage admin rows"
  on public.admins for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Personal student records
drop policy if exists "Users manage own downloads" on public.downloads;
create policy "Users manage own downloads"
  on public.downloads for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users insert own downloads" on public.downloads;
create policy "Users insert own downloads"
  on public.downloads for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users manage own recent views" on public.recent_views;
create policy "Users manage own recent views"
  on public.recent_views for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users upsert own recent views" on public.recent_views;
create policy "Users upsert own recent views"
  on public.recent_views for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users update own recent views" on public.recent_views;
create policy "Users update own recent views"
  on public.recent_views for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users insert own reports" on public.reports;
create policy "Users insert own reports"
  on public.reports for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports"
  on public.reports for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports"
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read settings" on public.platform_settings;
create policy "Authenticated users can read settings"
  on public.platform_settings for select
  to authenticated
  using (true);

drop policy if exists "Admins can update settings" on public.platform_settings;
create policy "Admins can update settings"
  on public.platform_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Signup page needs college/level lists before login
drop policy if exists "Anonymous users can read colleges for signup" on public.colleges;
create policy "Anonymous users can read colleges for signup"
  on public.colleges for select
  to anon
  using (is_active = true);

drop policy if exists "Anonymous users can read levels for signup" on public.levels;
create policy "Anonymous users can read levels for signup"
  on public.levels for select
  to anon
  using (true);
