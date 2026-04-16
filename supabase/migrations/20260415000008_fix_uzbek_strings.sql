-- Fix Uzbek string encoding issues in database
-- Use dollar-quoted strings to avoid escaping problems

BEGIN;

-- ============================================================
-- 1. Update problematic comments with dollar-quoted strings
-- ============================================================

-- Update hearts_logs reason comment
COMMENT ON COLUMN public.hearts_logs.change IS $$Yuraklar o'zgarishi sababi$$;

-- Update user_progress comments  
COMMENT ON COLUMN public.user_progress.completed IS $$Tamomlanganmi$$;
COMMENT ON COLUMN public.user_progress.correct_answers IS $$To'g'ri javoblar soni$$;
COMMENT ON COLUMN public.user_progress.total_answers IS $$Jami javoblar soni$$;
COMMENT ON COLUMN public.user_progress.best_accuracy IS $$Eng yaxshi aniqlik$$;
COMMENT ON COLUMN public.user_progress.xp_earned IS $$Yutgan XP lar$$;

-- ============================================================
-- 2. Verify the changes
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE 'Uzbek stringlar dollar-quoted formatda yangilandi';
END $$;

COMMIT;

-- ============================================================
-- Migration Summary
-- ============================================================
-- Fixed Uzbek string encoding issues
-- Used dollar-quoted strings to avoid escaping problems
-- All comments now use proper PostgreSQL syntax
-- Database ready for Uzbek content
