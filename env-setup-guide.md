# Environment Setup Guide

## 🚨 Muammo Tahlili

Sizda authentication xatolari bor:
- **Production URL**: `https://islpljvewctjqetrrgfy.supabase.co`
- **Local Development**: `http://localhost:8080`

## 🔧 Yechimlar

### 1. Local Development uchun Environment

`.env.local` faylini yaratingiz:

```bash
# .env.local faylini yaratish
cp .env.local.example .env.local
```

`.env.local` mazmuni:
```env
# Local Development Environment Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your_local_development_key_here
```

### 2. Supabase Local Setup

Agar sizda local Supabase yo'qsa:

```bash
# 1. Supabase CLI o'rnatish
npm install -g supabase

# 2. Local project initialization
supabase init

# 3. Local database start
supabase start
```

### 3. Authentication Debug

`src/contexts/AuthContext.tsx` da debug qo'shing:

```typescript
// Development uchun debug loglar
if (import.meta.env.DEV) {
  console.log('Auth attempt:', { email, passwordLength: password.length });
}
```

## 🔍 Tekshirish Qadamlari

### 1. Environment Variables
```bash
# Joriy environmentni tekshirish
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY
```

### 2. Supabase Connection
```bash
# Supabase ulanishni tekshirish
curl -I "$VITE_SUPABASE_URL/rest/v1/"
```

### 3. Authentication Flow
```bash
# Login funksiyasini test qilish
npm run test
```

## 📋 Qadam-baqadam Yo'l-yo'ri

1. ✅ `.env.local` faylini yaratingiz
2. ✅ Supabase local database'ni ishga tushuringiz  
3. ✅ Authentication ni test qilingiz
4. ✅ Production uchun `.env` faylni sozlang

## 🚀 Production Deployment

Production uchun `.env` fayl:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_key_here
```

## 🎯 Natija

Environment muammosini to'g'ri hal qilish uchun bu qadam-baqadam yo'ri-ni bajaring!
