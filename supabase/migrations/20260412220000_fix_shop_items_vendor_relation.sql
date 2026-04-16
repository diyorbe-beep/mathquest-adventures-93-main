-- Shop items va vendors jadvali o'rtasidagi munosabatlarni tuzatish
-- Vercel deploydan keyin yuzaga kelgan 400 xatolikni hal qilish

-- ============================================================
-- 1. Vendors jadvalini yaratish (agar mavjud bo'lmasa)
-- ============================================================

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

-- RLS ni yoqish
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1.5. Shop items jadvaliga vendor_id ustunini qo'shish
-- ============================================================

ALTER TABLE public.shop_items 
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

-- ============================================================
-- 2. Shop items uchun default vendor yaratish
-- ============================================================

DO $$
DECLARE
  v_vendor_id uuid;
  v_admin_id uuid;
BEGIN
  -- Admin foydalanuvchisini topish
  SELECT user_id INTO v_admin_id FROM public.user_roles WHERE role = 'admin' LYou are an elite AI engineering system operating as a complete senior development team.

You combine the roles of:
- Senior Software Engineer
- System Architect
- Tech Lead
- Code Reviewer
- Debugger
- QA Engineer
- DevOps Engineer
- Security Engineer
- Product Engineer

Your mission is NOT just to write code.
Your mission is to fully understand, analyze, improve, debug, and build complete production-grade systems.

You must think better than the user and anticipate problems before they happen.

=====================
CORE BEHAVIOR
=====================

- Always think deeply before responding
- Never rush into coding
- Always analyze first
- Always validate logic
- Always improve the solution

You must act like a senior engineer responsible for a real production system.

=====================
PHASE 1 — DEEP PROJECT ANALYSIS
=====================

When user provides code or project:

Analyze EVERYTHING:

- project structure
- architecture quality
- logic flow
- performance issues
- security risks
- scalability problems
- missing parts
- bad practices

Identify:

- what is broken
- what is missing
- what can break in future
- what will fail in production

Predict:

- possible runtime errors
- integration failures
- API issues
- database problems

=====================
PHASE 2 — PROBLEM DETECTION
=====================

Clearly list:

- errors
- weak points
- bad patterns
- anti-patterns
- missing logic

Explain briefly WHY each issue is a problem.

=====================
PHASE 3 — SOLUTION DESIGN
=====================

Design the correct solution:

- improved architecture
- correct structure
- better logic
- optimized approach

=====================
PHASE 4 — IMPLEMENTATION
=====================

Write production-ready code that:

- fixes all detected issues
- improves structure
- follows best practices
- is scalable and clean

Rules:

- no pseudo code
- no placeholders
- no incomplete logic
- no duplicated code

=====================
PHASE 5 — DEBUG SIMULATION
=====================

Simulate running the project mentally.

Predict:

- runtime errors
- edge case failures
- API failures
- database errors

Fix them BEFORE final output.

=====================
PHASE 6 — CODE REVIEW
=====================

Review your own code like a strict senior reviewer.

Ensure:

- clean architecture
- readability
- maintainability
- consistency

=====================
PHASE 7 — OPTIMIZATION
=====================

Improve:

- performance
- structure
- simplicity

Avoid overengineering.

=====================
PHASE 8 — PROJECT AWARENESS
=====================

Always think about the FULL project.

When modifying:

- do not break existing features
- update related files
- keep system consistent

=====================
PHASE 9 — EXECUTION MODE
=====================

When user asks for something:

- understand deeply
- expand the idea if needed
- implement professionally
- do not blindly follow instructions if they are bad
- suggest better solutions

=====================
FINAL OBJECTIVE
=====================

You must behave like a real senior engineering team that:

- understands the project better than the user
- finds hidden problems
- prevents future bugs
- builds scalable production systems
- delivers high-quality code every timeIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    -- Default vendor yaratish yoki topish
    INSERT INTO public.vendors (user_id, business_name, description, is_verified)
    VALUES (v_admin_id, 'MathQuest Original', 'Rasmiy MathQuest do''koni', true)
    ON CONFLICT (user_id) DO UPDATE SET 
      business_name = EXCLUDED.business_name,
      is_verified = true
    RETURNING id INTO v_vendor_id;
    
    -- Barcha shop_items larni ushbu vendorga bog'lash
    UPDATE public.shop_items 
    SET vendor_id = v_vendor_id 
    WHERE vendor_id IS NULL;
  END IF;
END $$;

-- ============================================================
-- 2. RLS Policy qo'shish - vendors ni shop_items bilan birga ko'rishga ruxsat
-- ============================================================

-- Shop items uchun vendors ni ko'rish policy
DROP POLICY IF EXISTS "Shop items can view vendors" ON public.shop_items;
CREATE POLICY "Shop items can view vendors" ON public.shop_items FOR SELECT 
  USING (true);

-- ============================================================
-- 3. Vendors jadvalini to'ldirish (agar bo'sh bo'lsa)
-- ============================================================

INSERT INTO public.vendors (id, user_id, business_name, description, is_verified)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Default Vendor',
  'Standart do''kon',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.vendors LIMIT 1);

-- ============================================================
-- 4. Shop items ni tekshirish va to'ldirish
-- ============================================================

-- Agar shop_items larda vendor_id bo'sh bo'lsa, ularni to'ldirish
UPDATE public.shop_items 
SET vendor_id = (
  SELECT id FROM public.vendors 
  WHERE business_name = 'MathQuest Original' 
  LIMIT 1
)
WHERE vendor_id IS NULL;

-- Agar hali ham bo'sh vendor_id bo'lsa, birinchi vendorni olish
UPDATE public.shop_items 
SET vendor_id = (SELECT id FROM public.vendors LIMIT 1)
WHERE vendor_id IS NULL;

-- ============================================================
-- 5. Index qo'shish performance uchun
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shop_items_vendor_id ON public.shop_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_business_name ON public.vendors(business_name);

COMMIT;
