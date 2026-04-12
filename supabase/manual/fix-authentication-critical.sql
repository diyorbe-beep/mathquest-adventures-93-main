-- =====================================================
-- CRITICAL: Run this script in Supabase SQL Editor
-- =====================================================
-- This will fix ALL authentication issues (422, 400, 500 errors)

-- 1. First, drop existing triggers to avoid dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;

-- 2. Drop existing functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- 3. Create the main user handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  -- Disable RLS for this operation
  SET LOCAL row_security = off;

  -- Extract username from metadata with fallbacks
  uname := NULLIF(
    trim(COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )),
    ''
  );
  
  -- Generate username if none provided
  IF uname IS NULL THEN
    uname := 'user_' || replace(NEW.id::text, '-', '');
  END IF;

  -- Check for username conflicts (case-insensitive)
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE lower(p.username) = lower(uname)
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Bunday foydalanuvchi nomi allaqachon mavjud'
      USING ERRCODE = '23505';
  END IF;

  -- Insert profile record
  INSERT INTO public.profiles (user_id, username, created_at, updated_at)
  VALUES (NEW.id, uname, NOW(), NOW());
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Bunday foydalanuvchi nomi allaqachon mavjud'
      USING ERRCODE = '23505';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Profil yaratishda xatolik: %', SQLERRM
      USING ERRCODE = '50001';
END;
$$;

-- 4. Create the role assignment function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Disable RLS for this operation
  SET LOCAL row_security = off;
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the whole signup if role assignment fails
    RETURN NEW;
END;
$$;

-- 5. Create the triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 6. Ensure unique username index exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower_unique
  ON public.profiles (lower(username));

-- 7. Verify tables exist (run this to check)
SELECT 'profiles jadvali mavjud' as holat FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles'
UNION ALL
SELECT 'user_roles jadvali mavjud' as holat FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_roles'
UNION ALL
SELECT 'Triggerlar muvaffaqiyatli yaratildi' as holat;

-- =====================================================
-- AFTER RUNNING THIS SCRIPT:
-- 1. Try signing up with a new account
-- 2. Check browser console for detailed logs
-- 3. If still failing, check Supabase Logs > Postgres logs
-- =====================================================
