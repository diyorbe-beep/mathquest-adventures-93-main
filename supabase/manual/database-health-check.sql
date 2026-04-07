-- =====================================================
-- DATABASE HEALTH CHECK - Run this in Supabase SQL Editor
-- =====================================================

-- Check if required tables exist
SELECT 
  table_name,
  'Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_roles', 'auth.users')
ORDER BY table_name;

-- Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  'Trigger exists' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'on_auth_user_role_created')
ORDER BY trigger_name;

-- Check if functions exist
SELECT 
  routine_name,
  'Function exists' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_new_user_role')
ORDER BY routine_name;

-- Check indexes
SELECT 
  indexname,
  'Index exists' as status
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
  
  RAISE NOTICE 'Username extraction test result: %', result;
  
  -- Check for potential conflicts
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = lower(result)
  ) THEN
    RAISE NOTICE 'Username conflict detected for: %', result;
  ELSE
    RAISE NOTICE 'Username available: %', result;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test failed: %', SQLERRM;
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
