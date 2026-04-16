-- Add acquired_from column to user_inventory table
-- This column tracks how items were acquired (purchase, reward, etc.)

BEGIN;

-- Check if column exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_inventory' 
        AND column_name = 'acquired_from'
    ) THEN
        ALTER TABLE public.user_inventory 
        ADD COLUMN acquired_from text DEFAULT 'unknown';
        
        RAISE NOTICE 'Added acquired_from column to user_inventory table';
    END IF;
END $$;

-- Update existing records to have 'unknown' as acquired_from
UPDATE public.user_inventory 
SET acquired_from = 'unknown' 
WHERE acquired_from IS NULL;

-- Add constraint for acquired_from values
ALTER TABLE public.user_inventory 
ADD CONSTRAINT IF NOT EXISTS user_inventory_acquired_from_check 
CHECK (acquired_from IN ('purchase', 'reward', 'gift', 'bonus', 'unknown'));

-- Add index for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_acquired_from 
ON public.user_inventory(acquired_from);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_user_acquired 
ON public.user_inventory(user_id, acquired_from);

COMMIT;
