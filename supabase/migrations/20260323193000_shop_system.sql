-- Coin economy + shop system
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0;

-- Cheklov allaqachon bo‘lsa qayta qo‘shmaslik (42710 xatosini oldini olish)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_coins_non_negative'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_coins_non_negative CHECK (coins >= 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price integer NOT NULL CHECK (price > 0),
  icon text NOT NULL DEFAULT '🎁',
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.coin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  source text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_logs ENABLE ROW LEVEL SECURITY;

-- Policy nomlari allaqachon bo‘lsa qayta yaratmaslik (42710)
DROP POLICY IF EXISTS "Shop items viewable by everyone" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Users view own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users insert own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users update own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Admins view all inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users view own coin logs" ON public.coin_logs;
DROP POLICY IF EXISTS "Users insert own coin logs" ON public.coin_logs;
DROP POLICY IF EXISTS "Admins view all coin logs" ON public.coin_logs;

CREATE POLICY "Shop items viewable by everyone"
  ON public.shop_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shop items"
  ON public.shop_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own inventory"
  ON public.user_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own inventory"
  ON public.user_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own inventory"
  ON public.user_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all inventory"
  ON public.user_inventory FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own coin logs"
  ON public.coin_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coin logs"
  ON public.coin_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all coin logs"
  ON public.coin_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

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

  RETURN QUERY
  SELECT true, 'Sotib olindi', (v_coins - v_price);
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_shop_item(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_shop_items_active_sort ON public.shop_items(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_logs_user_created ON public.coin_logs(user_id, created_at DESC);

INSERT INTO public.shop_items (name, description, price, icon, category, sort_order)
VALUES
  ('Super yurak', '1 ta qo‘shimcha yurak (keyinroq ishlatish uchun)', 40, '❤️', 'boost', 1),
  ('Yorqin avatar ramkasi', 'Profil uchun maxsus oltin ramka', 120, '✨', 'cosmetic', 2),
  ('Chempion nishoni', 'Profilingizda ko‘rinadigan maxsus belgi', 180, '🏅', 'badge', 3),
  ('Sirli sandiq', 'Tasodifiy mukofot uchun sandiq', 90, '🎁', 'mystery', 4)
ON CONFLICT (name) DO NOTHING;
