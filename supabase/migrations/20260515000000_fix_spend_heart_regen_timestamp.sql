-- Fix spend_heart: hearts_last_regen ni yurak kamaytirilganda to'g'ri o'rnatish.
--
-- Muammo: avvalgi spend_heart hearts_last_regen ni yangilamasdi.
-- Natija: yurak kamaytirilgandan keyin regen timer noto'g'ri hisoblardi —
--   agar hearts_last_regen eski bo'lsa, getMsUntilNextHeart() darhol 0 qaytarardi
--   va regen zudlik bilan ishga tushardi (yurak darhol tiklanib ketardi).
--
-- Yechim: yurak kamaytirilganda hearts_last_regen = now() ga o'rnatiladi.
-- Bu regen timerga aniq 15 daqiqa kutishni bildiradi.

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
  v_hearts          integer;
  v_last_regen      timestamptz;
  v_now             timestamptz := now();
  v_new_last_regen  timestamptz;
BEGIN
  -- Profilni lock qilish
  SELECT hearts, hearts_last_regen
  INTO v_hearts, v_last_regen
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_hearts IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Profil topilmadi'::text;
    RETURN;
  END IF;

  IF v_hearts <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Yuraklar tugagan'::text;
    RETURN;
  END IF;

  -- hearts_last_regen ni hisoblash:
  -- Agar avvalgi regen vaqtidan 15 daqiqa o'tmagan bo'lsa, uni saqlaymiz
  -- (regen timer to'g'ri ishlashi uchun).
  -- Agar 15 daqiqa o'tgan bo'lsa (ya'ni regen hali ishlamagan), now() ga o'rnatamiz —
  -- bu yangi 15 daqiqa hisobini boshlaydi.
  IF v_last_regen IS NULL OR (v_now - v_last_regen) >= interval '15 minutes' THEN
    v_new_last_regen := v_now;
  ELSE
    v_new_last_regen := v_last_regen;
  END IF;

  -- Yurakni kamaytirish va regen vaqtini yangilash
  UPDATE public.profiles
  SET hearts           = hearts - 1,
      hearts_last_regen = v_new_last_regen
  WHERE user_id = p_user_id;

  -- Log yozish
  INSERT INTO public.hearts_logs (user_id, change, reason)
  VALUES (p_user_id, -1, p_reason);

  RETURN QUERY SELECT true, (v_hearts - 1), 'Yurak sarflandi'::text;
END;
$$;
