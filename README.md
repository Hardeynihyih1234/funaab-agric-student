# FUNAAB Agric Student

A student academic resource platform for students of the Federal University of Agriculture, Abeokuta (FUNAAB). It helps non-major students find and download PDF course materials.

This is **not** an official FUNAAB government or university portal. It is a student resource platform associated with FUNAAB students.

## Features

- Email and Google authentication via Supabase Auth
- Personalized student dashboard
- College → Department → Level → Semester → Course → PDF browsing
- Search and mobile-friendly filters
- Internal PDF viewer, downloads, favorites, and recently viewed
- Report missing or incorrect materials
- Admin dashboard for academic structure, PDF uploads, students, analytics, and settings
- Installable PWA (offline PDF reading is **not** claimed)

Version 1 covers COLPLANT, COLANIM, and COLAMRUD only. Courses are not invented; admins add verified course records later.

## Technology stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase PostgreSQL, Auth, and Storage
- Lucide React icons
- Vercel-compatible deployment

## 10-step setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` if that file is not already present.
3. In Supabase → **Project Settings → API**, copy the Project URL and the public `anon` key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put the service-role key in a `NEXT_PUBLIC_*` variable.
4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local development (use your production URL later).
5. In Supabase → **Authentication → URL Configuration**, set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`
6. In Supabase → **Authentication → Providers**, keep **Email** enabled. Confirm whether new users must verify email before they can sign in.
7. In the Supabase SQL editor, run the migration files in this order:
   1. `supabase/schema.sql`
   2. `supabase/rls.sql`
   3. `supabase/seed.sql`
   4. `supabase/storage.sql`
8. Optional Google sign-in: create a Google OAuth client, enable **Google** in Supabase Auth providers, add the Supabase callback URL in Google, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`. Leave this `false` if Google is not configured — the button will not fake a successful login.
9. Install and start the app:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000), create a student account, and confirm you land on `/dashboard`.
10. To create the first admin, sign up normally, edit `supabase/make-admin.sql` with that account email, and run it in the SQL editor. Do **not** grant admin to every user.

Restart `npm run dev` after changing `.env.local`.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit real secrets. `.env.local` is gitignored. The service role key is server-only and optional until you need Auth Admin features such as disabling users.

## Database setup

The schema creates:

- `profiles` (UUID linked to `auth.users`, including `full_name`, `college_id`, `level_id`, `created_at`)
- `colleges`
- `departments`
- `levels` (100–500)
- `semesters`
- `courses`
- `materials`
- `downloads`
- `favorites`
- `recent_views`
- `admins`
- `reports`
- `platform_settings`

A trigger on `auth.users` creates the matching `profiles` row from signup metadata (`full_name`, college, level). Passwords stay in Supabase Auth only.

Seed data includes COLPLANT, COLANIM, COLAMRUD and their specified departments, plus 100–500 Level and both semesters. **No course codes or titles are fabricated.**

## Storage setup

`supabase/storage.sql` creates:

- `academic-materials` (private, PDF only, admin upload)
- `avatars` (public images)

Organize uploaded PDFs as:

`college/department/level/semester/course/filename.pdf`

## Authentication setup

- Email/password signup collects Full Name, Email, Password, Confirm Password, Level (100–500), and College (COLPLANT, COLANIM, COLAMRUD).
- After a successful session, students are sent to `/dashboard`.
- Login, logout, forgot password, and reset password are included.
- `/auth/callback` completes OAuth and password-reset sessions.
- The signup screen states **For Non-Major Students Only**.
- Protected student and admin routes require a valid session. Admin access uses the `admins` table, not an email comparison.

## Google OAuth setup

1. Create a Google Cloud OAuth client.
2. In Supabase → Authentication → Providers, enable Google.
3. Add the Supabase callback URL from that screen to Google.
4. Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.
5. The Login and Signup pages already include Google buttons. They work only after Google is configured.

## RLS / security setup

`supabase/rls.sql` restricts students to:

- reading public academic data
- managing their own profile, favorites, downloads, recent views, and reports

Only rows in `admins` can create or change academic data, upload PDFs, manage users, or view admin analytics.

Do not add policies that allow everyone to do everything.

## Admin setup

Do **not** make every registered user an admin.

1. Sign up normally.
2. Open `supabase/make-admin.sql`.
3. Replace `replace-with-your-email@example.com` with your email.
4. Run the script in the SQL editor.
5. Visit `/admin`.

## Local development

```bash
npm run dev
npm run lint
npm run build
```

Auth pages use the supplied FUNAAB campus entrance photos in `public/images/`. The crest used in the UI is cropped from that supplied reference, not a redrawn logo.

## Production deployment

1. Push the repo to GitHub or Cursor.
2. Import the project into Vercel.
3. Set the same environment variables.
4. Update `NEXT_PUBLIC_APP_URL`, plus Supabase Auth Site URL and redirect URLs, to the production domain.
5. Re-run `make-admin.sql` for the production admin account if needed.

## How to add courses

Use **Admin → Courses**. Enter only verified course codes, titles, units, and descriptions. If a course is not in your source document, leave it out.

400 Level may follow Farm Practical Year / COBFAS. The student UI explains this and does not invent classroom courses.

## How to upload PDFs

Use **Admin → Materials**. Select the course, title, type, and a PDF (max 25MB). Students then see View / Download. Empty courses show “No materials have been uploaded for this course yet.”

## How to create an admin

See [Admin setup](#admin-setup). Only promote trusted accounts through SQL.

## Troubleshooting

- **Signup shows “Supabase is not configured yet”:** `.env.local` is missing real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values. Restart the dev server after adding them.
- **Signup colleges/levels are empty:** run `seed.sql` and confirm the anon read policies in `rls.sql`.
- **Login fails after signup:** confirm the email if Supabase email confirmation is enabled.
- **Google button errors:** Google provider is not configured in Supabase.
- **PDF upload fails:** create the `academic-materials` bucket and storage policies.
- **Cannot open /admin:** your email is not in the `admins` table.

## Branding note

Campus photography and the crest come from the supplied design references. The app identifies FUNAAB for student context only and does not claim official university ownership.
