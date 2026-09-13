-- Promote the first administrator securely.
-- 1. Sign up normally in the app.
-- 2. Replace the email below with that account.
-- 3. Run this in the Supabase SQL editor.
-- Never grant admin to every registered user.

insert into public.admins (user_id, role)
select id, 'super_admin'
from public.profiles
where email = 'replace-with-your-email@example.com'
on conflict (user_id) do update
  set role = 'super_admin';
