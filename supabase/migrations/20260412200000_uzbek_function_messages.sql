-- Barcha funksiya xabarlari va do'kon ma'lumotlarini o'zbekchaga o'tkazish
-- Supabase SQL Editor da ishga tushiring

-- ============================================================
-- 1. spend_heart funksiyasi — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.spend_heart(
  p_user_id uuid,
  p_reason text DEFAULT 'wrong_answer'
)
RETURNS TABLE(success boolean, new_hearts integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hearts integer;
BEGIN
  SELECT hearts INTO v_hearts
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_hearts IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Profil topilmadi'::text;
    RETURN;
  END IF;

  IF v_hearts <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Yuraklar tugadi'::text;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET hearts = hearts - 1
  WHERE user_id = p_user_id;

  INSERT INTO public.hearts_logs (user_id, change, reason)
  VALUES (p_user_id, -1, p_reason);

  RETURN QUERY SELECT true, (v_hearts - 1), 'Yurak ayirildi'::text;
END;
$$;

-- ============================================================
-- 2. regen_hearts_secure funksiyasi — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.regen_hearts_secure(
  p_user_id uuid
)
RETURNS TABLE(success boolean, new_hearts integer, message text)
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
  v_regen_ms integer := 3600000;
BEGIN
  SELECT hearts, hearts_last_regen INTO v_hearts, v_last_regen
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_hearts IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Profil topilmadi'::text;
    RETURN;
  END IF;

  IF v_hearts >= 5 THEN
    RETURN QUERY SELECT true, v_hearts, 'Yuraklar to''la'::text;
    RETURN;
  END IF;

  v_regen_steps := floor(extract(epoch from (v_now - v_last_regen)) * 1000 / v_regen_ms);
  v_hearts_to_add := LEAST(v_regen_steps, 5 - v_hearts);

  IF v_hearts_to_add > 0 THEN
    UPDATE public.profiles
    SET hearts = hearts + v_hearts_to_add,
        hearts_last_regen = v_last_regen + (v_hearts_to_add * v_regen_ms * interval '1 millisecond')
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT true, (v_hearts + v_hearts_to_add), 'Yuraklar tiklandi'::text;
  ELSE
    RETURN QUERY SELECT true, v_hearts, 'Vaqt yetarli emas'::text;
  END IF;
END;
$$;

-- ============================================================
-- 3. purchase_item funksiyasi — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.purchase_item(
  p_user_id uuid,
  p_item_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS TABLE(success boolean, new_balance integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_coins integer;
  item_price integer;
  item_name text;
  total_cost integer;
BEGIN
  SET LOCAL row_security = off;

  SELECT coins INTO current_coins
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  SELECT price, name INTO item_price, item_name
  FROM public.shop_items
  WHERE id = p_item_id AND is_active = true;

  IF item_price IS NULL THEN
    RETURN QUERY SELECT false, current_coins, 'Mahsulot topilmadi yoki faol emas'::text;
    RETURN;
  END IF;

  total_cost := item_price * p_quantity;

  IF current_coins < total_cost THEN
    RETURN QUERY SELECT false, current_coins, 'Coin yetarli emas'::text;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET coins = coins - total_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (p_user_id, p_item_id, p_quantity)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = user_inventory.quantity + p_quantity;

  INSERT INTO public.coin_logs (user_id, amount, source, metadata)
  VALUES (
    p_user_id, -total_cost, 'shop_purchase',
    json_build_object('item_id', p_item_id, 'item_name', item_name, 'quantity', p_quantity)
  );

  RETURN QUERY SELECT true, (current_coins - total_cost), 'Muvaffaqiyatli sotib olindi'::text;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Xarid amalga oshmadi: %', SQLERRM USING ERRCODE = '50002';
END;
$$;

-- ============================================================
-- 4. award_xp funksiyasi — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_lesson_id uuid,
  p_amount integer,
  p_source text DEFAULT 'lesson'
)
RETURNS TABLE(success boolean, new_level integer, new_xp integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  current_level integer;
  new_level_val integer;
  new_xp_val integer;
  max_daily_xp integer := 1000;
  xp_today integer;
BEGIN
  SET LOCAL row_security = off;

  SELECT xp, level INTO current_xp, current_level
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  SELECT COALESCE(SUM(amount), 0) INTO xp_today
  FROM public.xp_logs
  WHERE user_id = p_user_id
    AND source = p_source
    AND DATE(created_at) = CURRENT_DATE;

  IF xp_today + p_amount > max_daily_xp THEN
    RETURN QUERY SELECT false, current_level, current_xp, 'Kunlik XP chegarasi oshib ketdi'::text;
    RETURN;
  END IF;

  IF p_amount <= 0 OR p_amount > 100 THEN
    RETURN QUERY SELECT false, current_level, current_xp, 'Noto''g''ri XP miqdori'::text;
    RETURN;
  END IF;

  new_xp_val := current_xp + p_amount;
  new_level_val := FLOOR(new_xp_val / 100) + 1;

  UPDATE public.profiles
  SET xp = new_xp_val,
      level = new_level_val,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.xp_logs (user_id, amount, source, lesson_id)
  VALUES (p_user_id, p_amount, p_source, p_lesson_id);

  RETURN QUERY SELECT true, new_level_val, new_xp_val, 'XP muvaffaqiyatli berildi'::text;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'XP berish amalga oshmadi: %', SQLERRM USING ERRCODE = '50003';
END;
$$;

-- ============================================================
-- 5. purchase_shop_item funksiyasi — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.purchase_shop_item(p_item_id uuid)
RETURNS TABLE(success boolean, message text, new_balance integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_price integer;
  v_coins integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Avval tizimga kiring', 0;
    RETURN;
  END IF;

  SELECT price INTO v_price
  FROM public.shop_items
  WHERE id = p_item_id AND is_active = true;

  IF v_price IS NULL THEN
    RETURN QUERY SELECT false, 'Mahsulot topilmadi yoki faol emas', 0;
    RETURN;
  END IF;

  SELECT coins INTO v_coins
  FROM public.profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_coins IS NULL THEN
    RETURN QUERY SELECT false, 'Profil topilmadi', 0;
    RETURN;
  END IF;

  IF v_coins < v_price THEN
    RETURN QUERY SELECT false, 'Coin yetarli emas', v_coins;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET coins = coins - v_price
  WHERE user_id = v_user_id;

  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (v_user_id, p_item_id, 1)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = public.user_inventory.quantity + 1, acquired_at = now();

  INSERT INTO public.coin_logs (user_id, amount, source, metadata)
  VALUES (v_user_id, -v_price, 'shop_purchase', jsonb_build_object('item_id', p_item_id));

  RETURN QUERY SELECT true, 'Muvaffaqiyatli sotib olindi', (v_coins - v_price);
END;
$$;

-- ============================================================
-- 6. process_marketplace_order — exception xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_marketplace_order(
  p_items jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_total_cost integer := 0;
  v_item record;
  v_current_coins integer;
  v_cached_response jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Tizimga kirish talab qilinadi';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT response_data INTO v_cached_response
    FROM public.idempotency_keys
    WHERE key = p_idempotency_key AND user_id = v_user_id;

    IF v_cached_response IS NOT NULL THEN
      RETURN v_cached_response;
    END IF;
  END IF;

  SELECT coins INTO v_current_coins
  FROM public.profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id uuid, quantity integer) LOOP
    DECLARE
      v_price integer;
      v_stock integer;
      v_vendor_id uuid;
      v_name text;
    BEGIN
      SELECT price, stock_quantity, vendor_id, name INTO v_price, v_stock, v_vendor_id, v_name
      FROM public.shop_items
      WHERE id = v_item.item_id AND is_active = true
      FOR UPDATE;

      IF v_price IS NULL THEN
        RAISE EXCEPTION 'Mahsulot topilmadi yoki faol emas: %', v_item.item_id;
      END IF;

      IF v_stock < v_item.quantity THEN
        RAISE EXCEPTION '% uchun zaxira yetarli emas: so''ralgan %, mavjud %', v_name, v_item.quantity, v_stock;
      END IF;

      v_total_cost := v_total_cost + (v_price * v_item.quantity);
    END;
  END LOOP;

  IF v_current_coins < v_total_cost THEN
    RAISE EXCEPTION 'Coin yetarli emas: kerak %, mavjud %', v_total_cost, v_current_coins;
  END IF;

  INSERT INTO public.orders (user_id, status, total_amount, idempotency_key)
  VALUES (v_user_id, 'paid', v_total_cost, p_idempotency_key)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id uuid, quantity integer) LOOP
    DECLARE
      v_price integer;
      v_vendor_id uuid;
    BEGIN
      SELECT price, vendor_id INTO v_price, v_vendor_id
      FROM public.shop_items
      WHERE id = v_item.item_id;

      UPDATE public.shop_items
      SET stock_quantity = stock_quantity - v_item.quantity
      WHERE id = v_item.item_id;

      INSERT INTO public.order_items (order_id, item_id, vendor_id, quantity, unit_price, status)
      VALUES (v_order_id, v_item.item_id, v_vendor_id, v_item.quantity, v_price, 'paid');

      INSERT INTO public.user_inventory (user_id, item_id, quantity)
      VALUES (v_user_id, v_item.item_id, v_item.quantity)
      ON CONFLICT (user_id, item_id)
      DO UPDATE SET quantity = user_inventory.quantity + v_item.quantity;
    END;
  END LOOP;

  UPDATE public.profiles
  SET coins = coins - v_total_cost,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  INSERT INTO public.coin_logs (user_id, amount, source, metadata)
  VALUES (v_user_id, -v_total_cost, 'marketplace_purchase', jsonb_build_object('order_id', v_order_id));

  v_cached_response := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total_amount', v_total_cost,
    'new_balance', v_current_coins - v_total_cost
  );

  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO public.idempotency_keys (key, user_id, response_data)
    VALUES (p_idempotency_key, v_user_id, v_cached_response);
  END IF;

  RETURN v_cached_response;
END;
$$;

-- ============================================================
-- 7. handle_new_user — xabarlarni o'zbekchaga
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
  existing_user_count integer;
BEGIN
  SET LOCAL row_security = off;

  IF NEW.email NOT LIKE '%_@__%.__%' THEN
    RAISE EXCEPTION 'Noto''g''ri email formati' USING ERRCODE = '23514';
  END IF;

  uname := NULLIF(
    trim(COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->'user_metadata'->>'username',
      split_part(NEW.email, '@', 1)
    )),
    ''
  );

  IF uname IS NULL THEN
    uname := 'user_' || replace(NEW.id::text, '-', '');
  END IF;

  SELECT COUNT(*) INTO existing_user_count
  FROM public.profiles p
  WHERE lower(p.username) = lower(uname);

  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Foydalanuvchi nomi allaqachon mavjud' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.profiles (
    user_id, username, xp, level, hearts, coins,
    created_at, updated_at, avatar_id, is_parent, streak_days
  ) VALUES (
    NEW.id, uname, 0, 1, 5, 0,
    NOW(), NOW(), 1, false, 0
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Foydalanuvchi nomi allaqachon mavjud' USING ERRCODE = '23505';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Profil yaratishda xatolik: %', SQLERRM USING ERRCODE = '50001';
END;
$$;

-- ============================================================
-- 8. Do'kon mahsulotlari nomlarini o'zbekchaga
-- ============================================================
UPDATE public.shop_items SET
  name        = 'Qo''shimcha yurak',
  description = '1 ta qo''shimcha yurak (keyinroq ishlatish uchun)'
WHERE name IN ('Super yurak', 'Extra Heart', 'Heart Refill', 'Qo''shiq yurak');

UPDATE public.shop_items SET
  name        = 'XP tezlashtirish',
  description = 'Keyingi darsda 2x XP oling'
WHERE name IN ('XP Boost', 'XP tezlashtirish', '100 XP tezlashtirish');

UPDATE public.shop_items SET
  name        = 'Avatar ochish',
  description = 'Yangi maxsus avatar ochish'
WHERE name IN ('Avatar Unlock', 'Avatar ochish');

UPDATE public.shop_items SET
  name        = 'Maslahat',
  description = 'Qiyin savollarda yordam olish'
WHERE name IN ('Hint', 'Maxsus savol', 'Hint Token');

UPDATE public.shop_items SET
  name        = 'Oltin ramka',
  description = 'Profil uchun maxsus oltin ramka'
WHERE name IN ('Yorqin avatar ramkasi', 'Gold Frame', 'Golden Frame');

UPDATE public.shop_items SET
  name        = 'Chempion nishoni',
  description = 'Profilingizda ko''rinadigan maxsus belgi'
WHERE name = 'Chempion nishoni';

UPDATE public.shop_items SET
  name        = 'Sirli sandiq',
  description = 'Tasodifiy mukofot uchun sandiq'
WHERE name = 'Sirli sandiq';

UPDATE public.shop_items SET
  name        = 'Oltin qalam',
  description = 'Darslarda +5 XP bonus beradi'
WHERE name IN ('Oltin Qalam', 'Golden Pencil');

UPDATE public.shop_items SET
  name        = 'Bilim sandig''i',
  description = 'Ichida tasodifiy sovg''alar bor'
WHERE name IN ('Bilim Sandig''i', 'Knowledge Box');

UPDATE public.shop_items SET
  name        = 'Kosmonavt avatari',
  description = 'Maxsus kosmonavt kiyimi'
WHERE name IN ('Kosmonavt Avatari', 'Astronaut Avatar');

-- ============================================================
-- 9. Yutuqlar (achievements) nomlarini o'zbekchaga
-- ============================================================
UPDATE public.achievements SET
  name        = 'Birinchi qadam',
  description = 'Birinchi darsingizni tugatdingiz!'
WHERE name IN ('First Step', 'First Lesson');

UPDATE public.achievements SET
  name        = 'Besh yulduz',
  description = '5 ta darsni mukammal tugatdingiz'
WHERE name IN ('Five Star', 'Perfect Five');

UPDATE public.achievements SET
  name        = 'Haftaning qahramoni',
  description = '7 kun ketma-ket o''rgandingiz'
WHERE name IN ('Week Warrior', 'Weekly Hero', '7 Day Streak');

UPDATE public.achievements SET
  name        = 'XP ustasi',
  description = '1000 XP to''pladingiz'
WHERE name IN ('XP Master', 'XP Champion');

UPDATE public.achievements SET
  name        = 'Matematik',
  description = '10 ta darsni tugatdingiz'
WHERE name IN ('Mathematician', 'Math Whiz');

UPDATE public.achievements SET
  name        = 'Mukammal o''quvchi',
  description = '100% aniqlik bilan dars tugatdingiz'
WHERE name IN ('Perfect Student', 'Perfectionist');

UPDATE public.achievements SET
  name        = 'Tezkor',
  description = '1 daqiqada darsni tugatdingiz'
WHERE name IN ('Speed Demon', 'Quick Learner', 'Fast Finisher');

UPDATE public.achievements SET
  name        = 'Izchil',
  description = '30 kun ketma-ket o''rgandingiz'
WHERE name IN ('Consistent', 'Dedicated', '30 Day Streak');
