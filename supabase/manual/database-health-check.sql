-- =====================================================
-- DATABASE HEALTH CHECK - Run this in Supabase SQL Editor
-- =====================================================

-- Check if required tables exist
SELECT 
  table_name,
  'Jadval mavjud' as holat
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_roles', 'auth.users')
ORDER BY table_name;

-- Triggerlar mavjudligini tekshirish
SELECT 
  trigger_name,
  event_manipulation,
  'Trigger mavjud' as holat
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'on_auth_user_role_created')
ORDER BY trigger_name;

-- Funksiyalar mavjudligini tekshirish
SELECT 
  routine_name,
  'Funksiya mavjud' as holat
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_new_user_role')
ORDER BY routine_name;

-- Indekslarni tekshirish
SELECT 
  indexname,
  'Indeks mavjud' as holat
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname = 'idx_profiles_username_lower_unique';

-- Test the trigger function (dry run)
-- This will NOT create a user, just test the function logic
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
  result TEXT;
BEGIN
  -- Test username extraction logic
  result := NULLIF(
    trim(COALESCE(
      'testuser'::text,  -- Simulating raw_user_meta_data->>'username'
      split_part(test_email, '@', 1)
    )),
    ''
  );
  
  RAISE NOTICE 'Foydalanuvchi nomi ajratish natijasi: %', result;
  
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = lower(result)
  ) THEN
    RAISE NOTICE 'Foydalanuvchi nomi band: %', result;
  ELSE
    RAISE NOTICE 'Foydalanuvchi nomi bo''sh: %', result;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test muvaffaqiyatsiz: %', SQLERRM;
END $$;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;

-- =====================================================
-- If any of these checks fail, run the fix-authentication-critical.sql script
-- =====================================================
