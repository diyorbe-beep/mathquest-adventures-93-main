-- Ro'yxatdan o'tish 500 — Supabase SQL Editor da bir marta ishga tushiring.
-- (Migratsiya bilan bir xil: 20260324120000_fix_signup_triggers.sql)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  SET LOCAL row_security = off;

  uname := NULLIF(trim(NEW.raw_user_meta_data->>'username'), '');
  IF uname IS NULL THEN
    uname := 'user_' || replace(NEW.id::text, '-', '');
  END IF;

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, uname);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, 'user_' || replace(NEW.id::text, '-', ''));
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = off;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;
