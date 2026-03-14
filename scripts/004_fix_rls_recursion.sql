-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function
-- This function bypasses RLS to check if a user is an admin

-- Create a function to check if the current user is an admin
-- This function is SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

DROP POLICY IF EXISTS "classes_select_all" ON public.classes;
DROP POLICY IF EXISTS "classes_insert_admin" ON public.classes;
DROP POLICY IF EXISTS "classes_update_admin" ON public.classes;
DROP POLICY IF EXISTS "classes_delete_admin" ON public.classes;

DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_select_admin" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_admin" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_admin" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_admin" ON public.enrollments;

DROP POLICY IF EXISTS "attendances_select_own" ON public.attendances;
DROP POLICY IF EXISTS "attendances_select_admin" ON public.attendances;
DROP POLICY IF EXISTS "attendances_insert_admin" ON public.attendances;
DROP POLICY IF EXISTS "attendances_update_admin" ON public.attendances;
DROP POLICY IF EXISTS "attendances_delete_admin" ON public.attendances;

DROP POLICY IF EXISTS "weekly_contents_select_enrolled" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_select_admin" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_insert_admin" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_update_admin" ON public.weekly_contents;
DROP POLICY IF EXISTS "weekly_contents_delete_admin" ON public.weekly_contents;

-- Recreate RLS Policies for profiles using the is_admin() function
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Recreate RLS Policies for classes
CREATE POLICY "classes_select_all" ON public.classes
  FOR SELECT USING (TRUE);

CREATE POLICY "classes_insert_admin" ON public.classes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "classes_update_admin" ON public.classes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "classes_delete_admin" ON public.classes
  FOR DELETE USING (public.is_admin());

-- Recreate RLS Policies for enrollments
CREATE POLICY "enrollments_select" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "enrollments_insert_admin" ON public.enrollments
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "enrollments_update_admin" ON public.enrollments
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "enrollments_delete_admin" ON public.enrollments
  FOR DELETE USING (public.is_admin());

-- Recreate RLS Policies for attendances
CREATE POLICY "attendances_select" ON public.attendances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE id = attendances.enrollment_id AND student_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "attendances_insert_admin" ON public.attendances
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "attendances_update_admin" ON public.attendances
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "attendances_delete_admin" ON public.attendances
  FOR DELETE USING (public.is_admin());

-- Recreate RLS Policies for weekly_contents
CREATE POLICY "weekly_contents_select" ON public.weekly_contents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE class_id = weekly_contents.class_id AND student_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "weekly_contents_insert_admin" ON public.weekly_contents
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "weekly_contents_update_admin" ON public.weekly_contents
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "weekly_contents_delete_admin" ON public.weekly_contents
  FOR DELETE USING (public.is_admin());
