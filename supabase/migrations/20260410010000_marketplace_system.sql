-- =====================================================
-- PHASE 3: MARKETPLACE SYSTEM COMPLETION
-- =====================================================

-- 1. Add 'vendor' role to app_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'vendor') THEN
    ALTER TYPE public.app_role ADD VALUE 'vendor';
  END IF;
END $$;

-- 2. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- 3. Update Shop Items for Marketplace
ALTER TABLE public.shop_items 
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 999 CHECK (stock_quantity >= 0);

-- 4. Order System
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Idempotency Support
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Vendors
CREATE POLICY "Vendors viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Users can create own vendor profile" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update own profile" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Vendors can view orders for their items" ON public.orders FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.vendors v ON oi.vendor_id = v.id 
    WHERE oi.order_id = public.orders.id AND v.user_id = auth.uid()
  ));

-- Order Items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Vendors can view/update own order items" ON public.order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

-- 8. Atomic Order Processing Function
CREATE OR REPLACE FUNCTION public.process_marketplace_order(
  p_items jsonb, -- Array of {item_id, quantity}
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
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 1. Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    SELECT response_data INTO v_cached_response 
    FROM public.idempotency_keys 
    WHERE key = p_idempotency_key AND user_id = v_user_id;
    
    IF v_cached_response IS NOT NULL THEN
      return v_cached_response;
    END IF;
  END IF;

  -- 2. Lock user profile
  SELECT coins INTO v_current_coins
  FROM public.profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- 3. Calculate total and validate items/stock
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
        RAISE EXCEPTION 'Item % not found or inactive', v_item.item_id;
      END IF;

      IF v_stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for %: requested %, available %', v_name, v_item.quantity, v_stock;
      END IF;

      v_total_cost := v_total_cost + (v_price * v_item.quantity);
    END;
  END LOOP;

  -- 4. Check balance
  IF v_current_coins < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient coins: need %, have %', v_total_cost, v_current_coins;
  END IF;

  -- 5. Create Order
  INSERT INTO public.orders (user_id, status, total_amount, idempotency_key)
  VALUES (v_user_id, 'paid', v_total_cost, p_idempotency_key)
  RETURNING id INTO v_order_id;

  -- 6. Process Items (Update stock, create order_items, update user inventory)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id uuid, quantity integer) LOOP
    DECLARE
      v_price integer;
      v_vendor_id uuid;
    BEGIN
      SELECT price, vendor_id INTO v_price, v_vendor_id
      FROM public.shop_items
      WHERE id = v_item.item_id;

      -- Update stock
      UPDATE public.shop_items
      SET stock_quantity = stock_quantity - v_item.quantity
      WHERE id = v_item.item_id;

      -- Create order item
      INSERT INTO public.order_items (order_id, item_id, vendor_id, quantity, unit_price, status)
      VALUES (v_order_id, v_item.item_id, v_vendor_id, v_item.quantity, v_price, 'paid');

      -- Update user inventory (for digital/instant items)
      INSERT INTO public.user_inventory (user_id, item_id, quantity)
      VALUES (v_user_id, v_item.item_id, v_item.quantity)
      ON CONFLICT (user_id, item_id) 
      DO UPDATE SET quantity = user_inventory.quantity + v_item.quantity;
    END;
  END LOOP;

  -- 7. Deduct coins and log
  UPDATE public.profiles
  SET coins = coins - v_total_cost,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  INSERT INTO public.coin_logs (user_id, amount, source, metadata)
  VALUES (v_user_id, -v_total_cost, 'marketplace_purchase', jsonb_build_object('order_id', v_order_id));

  -- 8. Save idempotency
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

-- 9. Trigger for updating updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_vendor ON public.shop_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON public.order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_user ON public.idempotency_keys(user_id);

-- 11. Initial Marketplace Data
DO $$
DECLARE
  v_admin_id uuid;
  v_vendor_id uuid;
BEGIN
  -- Get first admin or user to be the sample vendor
  SELECT user_id INTO v_admin_id FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.vendors (user_id, business_name, description, is_verified)
    VALUES (v_admin_id, 'MathQuest Original', 'Rasmiy MathQuest do''koni', true)
    ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name
    RETURNING id INTO v_vendor_id;

    -- Update existing items to belong to this vendor
    UPDATE public.shop_items SET vendor_id = v_vendor_id, stock_quantity = 500 WHERE vendor_id IS NULL;

    -- Add some new marketplace items
    INSERT INTO public.shop_items (name, description, price, icon, category, vendor_id, stock_quantity, sort_order)
    VALUES 
      ('Oltin Qalam', 'Darslarda +5 XP bonus beradi', 350, '✏️', 'boost', v_vendor_id, 50, 10),
      ('Bilim Sandig''i', 'Ichida tasodifiy sovg''alar bor', 500, '📦', 'general', v_vendor_id, 100, 11),
      ('Kosmonavt Avatari', 'Maxsus kosmonavt kiyimi', 1000, '👨‍🚀', 'avatar', v_vendor_id, 10, 12)
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;
