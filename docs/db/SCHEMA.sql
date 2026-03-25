-- docs/db/SCHEMA.sql
-- SPM (SocialPlusManager) database schema source of truth
-- Renamed from legacy `SCHEAMA.SQL`
-- Update this file first when schema truth changes.

-- =========================================================
-- 1. Profiles (RBAC: OWNER, ADMIN, STUDENT)
-- 사용자 프로필 및 권한 관리
-- =========================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  role text check (role in ('OWNER', 'ADMIN', 'STUDENT')) default 'STUDENT',
  full_name text,
  avatar_url text
);

-- =========================================================
-- 2. Classes (Class management)
-- 수업 정보 (여러 수업 동시 운영 지원)
-- =========================================================
create table classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  instructor_id uuid references profiles(id),
  is_active boolean default true
);

-- =========================================================
-- 3. Enrollments (Monthly Management & Payment)
-- 수강 등록 및 월별 정산 관리
-- =========================================================
create table enrollments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references classes(id),
  student_id uuid references profiles(id),
  year_month text not null, -- 'YYYY-MM' format
  payment_status boolean default false, -- 수강료 결제 여부
  status text check (status in ('ACTIVE', 'PENDING', 'CANCELLED')) default 'ACTIVE',
  unique(class_id, student_id, year_month)
);

-- =========================================================
-- 4. Feedback Presets (Quick Tag System)
-- 피드백 퀵 태그
-- =========================================================
create table feedback_presets (
  id uuid default gen_random_uuid() primary key,
  instructor_id uuid references profiles(id),
  tag_name text not null,
  content text not null,
  category text
);

-- =========================================================
-- 5. Class Logs (Attendance & Weekly Notes - JSONB)
-- 수업 기록, 출석 데이터, 주차 메모/피드백 데이터
-- =========================================================
create table class_logs (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references classes(id),
  year_month text not null,
  week_number int check (week_number between 1 and 5),
  progress text,
  reflection text,
  admin_note text,
  attendance_data jsonb default '{}'::jsonb, -- { "student_id": true/false }
  member_feedback jsonb default '{}'::jsonb, -- { "student_id": "feedback_text" }
  unique(class_id, year_month, week_number)
);

-- =========================================================
-- 6. Media Pipeline (Media metadata)
-- 영상(YouTube) 및 이미지(Supabase) 메타데이터 저장
-- =========================================================
create table media (
  id uuid default gen_random_uuid() primary key,
  log_id uuid references class_logs(id) on delete cascade,
  type text check (type in ('VIDEO', 'IMAGE')),
  url text not null,
  upload_method text check (upload_method in ('AUTO', 'MANUAL'))
);

-- Current active media scope note:
-- - VIDEO rows store a YouTube URL.
-- - IMAGE rows store the public object URL from the `spm-media` bucket.
-- - Weekly media cardinality truth is `class_log -> media 1:N`.
-- - Both VIDEO and IMAGE allow 0..N rows per class_log.
-- - Admin-managed weekly media currently uses the existing `MANUAL` upload_method value.

-- =========================================================
-- Notes
-- =========================================================
-- 1. This file is the schema source of truth.
-- 2. RLS / permission truth belongs in docs/db/RLS.sql
-- 3. RPC / atomic JSONB update truth belongs in docs/db/RPC.sql
-- 4. Schema changes should be reflected in SPEC / VERIFY / PROGRESS as needed.
