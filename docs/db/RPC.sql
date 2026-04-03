-- docs/db/RPC.sql
-- SPM (SocialPlusManager) current RPC source of truth
-- Focus: matrix-related mutation helpers for attendance/payment flows
-- Update this file when RPC truth changes.

-- =========================================================
-- Notes
-- =========================================================
-- 1. This file defines RPC-level mutation behavior relied on by the app.
-- 2. Schema truth belongs in docs/db/SCHEMA.sql
-- 3. Permission truth belongs in docs/db/RLS.sql
-- 4. Payment / attendance / weekly-notes mutation canonical truth lives in this file.
-- 5. Route-level wrappers may call these RPCs, but direct table updates are not canonical.
-- 6. If mutation semantics change, sync SPEC / VERIFY / PROGRESS as needed.

-- =========================================================
-- Attendance: session-based status upsert
-- =========================================================
create or replace function public.upsert_session_attendance_status(
  p_session_id uuid,
  p_student_id uuid,
  p_status text
)
returns public.session_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.session_attendance;
begin
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  if p_status not in ('pending', 'present', 'absent', 'excused') then
    raise exception 'invalid attendance status';
  end if;

  insert into public.session_attendance (
    session_id,
    student_id,
    status
  )
  values (
    p_session_id,
    p_student_id,
    p_status
  )
  on conflict (session_id, student_id)
  do update
    set status = excluded.status
  returning * into v_result;

  return v_result;
end;
$$;

comment on function public.upsert_session_attendance_status(uuid, uuid, text)
is 'Upserts one student attendance status for one class_sessions row. Admin/owner only.';

-- =========================================================
-- Attendance legacy fallback: atomic JSONB update on class_logs.attendance_data
-- Keep while older months still read via class_logs-only fallback.
-- =========================================================
create or replace function public.update_attendance_status(
  p_class_log_id uuid,
  p_student_id uuid,
  p_attended boolean
)
returns public.class_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.class_logs;
begin
  -- Permission check
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  update public.class_logs
  set attendance_data =
    coalesce(attendance_data, '{}'::jsonb)
    || jsonb_build_object(p_student_id::text, p_attended)
  where id = p_class_log_id
  returning * into v_result;

  if v_result.id is null then
    raise exception 'class_log not found';
  end if;

  return v_result;
end;
$$;

comment on function public.update_attendance_status(uuid, uuid, boolean)
is 'Atomically updates one student attendance flag inside class_logs.attendance_data JSONB. Admin/owner only.';

-- =========================================================
-- Optional helper: remove attendance key for a student
-- Useful if UI needs "unset" rather than true/false
-- =========================================================
create or replace function public.clear_attendance_status(
  p_class_log_id uuid,
  p_student_id uuid
)
returns public.class_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.class_logs;
begin
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  update public.class_logs
  set attendance_data =
    coalesce(attendance_data, '{}'::jsonb) - p_student_id::text
  where id = p_class_log_id
  returning * into v_result;

  if v_result.id is null then
    raise exception 'class_log not found';
  end if;

  return v_result;
end;
$$;

comment on function public.clear_attendance_status(uuid, uuid)
is 'Removes one student attendance key from class_logs.attendance_data JSONB. Admin/owner only.';

