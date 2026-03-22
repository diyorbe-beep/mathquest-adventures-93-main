-- =============================================================================
-- Lovable / Supabase: o'zingizga ADMIN roli (service_role kaliti SHART EMAS)
-- =============================================================================
-- 1) Ilovada /auth dan oddiy hisob oching (email + parol eslab qoling).
-- 2) Supabase oching:
--    - Lovable: loyiha sozlamalari / "Open in Supabase" yoki "Database"
--    - yoki https://supabase.com/dashboard → loyihangiz
-- 3) Authentication → Users → o'z emailingizni toping → UUID ni nusxalang.
-- 4) PASTDAKI 'PASTE_USER_UUID_HERE' ni shu UUID bilan almashtiring.
-- 5) SQL Editor da ushbu skriptni ishga tushiring.
-- =============================================================================

insert into public.user_roles (user_id, role)
values ('7ccea50c-e270-41e3-8618-2e50a5e94b54'::uuid, 'admin')
on conflict (user_id, role) do nothing;

-- Tekshirish: user_roles jadvalida qator paydo bo'lishi kerak.
