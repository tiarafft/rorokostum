# Quick Start Guide - Roro Kostum

Panduan super cepat untuk setup project dalam 10 menit.

## ⚡ Prerequisites

- Node.js 18+
- Akun Supabase (gratis)

## 🚀 5 Langkah Setup

### 1️⃣ Clone & Install (2 menit)

```bash
# Clone project
git clone <repo-url>
cd roro-kostum

# Install dependencies
npm install
```

### 2️⃣ Setup Supabase (3 menit)

1. Buat project baru di [supabase.com](https://app.supabase.com)
2. Copy **Project URL** dan **anon key** dari Settings → API
3. Buat file `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3️⃣ Run Migrations (2 menit)

Di Supabase Dashboard → SQL Editor, jalankan file-file ini secara berurutan:

1. `supabase/migrations/20251217003742_create_roro_kostum_schema.sql`
2. `supabase/migrations/20251217030220_create_orders_table.sql`
3. `supabase/migrations/20251217031942_add_quantity_to_kostum.sql`
4. `supabase/migrations/20251217033053_add_kuantitas_to_orders.sql`
5. `supabase/migrations/20251217042450_create_kostum_images_bucket.sql`
6. `supabase/migrations/20251217065200_add_social_media_settings.sql`

**Atau copy-paste satu per satu ke SQL Editor dan klik Run.**

### 4️⃣ Buat Admin User (1 menit)

Di Supabase SQL Editor, jalankan:

```sql
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id
) VALUES (
  gen_random_uuid(), 'admin@rorokostum.com',
  crypt('Admin123!', gen_salt('bf')), NOW(),
  '{"provider":"email","providers":["email"]}', '{}',
  NOW(), NOW(), 'authenticated', '00000000-0000-0000-0000-000000000000'
);
```

**Login:** `admin@rorokostum.com` / `Admin123!`

### 5️⃣ Run Project (1 menit)

```bash
npm run dev
```

Buka: `http://localhost:5173`

## ✅ First Steps After Login

1. Login ke admin: `/admin/login`
2. Buka **Settings** → Isi WhatsApp number (format: `628123456789`)
3. Buka **Kategori** → Tambah kategori (contoh: "Superhero")
4. Buka **Kostum** → Tambah kostum pertama dengan gambar
5. Cek homepage - kostum harus muncul!

## 📚 Dokumentasi Lengkap

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Panduan lengkap setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Cara deploy ke hosting
- **[CREATE_ADMIN.md](./CREATE_ADMIN.md)** - Detail membuat admin user
- **[README.md](./README.md)** - Overview project

## 🆘 Troubleshooting

**Problem:** CORS error
**Fix:** Check `.env` file, pastikan URL benar

**Problem:** Images tidak muncul
**Fix:** Verify storage bucket `kostum-images` ada dan public

**Problem:** Admin tidak bisa login
**Fix:** Disable email confirmation di Supabase Auth settings

## 🎯 Next Steps

- [ ] Setup prosedur sewa di Settings
- [ ] Tambah kategori lengkap
- [ ] Upload kostum dengan gambar
- [ ] Test order tracking
- [ ] Setup social media links
- [ ] Setup Google Maps
- [ ] Deploy ke production

---

**Need Help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) untuk detail lengkap!
