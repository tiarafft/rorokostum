# Quick Guide: Membuat Super Admin Pertama

## Langkah Cepat (Via Supabase Dashboard)

### 1. Buat User di Supabase Auth

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Authentication** di menu kiri
4. Klik tab **Users**
5. Klik tombol **Add user** (hijau, pojok kanan atas)
6. Pilih **Create new user**
7. Isi form:
   ```
   Email: admin@rorokostum.com
   Password: [password yang aman, minimal 6 karakter]
   Auto Confirm User: ✅ (centang ini!)
   ```
8. Klik **Create user**
9. **PENTING**: Copy **User UUID** yang muncul (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### 2. Tambahkan ke Tabel admin_users

1. Masih di Supabase Dashboard, klik **Table Editor** di menu kiri
2. Pilih tabel **admin_users**
3. Klik tombol **Insert** → **Insert row**
4. Isi data:
   ```
   user_id: [paste User UUID dari step 1]
   email: admin@rorokostum.com
   name: Super Admin Roro Kostum
   role: super_admin
   is_active: true
   ```
5. **created_at** dan **updated_at** akan otomatis terisi
6. **created_by** bisa dikosongkan (NULL)
7. Klik **Save**

### 3. Test Login

1. Buka website Anda: `/admin/login`
2. Masukkan:
   ```
   Email: admin@rorokostum.com
   Password: [password yang Anda buat di step 1]
   ```
3. Klik **Login**
4. Jika berhasil, Anda akan masuk ke Admin Dashboard
5. Menu **Kelola Admin** akan muncul di sidebar (karena Anda Super Admin)

---

## Alternatif: Via SQL Editor (Advanced)

Jika Anda lebih familiar dengan SQL:

### 1. Buka SQL Editor

1. Di Supabase Dashboard, klik **SQL Editor** di menu kiri
2. Klik **New query**

### 2. Jalankan Query Ini

```sql
-- Langkah 1: Buat user di auth (ganti email dan password sesuai kebutuhan)
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user ke auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@rorokostum.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Insert ke identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub":"%s","email":"admin@rorokostum.com"}', new_user_id)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- Insert ke admin_users
  INSERT INTO admin_users (
    user_id,
    email,
    name,
    role,
    is_active
  ) VALUES (
    new_user_id,
    'admin@rorokostum.com',
    'Super Admin',
    'super_admin',
    true
  );

  -- Tampilkan hasilnya
  RAISE NOTICE 'Super Admin berhasil dibuat!';
  RAISE NOTICE 'Email: admin@rorokostum.com';
  RAISE NOTICE 'Password: password123';
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;
```

### 3. Klik Run

- Jika berhasil, Anda akan melihat pesan sukses
- Email: `admin@rorokostum.com`
- Password: `password123`

**PENTING**: Segera ganti password setelah login pertama!

---

## Setelah Login Pertama

### Langkah Selanjutnya:

1. **Ganti Password** (Opsional tapi disarankan)
   - Bisa via Supabase Dashboard → Authentication → Users → Edit user

2. **Buat Admin Tambahan**
   - Login ke `/admin/login`
   - Klik menu **Kelola Admin**
   - Klik **+ Tambah Admin**
   - Isi form dan pilih role

3. **Setup Proteksi**
   - Pastikan ada minimal 2 Super Admin untuk backup
   - Jangan share password Super Admin

---

## Troubleshooting

### Error: "Akun Anda tidak terdaftar sebagai admin"

**Penyebab**: User dibuat di auth.users tapi belum ada di admin_users

**Solusi**:
1. Cek tabel `admin_users` di Table Editor
2. Pastikan ada row dengan `user_id` yang sama dengan user di auth.users
3. Jika tidak ada, tambahkan manual (lihat Step 2 di atas)

### Error: "Akun Anda telah dinonaktifkan"

**Penyebab**: Field `is_active` = false

**Solusi**:
1. Buka Table Editor → admin_users
2. Edit row yang bersangkutan
3. Set `is_active` = true

### Error: "Email atau password salah"

**Penyebab**:
- Password salah
- User belum dibuat di auth.users
- Email typo

**Solusi**:
1. Cek spelling email dan password
2. Cek di Supabase Dashboard → Authentication → Users
3. Jika perlu, reset password via dashboard

---

## Keamanan

### Password Requirements:
- Minimal 6 karakter (disarankan 12+ karakter)
- Kombinasi huruf besar, kecil, angka, dan simbol
- Jangan gunakan password yang mudah ditebak

### Best Practices:
1. Jangan share akun Super Admin
2. Buat admin terpisah untuk setiap orang
3. Nonaktifkan admin yang sudah tidak bekerja
4. Audit log secara berkala

---

## Bantuan Lebih Lanjut

Lihat dokumentasi lengkap di: `ADMIN_MANAGEMENT_GUIDE.md`

Jika masih ada masalah, cek:
- Database migration sudah berjalan semua
- RLS policies sudah aktif
- Tidak ada error di browser console
