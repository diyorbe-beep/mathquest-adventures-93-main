-- Drop existing marketplace functions to recreate them cleanly
-- This resolves function signature conflicts

BEGIN;

-- ============================================================
-- 1. Drop existing marketplace function
-- ============================================================

DROP FUNCTION IF EXISTS public.process_marketplace_order(jsonb, text);

-- ============================================================
-- 2. Drop related cleanup function
-- ============================================================

DROP FUNCTION IF EXISTS public.cleanup_old_idempotent_orders() CASCADE;

COMMIT;

-- ============================================================
-- Migration Summary
-- ============================================================
-- Dropped existing marketplace functions
-- Ready for clean recreation
-- This resolves function signature conflicts
