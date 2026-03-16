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
-- 4. If mutation semantics change, sync SPEC / PLAN / PROGRESS as needed.

-- =========================================================
-- Attendance: atomic JSONB update on class_logs.attendance_data
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
-- - input: class_log_id, student_id, attended(boolean)
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
-- UI assumptions:
-- - caller should treat returned row as backend truth
-- - denied/error states must not be silently swallowed
-- - frontend should clearly distinguish success vs denied vs not-found