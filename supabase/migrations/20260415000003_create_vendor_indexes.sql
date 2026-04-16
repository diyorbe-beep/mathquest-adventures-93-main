-- Create performance indexes for vendor system
-- This migration runs separately to avoid CONCURRENTLY transaction issues

-- ============================================================
-- Vendor table indexes
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_business_name ON public.vendors(business_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at);

-- ============================================================
-- Shop items indexes
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_vendor_id ON public.shop_items(vendor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_active_vendor ON public.shop_items(is_active, vendor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_category_active ON public.shop_items(category, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_sort_order ON public.shop_items(sort_order, is_active);

-- ============================================================
-- Composite indexes for common queries
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_vendor_active_sort 
ON public.shop_items(vendor_id, is_active, sort_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_verified_created 
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
