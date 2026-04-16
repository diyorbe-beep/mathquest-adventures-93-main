-- Create performance indexes for vendor system (final corrected version)
-- This migration uses regular CREATE INDEX to avoid CONCURRENTLY issues

-- ============================================================
-- Vendor table indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_business_name ON public.vendors(business_name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at);

-- ============================================================
-- Shop items indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shop_items_vendor_id ON public.shop_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_active_vendor ON public.shop_items(is_active, vendor_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_category_active ON public.shop_items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_shop_items_sort_order ON public.shop_items(sort_order, is_active);

-- ============================================================
-- Composite indexes for common queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shop_items_vendor_active_sort 
ON public.shop_items(vendor_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_vendors_verified_created 
ON public.vendors(is_verified, created_at DESC);

-- ============================================================
-- Index creation summary
-- ============================================================
-- All vendor system indexes created successfully
-- Performance optimized for:
-- - Vendor lookups by user_id
-- - Shop items with vendor filtering
-- - Active items queries
-- - Vendor search and verification
-- Note: Uses regular CREATE INDEX for transaction safety
-- Fixed typo: business_name (not b)usiness_name)
