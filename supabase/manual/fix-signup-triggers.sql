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

  -- Supabase versiyalarida metadata joylashuvi farq qilishi mumkin.
  -- Bu yerda faqat NEW.raw_user_meta_data (jsonb) dan turli kalitlarni sinab ko'ramiz.
  uname := NULLIF(
    trim(COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->'user_metadata'->>'username',
      NEW.raw_user_meta_data->'data'->>'username',
      NEW.raw_user_meta_data->'metadata'->>'username',
      split_part(NEW.email, '@', 1)
    )),
    ''
  );
  IF uname IS NULL THEN
    uname := 'user_' || replace(NEW.id::text, '-', '');
  END IF;

  -- Username (case-insensitive) band bo'lsa, ro'yxatdan o'tishni to'xtatamiz.
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE lower(p.username) = lower(uname)
  ) THEN
    RAISE EXCEPTION 'Bunday foydalanuvchi nomi allaqachon mavjud'
      USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, uname);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Bunday foydalanuvchi nomi allaqachon mavjud'
      USING ERRCODE = '23505';
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

-- 1) Case-insensitive takror nomlarni tartibga keltirish:
-- birinchi user nomni saqlab qoladi, qolganlari user_<id8> ga o'tadi.
WITH ranked AS (
  SELECT
    p.id,
    p.user_id,
    p.username,
    row_number() OVER (PARTITION BY lower(p.username) ORDER BY p.created_at, p.id) AS rn
  FROM public.profiles p
),
dupes AS (
  SELECT id, user_id
  FROM ranked
  WHERE rn > 1
)
UPDATE public.profiles p
SET username = 'user_' || left(replace(p.user_id::text, '-', ''), 8)
FROM dupes d
WHERE p.id = d.id;

-- 2) Kelgusida ham takror nom bo'lmasin (case-insensitive):
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower_unique
  ON public.profiles (lower(username));

-- 3) Backfill (faqat avval auto-generate bo'lib qolganlar uchun):
-- user_<...> yozuvlarini auth.users raw_user_meta_data/email asosida yangilaydi.
-- Agar nom band bo'lsa, o'sha user_... holatida qoladi.
WITH base AS (
  SELECT
    p.user_id,
    NULLIF(
      trim(COALESCE(
        u.raw_user_meta_data->>'username',
        u.raw_user_meta_data->'user_metadata'->>'username',
        u.raw_user_meta_data->'data'->>'username',
        u.raw_user_meta_data->'metadata'->>'username',
        split_part(u.email, '@', 1)
      )),
      ''
    ) AS candidate_base
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.username LIKE 'user_%'
),
candidates AS (
  SELECT
    b.user_id,
    b.candidate_base AS candidate_final
  FROM base b
  WHERE b.candidate_base IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles p2
      WHERE lower(p2.username) = lower(b.candidate_base)
        AND p2.user_id <> b.user_id
    )
)
UPDATE public.profiles p
SET username = c.candidate_final
FROM candidates c
WHERE p.user_id = c.user_id
  AND p.username <> c.candidate_final;
