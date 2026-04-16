-- Create orders and order_items tables for marketplace
-- These tables are required before creating marketplace functions

BEGIN;

-- ============================================================
-- 1. Create orders table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount bigint NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Create order_items table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    price_at_time bigint NOT NULL CHECK (price_at_time >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items table policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own order items" ON public.order_items
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
);

-- ============================================================
-- 3. Create user_inventory table (if not exists)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    acquired_from text DEFAULT 'unknown' CHECK (acquired_from IN ('purchase', 'reward', 'gift', 'bonus', 'unknown')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Unique constraint to prevent duplicate inventory items per user
    UNIQUE (user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- User inventory policies
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users can insert their own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.user_inventory;

CREATE POLICY "Users can view their own inventory" ON public.user_inventory
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON public.user_inventory
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.user_inventory
FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 4. Add triggers for updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Orders table trigger
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- User inventory trigger
DROP TRIGGER IF EXISTS user_inventory_updated_at ON public.user_inventory;
CREATE TRIGGER user_inventory_updated_at
    BEFORE UPDATE ON public.user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. Add performance indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON public.order_items(item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON public.order_items(created_at);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON public.user_inventory(item_id);
-- acquired_from index will be created after column is added

-- ============================================================
-- 6. Grant permissions
-- ============================================================

GRANT SELECT ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO authenticated;
GRANT UPDATE ON public.orders TO authenticated;

GRANT SELECT ON public.order_items TO authenticated;
GRANT INSERT ON public.order_items TO authenticated;

GRANT SELECT ON public.user_inventory TO authenticated;
GRANT INSERT ON public.user_inventory TO authenticated;
GRANT UPDATE ON public.user_inventory TO authenticated;

COMMIT;

-- ============================================================
-- Migration Summary
-- ============================================================
-- Created orders table with proper constraints
-- Created order_items table with foreign keys
-- Created user_inventory table with unique constraints
-- Added RLS policies for security
-- Added performance indexes
-- Added triggers for timestamp management
