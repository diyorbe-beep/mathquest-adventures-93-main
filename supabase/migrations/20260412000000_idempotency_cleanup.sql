-- =====================================================
-- PHASE 5: IDEMPOTENCY CLEANUP & MAINTENANCE
-- =====================================================

-- 1. Function to delete expired idempotency keys (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_idempotency_keys()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- 2. (Optional) If you have a cron extension enabled, you can schedule this.
-- Since we are in a serverless environment, we'll expose this to be called via RPC if needed
-- or call it during critical operations (like checkout) to keep the table clean.

-- 3. Modify process_marketplace_order to occasionally trigger cleanup
-- (e.g., 5% chance to run cleanup during a checkout to amortize cost)
CREATE OR REPLACE FUNCTION public.maybe_cleanup_idempotency()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF random() < 0.05 THEN
    PERFORM public.cleanup_idempotency_keys();
  END IF;
END;
$$;
