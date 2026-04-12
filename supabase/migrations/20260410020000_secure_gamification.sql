-- =====================================================
-- PHASE 4: SECURE GAMIFICATION LOGIC
-- =====================================================

-- 1. Secure Heart Deduction
CREATE OR REPLACE FUNCTION public.spend_heart(
  p_user_id uuid,
  p_reason text DEFAULT 'wrong_answer'
)
RETURNS TABLE(
  success boolean,
  new_hearts integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hearts integer;
BEGIN
  -- Lock profile
  SELECT hearts INTO v_hearts
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_hearts IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Profile not found'::text;
    RETURN;
  END IF;

  IF v_hearts <= 0 THEN
    RETURN QUERY SELECT false, 0, 'No hearts left'::text;
    RETURN;
  END IF;

  -- Update hearts
  UPDATE public.profiles
  SET hearts = hearts - 1
  WHERE user_id = p_user_id;

  -- Log action
  INSERT INTO public.hearts_logs (user_id, change, reason)
  VALUES (p_user_id, -1, p_reason);

  RETURN QUERY SELECT true, (v_hearts - 1), 'Heart deducted'::text;
END;
$$;

-- 2. Secure Heart Regeneration (Batch)
-- Note: Interval is hardcoded to 1 hour (3600000ms) to prevent client exploitation.
CREATE OR REPLACE FUNCTION public.regen_hearts_secure(
  p_user_id uuid
)
RETURNS TABLE(
  success boolean,
  new_hearts integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hearts integer;
  v_last_regen timestamptz;
  v_now timestamptz := now();
  v_regen_steps integer;
  v_hearts_to_add integer;
  v_regen_ms integer := 3600000; -- 1 hour in ms
BEGIN
  SELECT hearts, hearts_last_regen INTO v_hearts, v_last_regen
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_hearts IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Profile not found'::text;
    RETURN;
  END IF;

  IF v_hearts >= 5 THEN
    RETURN QUERY SELECT true, v_hearts, 'Already full'::text;
    RETURN;
  END IF;

  -- Calculate steps
  v_regen_steps := floor(extract(epoch from (v_now - v_last_regen)) * 1000 / v_regen_ms);
  v_hearts_to_add := LEAST(v_regen_steps, 5 - v_hearts);

  IF v_hearts_to_add > 0 THEN
    UPDATE public.profiles
    SET hearts = hearts + v_hearts_to_add,
        hearts_last_regen = v_last_regen + (v_hearts_to_add * v_regen_ms * interval '1 millisecond')
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT true, (v_hearts + v_hearts_to_add), 'Hearts regenerated'::text;
  ELSE
    RETURN QUERY SELECT true, v_hearts, 'Not enough time passed'::text;
  END IF;
END;
$$;

-- 3. Secure Streak Update
CREATE OR REPLACE FUNCTION public.update_streak_secure(p_user_id uuid)
RETURNS TABLE(success boolean, new_streak integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := current_date;
  v_last_login date;
  v_current_streak integer;
BEGIN
  SELECT last_login_date, streak_days INTO v_last_login, v_current_streak
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_last_login = v_today THEN
    RETURN QUERY SELECT true, v_current_streak;
    RETURN;
  END IF;

  IF v_last_login = v_today - interval '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;

  UPDATE public.profiles
  SET streak_days = v_current_streak,
      last_login_date = v_today
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, v_current_streak;
END;
$$;