-- =========================================================
-- Weekly notes: class/month/week-scoped note upsert
-- =========================================================
create or replace function public.upsert_weekly_class_log_notes(
  p_class_id uuid,
  p_year_month text,
  p_week_number integer,
  p_progress text,
  p_reflection text,
  p_member_feedback jsonb,
  p_member_admin_notes jsonb,
  p_admin_note text
)
returns public.class_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.class_logs;
begin
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  if p_year_month !~ '^\d{4}-\d{2}$' then
    raise exception 'invalid year_month';
  end if;

  if p_week_number not between 1 and 5 then
    raise exception 'invalid week number';
  end if;

  if jsonb_typeof(coalesce(p_member_feedback, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid member_feedback payload';
  end if;

  if jsonb_typeof(coalesce(p_member_admin_notes, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid member_admin_notes payload';
  end if;

  insert into public.class_logs (
    class_id,
    year_month,
    week_number,
    progress,
    reflection,
    admin_note,
    member_feedback,
    member_admin_notes
  )
  values (
    p_class_id,
    p_year_month,
    p_week_number,
    nullif(btrim(coalesce(p_progress, '')), ''),
    nullif(btrim(coalesce(p_reflection, '')), ''),
    nullif(btrim(coalesce(p_admin_note, '')), ''),
    coalesce(p_member_feedback, '{}'::jsonb),
    coalesce(p_member_admin_notes, '{}'::jsonb)
  )
  on conflict (class_id, year_month, week_number)
  do update
    set progress = excluded.progress,
        reflection = excluded.reflection,
        admin_note = excluded.admin_note,
        member_feedback = excluded.member_feedback,
        member_admin_notes = excluded.member_admin_notes
  returning * into v_result;

  return v_result;
end;
$$;

comment on function public.upsert_weekly_class_log_notes(uuid, text, integer, text, text, jsonb, jsonb, text)
is 'Upserts one class_logs note bundle for a class/month/week scope. Admin/owner only.';

-- =========================================================
-- Payment: explicit enrollment payment toggle
-- =========================================================
create or replace function public.update_enrollment_payment_status(
  p_enrollment_id uuid,
  p_payment_status boolean
)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.enrollments;
begin
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  update public.enrollments
  set payment_status = p_payment_status
  where id = p_enrollment_id
  returning * into v_result;

  if v_result.id is null then
    raise exception 'enrollment not found';
  end if;

  return v_result;
end;
$$;

comment on function public.update_enrollment_payment_status(uuid, boolean)
is 'Updates payment_status for a single enrollment. Admin/owner only.';

-- =========================================================
-- Optional helper: update enrollment lifecycle status
-- =========================================================
create or replace function public.update_enrollment_status(
  p_enrollment_id uuid,
  p_status text
)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.enrollments;
begin
  if not public.is_admin_or_owner() then
    raise exception 'permission denied';
  end if;

  if p_status not in ('ACTIVE', 'PENDING', 'CANCELLED') then
    raise exception 'invalid enrollment status';
  end if;

  update public.enrollments
  set status = p_status
  where id = p_enrollment_id
  returning * into v_result;

  if v_result.id is null then
    raise exception 'enrollment not found';
  end if;

  return v_result;
end;
$$;

comment on function public.update_enrollment_status(uuid, text)
is 'Updates lifecycle status for a single enrollment. Admin/owner only.';

-- =========================================================
-- Behavior Contract Notes
-- =========================================================
-- Attendance mutation contract:
-- - primary input: session_id, student_id, status
-- - success: returns updated session_attendance row
-- - error:
--   - permission denied
--   - invalid attendance status
--
-- Attendance legacy fallback contract:
-- - input: class_log_id, student_id, attended(boolean) or unset
-- - success: returns updated class_logs row
-- - error:
--   - permission denied
--   - class_log not found
--
-- Payment mutation contract:
-- - input: enrollment_id, payment_status(boolean)
-- - success: returns updated enrollments row
-- - error:
--   - permission denied
--   - enrollment not found
--
-- Weekly notes mutation contract:
-- - input: class_id, year_month, week_number, progress, reflection, member_feedback, member_admin_notes, admin_note
-- - success: returns updated class_logs row
-- - error:
--   - permission denied
--   - invalid year_month
--   - invalid week number
--   - invalid member_feedback payload
--   - invalid member_admin_notes payload
--
-- UI assumptions:
-- - caller should treat returned row as backend truth
-- - denied/error states must not be silently swallowed
-- - frontend should clearly distinguish success vs denied vs not-found
