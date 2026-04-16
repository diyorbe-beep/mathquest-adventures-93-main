-- Fix vendor migration corruption and establish proper shop system relationships
-- This migration fixes the corrupted 20260412220000 migration and ensures data integrity

BEGIN;

-- ============================================================
-- 1. Drop corrupted vendor_id column if it exists in inconsistent state
-- ============================================================

DO $$
BEGIN
    -- Check if column exists and drop it to start fresh
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shop_items' 
        AND column_name = 'vendor_id'
    ) THEN
        ALTER TABLE public.shop_items DROP COLUMN vendor_id;
        RAISE NOTICE 'Dropped corrupted vendor_id column';
    END IF;
END $$;

-- ============================================================
-- 2. Recreate vendors table with proper schema
-- ============================================================

DROP TABLE IF EXISTS public.vendors CASCADE;

CREATE TABLE public.vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name text NOT NULL,
    description text,
    logo_url text,
    is_verified boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT vendors_business_name_length CHECK (length(business_name) >= 2 AND length(business_name) <= 100),
    CONSTRAINT vendors_user_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Add vendor_id to shop_items with proper constraints
-- ============================================================

ALTER TABLE public.shop_items 
ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Create proper RLS policies for vendors
-- ============================================================

-- Vendors table policies
DROP POLICY IF EXISTS "Vendors can view all" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert own" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update own" ON public.vendors;

CREATE POLICY "Vendors can view all" ON public.vendors FOR SELECT 
USING (true);

CREATE POLICY "Vendors can insert own" ON public.vendors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update own" ON public.vendors FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================================================
-- 5. Create official MathQuest vendor
-- ============================================================

DO $$
DECLARE
    v_admin_id uuid;
    v_vendor_id uuid;
BEGIN
    -- Get admin user_id
    SELECT user_id INTO v_admin_id 
    FROM public.user_roles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF v_admin_id IS NOT NULL THEN
        -- Create official MathQuest vendor
        INSERT INTO public.vendors (user_id, business_name, description, is_verified)
        VALUES (
            v_admin_id, 
            'MathQuest Official', 
            'Rasmiy MathQuest do''koni - original mahsulotlar', 
            true
        )
        ON CONFLICT (user_id) DO UPDATE SET 
            business_name = EXCLUDED.business_name,
            is_verified = true
        RETURNING id INTO v_vendor_id;
        
        RAISE NOTICE 'Created official vendor with ID: %', v_vendor_id;
        
        -- Update all shop items to reference official vendor
        UPDATE public.shop_items 
        SET vendor_id = v_vendor_id 
        WHERE vendor_id IS NULL;
        
        RAISE NOTICE 'Updated % shop items to reference official vendor', 
            (SELECT COUNT(*) FROM public.shop_items WHERE vendor_id = v_vendor_id);
    ELSE
        -- Fallback: create system vendor if no admin found
        INSERT INTO public.vendors (id, user_id, business_name, description, is_verified)
        VALUES (
            '00000000-0000-0000-0000-000000000001'::uuid,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'MathQuest System',
            'Tizim do''koni',
            true
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Update shop items with system vendor
        UPDATE public.shop_items 
        SET vendor_id = '00000000-0000-0000-0000-000000000001'::uuid
        WHERE vendor_id IS NULL;
    END IF;
END $$;

-- ============================================================
-- 6. Add triggers for updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendors_updated_at ON public.vendors;
CREATE TRIGGER vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. Data validation and constraints
-- ============================================================

-- Ensure all shop items have a vendor
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.shop_items WHERE vendor_id IS NULL LIMIT 1) THEN
        RAISE EXCEPTION 'Critical: Some shop items still have no vendor_id. Migration failed.';
    END IF;
    
    -- Verify vendors table has data
    IF (SELECT COUNT(*) FROM public.vendors) = 0 THEN
        RAISE EXCEPTION 'Critical: Vendors table is empty after migration.';
    END IF;
    
    RAISE NOTICE 'Vendor migration validation passed. Vendors: %, Items with vendors: %', 
        (SELECT COUNT(*) FROM public.vendors),
        (SELECT COUNT(*) FROM public.shop_items WHERE vendor_id IS NOT NULL);
END $$;

-- ============================================================
-- 9. Update RLS policies for shop_items to include vendor access
-- ============================================================

DROP POLICY IF EXISTS "Shop items are viewable by everyone" ON public.shop_items;
CREATE POLICY "Shop items are viewable by everyone" ON public.shop_items FOR SELECT 
USING (is_active = true);

COMMIT;

-- ============================================================
-- 5. Add performance indexes (outside transaction)
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_business_name ON public.vendors(business_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_vendor_id ON public.shop_items(vendor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_items_active_vendor ON public.shop_items(is_active, vendor_id);

-- ============================================================
-- Migration Summary
-- ============================================================
-- Fixed corrupted vendor migration
-- Established proper vendor-item relationships
-- Added performance indexes
-- Implemented proper RLS policies
-- Created official MathQuest vendor
-- Validated data integrity
