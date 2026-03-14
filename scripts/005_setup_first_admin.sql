-- Update the profile trigger to make the first user an admin
-- Also update existing profiles: if there's only one profile, make them admin

-- Update existing profile(s) to be admin if no admin exists yet
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'student' 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
  AND id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- Update the handle_new_user function to make the first user an admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if this is the first user (no existing profiles)
  IF NOT EXISTS (SELECT 1 FROM public.profiles) THEN
    user_role := 'admin';
  ELSE
    user_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
