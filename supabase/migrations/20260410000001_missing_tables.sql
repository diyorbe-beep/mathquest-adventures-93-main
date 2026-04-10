-- =====================================================
-- CRITICAL PRODUCTION FIXES - Part 2: Missing Tables & Types
-- =====================================================

-- Add missing shop_items table to database schema
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

-- Add missing user_inventory table to database schema
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shop_items_active ON public.shop_items(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON public.user_inventory(item_id);

-- Enable RLS
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Add sample shop items
INSERT INTO public.shop_items (name, description, price, icon, category, sort_order) VALUES
  ('Qo''shiq yurak', '5 ta qo''shiq yurak', 50, '❤️', 'hearts', 1),
  ('XP tezlashtirish', '100 XP tezlashtirish', 100, '⚡', 'boost', 2),
  ('Avatar ochish', 'Yangi avatar ochish', 200, '👤', 'avatar', 3),
  ('Maxsus savol', 'Maxsus savolga yordam', 150, '💡', 'hint', 4)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
