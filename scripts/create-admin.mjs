/**
 * Bir martalik: Supabase-da administrator foydalanuvchi + admin roli.
 *
 * Talab: .env faylida VITE_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY
 * (Supabase Dashboard → Settings → API → service_role — hech kimga bermang).
 *
 * Ishlatish: npm run bootstrap:admin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadRootEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadRootEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@example.com';
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeMeAdmin123!';
const username = process.env.BOOTSTRAP_ADMIN_USERNAME || 'admin';

if (!url || !serviceKey) {
  console.error('\n❌ .env da yetishmayapti:\n');
  if (!url) {
    console.error('   • VITE_SUPABASE_URL — loyiha URL (masalan https://xxxx.supabase.co)\n');
  } else {
    console.error('   • VITE_SUPABASE_URL — OK\n');
  }
  if (!serviceKey) {
    console.error('   • SUPABASE_SERVICE_ROLE_KEY — yo‘q\n');
    console.error(
      '\n   Qayerdan olish:\n' +
        '   1) https://supabase.com/dashboard → loyihangiz\n' +
        '   2) chap menyu: Project Settings → API\n' +
        '   3) "Project API keys" → service_role (Secret) → Copy\n' +
        '   4) .env faylida yangi qator: SUPABASE_SERVICE_ROLE_KEY=... (qiymatni tirnoqsiz yozing)\n' +
        '      SUPABASE_SERVICE_ROLE_KEY=bu_yerga_nusxa\n' +
        '\n   Xavfsizlik: bu kalit barcha ma’lumotlarni ochadi — faqat lokal .env da saqlang.\n',
    );
  }
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const found = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found.id;
    if (users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log('\n📌 Administrator yaratilmoqda / yangilanmoqda...\n');

  let userId;

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createErr) {
    const msg = createErr.message || '';
    if (/already|registered|exists/i.test(msg)) {
      userId = await findUserIdByEmail(email);
      if (!userId) throw createErr;
      console.log('ℹ️  Bu email allaqachon mavjud — rolni yangilaymiz.\n');
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
    console.log('✅ Yangi foydalanuvchi yaratildi.\n');
  }

  const { error: roleErr } = await supabase.from('user_roles').upsert(
    { user_id: userId, role: 'admin' },
    { onConflict: 'user_id,role' },
  );
  if (roleErr) throw roleErr;

  console.log('✅ Administrator roli biriktirildi.\n');
  console.log('─── /admin uchun kirish ───');
  console.log('   Login (email):', email);
  console.log('   Parol:        ', password);
  console.log('──────────────────────────\n');
  console.log(
    'Lovable foydalanuvchilari: service_role kerak emas — LOVABLE_ADMIN.txt va supabase/manual/grant-admin.sql dan foydalaning.\n',
  );
}

main().catch((e) => {
  console.error('❌ Xato:', e.message || e);
  process.exit(1);
});
