-- docs/db/RLS.sql
-- SPM (SocialPlusManager) current RLS source of truth
-- Consolidated from legacy draft/hotfix policy files
-- Update this file when permission truth changes.

-- =========================================================
-- Enable RLS
-- =========================================================
alter table profiles enable row level security;
alter table classes enable row level security;
alter table enrollments enable row level security;
alter table feedback_presets enable row level security;
alter table class_logs enable row level security;
alter table media enable row level security;
alter table storage.objects enable row level security;

-- =========================================================
-- Helper functions
-- =========================================================

-- Current user's app role
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

-- Is current user owner?
create or replace function public.is_owner()
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
      and role = 'OWNER'
  );
$$;

-- Is current user admin or owner?
create or replace function public.is_admin_or_owner()
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
      and role in ('OWNER', 'ADMIN')
  );
$$;

-- Is current user the instructor of a class?
create or replace function public.is_class_instructor(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and c.instructor_id = auth.uid()
  );
$$;

-- Is current user enrolled in a class (by any month record)?
create or replace function public.is_student_of_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.class_id = target_class_id
      and e.student_id = auth.uid()
  );
$$;

-- =========================================================
-- Drop legacy policies before recreating current truth
-- =========================================================

drop policy if exists "profiles_select_self_or_admin" on profiles;
drop policy if exists "profiles_update_self_or_owner" on profiles;

drop policy if exists "classes_select_by_role" on classes;
drop policy if exists "classes_insert_owner_only" on classes;
drop policy if exists "classes_update_owner_only" on classes;
drop policy if exists "classes_delete_owner_only" on classes;

drop policy if exists "enrollments_select_by_role" on enrollments;
drop policy if exists "enrollments_insert_admin_or_owner" on enrollments;
drop policy if exists "enrollments_update_admin_or_owner" on enrollments;
drop policy if exists "enrollments_delete_owner_only" on enrollments;

drop policy if exists "feedback_presets_select_by_role" on feedback_presets;
drop policy if exists "feedback_presets_insert_admin_or_owner" on feedback_presets;
drop policy if exists "feedback_presets_update_admin_or_owner" on feedback_presets;
drop policy if exists "feedback_presets_delete_admin_or_owner" on feedback_presets;

drop policy if exists "class_logs_select_by_role" on class_logs;
drop policy if exists "class_logs_insert_admin_or_owner" on class_logs;
drop policy if exists "class_logs_update_admin_or_owner" on class_logs;
drop policy if exists "class_logs_delete_owner_only" on class_logs;

drop policy if exists "media_select_by_role" on media;
drop policy if exists "media_insert_admin_or_owner" on media;
drop policy if exists "media_update_admin_or_owner" on media;
drop policy if exists "media_delete_admin_or_owner" on media;
drop policy if exists "media_delete_owner_only" on media;

drop policy if exists "spm-media public read" on storage.objects;
drop policy if exists "spm-media insert" on storage.objects;
drop policy if exists "spm-media update" on storage.objects;
drop policy if exists "spm-media delete" on storage.objects;

-- =========================================================
-- Profiles policies
-- =========================================================

create policy "profiles_select_self_or_admin"
on profiles
for select
using (
  auth.uid() = id
  or public.is_admin_or_owner()
);

create policy "profiles_update_self_or_owner"
on profiles
for update
using (
  auth.uid() = id
  or public.is_owner()
)
with check (
  auth.uid() = id
  or public.is_owner()
);

-- Optional: keep profile insert/delete controlled externally if needed
-- If signup flow requires profile insert by authenticated user, add a narrow insert policy later.

-- =========================================================
-- Classes policies
-- =========================================================

create policy "classes_select_by_role"
on classes
for select
using (
  public.is_admin_or_owner()
  or public.is_class_instructor(id)
  or public.is_student_of_class(id)
);

create policy "classes_insert_owner_only"
on classes
for insert
with check (
  public.is_owner()
);

create policy "classes_update_owner_only"
on classes
for update
using (
  public.is_owner()
)
with check (
  public.is_owner()
);

create policy "classes_delete_owner_only"
on classes
for delete
using (
  public.is_owner()
);

-- =========================================================
-- Enrollments policies
-- =========================================================

create policy "enrollments_select_by_role"
on enrollments
for select
using (
  public.is_admin_or_owner()
  or student_id = auth.uid()
  or public.is_class_instructor(class_id)
);

