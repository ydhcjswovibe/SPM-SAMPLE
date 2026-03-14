-- Development mode: Allow operations without authentication
-- WARNING: This is for testing only. Remove in production!

-- Drop existing restrictive policies on classes
DROP POLICY IF EXISTS "classes_insert" ON public.classes;
DROP POLICY IF EXISTS "classes_update" ON public.classes;
DROP POLICY IF EXISTS "classes_delete" ON public.classes;
DROP POLICY IF EXISTS "classes_select" ON public.classes;

-- Create permissive policies for development
CREATE POLICY "classes_select_dev" ON public.classes
  FOR SELECT USING (true);

CREATE POLICY "classes_insert_dev" ON public.classes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "classes_update_dev" ON public.classes
  FOR UPDATE USING (true);

CREATE POLICY "classes_delete_dev" ON public.classes
  FOR DELETE USING (true);

-- Drop existing restrictive policies on enrollments
DROP POLICY IF EXISTS "enrollments_select" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete" ON public.enrollments;

-- Create permissive policies for enrollments
CREATE POLICY "enrollments_select_dev" ON public.enrollments
  FOR SELECT USING (true);

CREATE POLICY "enrollments_insert_dev" ON public.enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "enrollments_update_dev" ON public.enrollments
  FOR UPDATE USING (true);

CREATE POLICY "enrollments_delete_dev" ON public.enrollments
  FOR DELETE USING (true);

-- Drop existing restrictive policies on attendances
DROP POLICY IF EXISTS "attendances_select" ON public.attendances;
DROP POLICY IF EXISTS "attendances_insert" ON public.attendances;
DROP POLICY IF EXISTS "attendances_update" ON public.attendances;
DROP POLICY IF EXISTS "attendances_delete" ON public.attendances;

-- Create permissive policies for attendances
CREATE POLICY "attendances_select_dev" ON public.attendances
  FOR SELECT USING (true);

CREATE POLICY "attendances_insert_dev" ON public.attendances
  FOR INSERT WITH CHECK (true);

CREATE POLICY "attendances_update_dev" ON public.attendances
  FOR UPDATE USING (true);

CREATE POLICY "attendances_delete_dev" ON public.attendances
  FOR DELETE USING (true);

-- Drop existing restrictive policies on profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

-- Create permissive policies for profiles
CREATE POLICY "profiles_select_dev" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_dev" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_dev" ON public.profiles
  FOR UPDATE USING (true);

-- Drop existing restrictive policies on weekly_contents
DROP POLICY IF EXISTS "weekly_contents_select" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_insert" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_update" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_delete" ON public.weekly_contents;

-- Create permissive policies for weekly_contents
CREATE POLICY "weekly_contents_select_dev" ON public.weekly_contents
  FOR SELECT USING (true);

CREATE POLICY "weekly_contents_insert_dev" ON public.weekly_contents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "weekly_contents_update_dev" ON public.weekly_contents
  FOR UPDATE USING (true);

CREATE POLICY "weekly_contents_delete_dev" ON public.weekly_contents
  FOR DELETE USING (true);
