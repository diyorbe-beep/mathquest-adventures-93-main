-- Ro'yxatdan o'tishda 500: trigger ichidagi INSERT ba'zan RLS bilan to'qnashadi (auth.uid() bo'sh).
-- Shuningdek takrorlanmas username uchun UUID asosida zaxira.

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