create policy "enrollments_insert_admin_or_owner"
on enrollments
for insert
with check (
  public.is_admin_or_owner()
);

create policy "enrollments_update_admin_or_owner"
on enrollments
for update
using (
  public.is_admin_or_owner()
)
with check (
  public.is_admin_or_owner()
);

create policy "enrollments_delete_owner_only"
on enrollments
for delete
using (
  public.is_owner()
);

-- =========================================================
-- Feedback presets policies
-- =========================================================

create policy "feedback_presets_select_by_role"
on feedback_presets
for select
using (
  public.is_admin_or_owner()
  or instructor_id = auth.uid()
);

create policy "feedback_presets_insert_admin_or_owner"
on feedback_presets
for insert
with check (
  public.is_admin_or_owner()
);

create policy "feedback_presets_update_admin_or_owner"
on feedback_presets
for update
using (
  public.is_admin_or_owner()
)
with check (
  public.is_admin_or_owner()
);

create policy "feedback_presets_delete_admin_or_owner"
on feedback_presets
for delete
using (
  public.is_admin_or_owner()
);

-- =========================================================
-- Class logs policies
-- =========================================================

create policy "class_logs_select_by_role"
on class_logs
for select
using (
  public.is_admin_or_owner()
  or public.is_class_instructor(class_id)
  or public.is_student_of_class(class_id)
);

create policy "class_logs_insert_admin_or_owner"
on class_logs
for insert
with check (
  public.is_admin_or_owner()
);

create policy "class_logs_update_admin_or_owner"
on class_logs
for update
using (
  public.is_admin_or_owner()
)
with check (
  public.is_admin_or_owner()
);

create policy "class_logs_delete_owner_only"
on class_logs
for delete
using (
  public.is_owner()
);

-- =========================================================
-- Media policies
-- =========================================================

create policy "media_select_by_role"
on media
for select
using (
  public.is_admin_or_owner()
  or exists (
    select 1
    from public.class_logs cl
    where cl.id = media.log_id
      and (
        public.is_class_instructor(cl.class_id)
        or public.is_student_of_class(cl.class_id)
      )
  )
);

create policy "media_insert_admin_or_owner"
on media
for insert
with check (
  public.is_admin_or_owner()
);

create policy "media_update_admin_or_owner"
on media
for update
using (
  public.is_admin_or_owner()
)
with check (
  public.is_admin_or_owner()
);

create policy "media_delete_admin_or_owner"
on media
for delete
using (
  public.is_admin_or_owner()
);

-- =========================================================
-- Storage policies (`spm-media` weekly images)
-- =========================================================
-- Active weekly image storage contract:
-- - bucket: `spm-media` (`public = true`)
-- - path: `weekly-images/{class_id}/{year_month}/week-{week_number}/{timestamp}-{safe-filename}`
-- - scope: `class_log`당 `IMAGE` 0..N건
-- - `media.url`: public object URL
-- - `upload_method`: `MANUAL`
-- Insert and post-update writes stay on the fixed weekly-images path contract.
-- Update/delete still cover the whole bucket for admin/owner remediation of legacy objects.

create policy "spm-media public read"
on storage.objects
for select
using (
  bucket_id = 'spm-media'
);

create policy "spm-media insert"
on storage.objects
for insert
with check (
  bucket_id = 'spm-media'
  and public.is_admin_or_owner()
  and name ~ '^weekly-images/[^/]+/[^/]+/week-[0-9]+/[^/]+-[^/]+$'
);

create policy "spm-media update"
on storage.objects
for update
using (
  bucket_id = 'spm-media'
  and public.is_admin_or_owner()
)
with check (
  bucket_id = 'spm-media'
  and public.is_admin_or_owner()
  and name ~ '^weekly-images/[^/]+/[^/]+/week-[0-9]+/[^/]+-[^/]+$'
);

create policy "spm-media delete"
on storage.objects
for delete
using (
  bucket_id = 'spm-media'
  and public.is_admin_or_owner()
);

-- =========================================================
-- Notes
-- =========================================================
-- 1. This file should represent the CURRENT permission truth.
-- 2. If policy history matters, archive old versions separately.
-- 3. Keep auth/role behavior aligned with SPEC, VERIFY, and PROGRESS.
-- 4. Any RPC depending on these policies should also be reviewed in docs/db/RPC.sql.
