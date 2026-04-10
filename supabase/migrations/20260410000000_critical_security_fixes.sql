-- =====================================================
-- CRITICAL PRODUCTION FIXES - Part 1: Security & Atomic Operations
-- =====================================================

-- 1. Fix Authentication Triggers (resolve 500 errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- 2. Create Secure User Creation Function
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
  -- Disable RLS for this operation
  SET LOCAL row_security = off;
  
  -- Validate email format
  IF NEW.email NOT LIKE '%_@__%.__%' THEN
    RAISE EXCEPTION 'Invalid email format' USING ERRCODE = '23514';
  END IF;
  
  -- Extract username with multiple fallbacks
  uname := NULLIF(
    trim(COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->'user_metadata'->>'username',
      split_part(NEW.email, '@', 1)
    )),
    ''
  );
  
  -- Generate username if none provided
  IF uname IS NULL THEN
    uname := 'user_' || replace(NEW.id::text, '-', '');
  END IF;
  
  -- Check for username conflicts (case-insensitive)
  SELECT COUNT(*) INTO existing_user_count
  FROM public.profiles p
  WHERE lower(p.username) = lower(uname);
  
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Username already exists' USING ERRCODE = '23505';
  END IF;
  
  -- Create profile with validation
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
    RAISE EXCEPTION 'Username already exists' USING ERRCODE = '23505';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Profile creation failed: %', SQLERRM USING ERRCODE = '50001';
END;
$$;

-- 3. Create Role Assignment Function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = off;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
  -- Don't fail user creation if role assignment fails
  RETURN NEW;
END;
$$;

-- 4. Create Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 5. Atomic Purchase Function (prevent race conditions)
CREATE OR REPLACE FUNCTION public.purchase_item(
  p_user_id uuid,
  p_item_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS TABLE(
  success boolean,
  new_balance integer,
  message text
)
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
  
  -- Lock user profile to prevent race conditions
  SELECT coins INTO current_coins
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Get item details
  SELECT price, name INTO item_price, item_name
  FROM public.shop_items
  WHERE id = p_item_id AND is_active = true;
  
  IF item_price IS NULL THEN
    RETURN QUERY SELECT false, current_coins, 'Item not found or inactive'::text;
    RETURN;
  END IF;
  
  -- Calculate total cost
  total_cost := item_price * p_quantity;
  
  -- Validate sufficient balance
  IF current_coins < total_cost THEN
    RETURN QUERY SELECT false, current_coins, 'Insufficient coins'::text;
    RETURN;
  END IF;
  
  -- Perform atomic transaction
  UPDATE public.profiles
  SET coins = coins - total_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Add to inventory
  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (p_user_id, p_item_id, p_quantity)
  ON CONFLICT (user_id, item_id) 
  DO UPDATE SET quantity = user_inventory.quantity + p_quantity;
  
  -- Log transaction
  INSERT INTO public.coin_logs (
    user_id, amount, source, metadata
  ) VALUES (
    p_user_id, -total_cost, 'shop_purchase', 
    json_build_object('item_id', p_item_id, 'item_name', item_name, 'quantity', p_quantity)
  );
  
  -- Return success
  RETURN QUERY SELECT true, (current_coins - total_cost), 'Purchase successful'::text;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Purchase failed: %', SQLERRM USING ERRCODE = '50002';
END;
$$;

-- 6. Server-Side XP Validation Function
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_lesson_id uuid,
  p_amount integer,
  p_source text DEFAULT 'lesson'
)
RETURNS TABLE(
  success boolean,
  new_level integer,
  new_xp integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  current_level integer;
  new_level_val integer;
  new_xp_val integer;
  max_daily_xp integer := 1000; -- Daily XP cap
  xp_today integer;
BEGIN
  SET LOCAL row_security = off;
  
  -- Get current stats
  SELECT xp, level INTO current_xp, current_level
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check daily XP limit
  SELECT COALESCE(SUM(amount), 0) INTO xp_today
  FROM public.xp_logs
  WHERE user_id = p_user_id
    AND source = p_source
    AND DATE(created_at) = CURRENT_DATE;
  
  IF xp_today + p_amount > max_daily_xp THEN
    RETURN QUERY SELECT false, current_level, current_xp, 'Daily XP limit exceeded'::text;
    RETURN;
  END IF;
  
  -- Validate XP amount
  IF p_amount <= 0 OR p_amount > 100 THEN
    RETURN QUERY SELECT false, current_level, current_xp, 'Invalid XP amount'::text;
    RETURN;
  END IF;
  
  -- Calculate new values
  new_xp_val := current_xp + p_amount;
  new_level_val := FLOOR(new_xp_val / 100) + 1;
  
  -- Update profile
  UPDATE public.profiles
  SET xp = new_xp_val,
      level = new_level_val,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log XP award
  INSERT INTO public.xp_logs (
    user_id, amount, source, lesson_id
  ) VALUES (
    p_user_id, p_amount, p_source, p_lesson_id
  );
  
  RETURN QUERY SELECT true, new_level_val, new_xp_val, 'XP awarded successfully'::text;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'XP award failed: %', SQLERRM USING ERRCODE = '50003';
END;
$$;

-- 7. Enhanced RLS Policies
ALTER TABLE public.profiles DROP POLICY IF EXISTS "Users can view own profile";
ALTER TABLE public.profiles DROP POLICY IF EXISTS "Users can update own profile";

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Coin Transaction Logging Policy
ALTER TABLE public.coin_logs DROP POLICY IF EXISTS "Users can view own coin logs";

CREATE POLICY "Users can view own coin logs" ON public.coin_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 9. Shop Policies (read-only for users)
ALTER TABLE public.shop_items DROP POLICY IF EXISTS "Anyone can view active items";

CREATE POLICY "Anyone can view active items" ON public.shop_items
  FOR SELECT USING (is_active = true);

-- 10. Inventory Policies
ALTER TABLE public.user_inventory DROP POLICY IF EXISTS "Users can view own inventory";
ALTER TABLE public.user_inventory DROP POLICY IF EXISTS "Users can update own inventory";

CREATE POLICY "Users can view own inventory" ON public.user_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON public.user_inventory
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CRITICAL FIXES COMPLETE
-- =====================================================
