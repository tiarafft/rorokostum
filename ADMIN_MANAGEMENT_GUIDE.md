# Panduan Kelola Akun Admin

## Gambaran Umum

Sistem admin management ini dirancang untuk memastikan keamanan dengan **tidak mengizinkan pendaftaran publik**. Hanya Super Admin yang dapat membuat dan mengelola akun admin.

## Hierarki Admin

### 1. Super Admin
- Memiliki akses penuh ke semua fitur
- Dapat membuat, mengedit, dan menghapus akun admin lain
- Dapat mengaktifkan/menonaktifkan akun admin
- Dapat mengubah role admin (admin ↔ super_admin)
- Memiliki menu khusus "Kelola Admin" di sidebar

### 2. Admin
- Dapat mengelola kategori, kostum, dan order
- Dapat mengakses pengaturan
- **TIDAK** dapat mengelola akun admin lain
- **TIDAK** dapat melihat menu "Kelola Admin"

## Cara Membuat Super Admin Pertama

Karena tidak ada fitur registrasi publik, Anda perlu membuat Super Admin pertama secara manual:

### Opsi 1: Via Supabase Dashboard

1. Login ke Supabase Dashboard
2. Buka **Authentication** → **Users**
3. Klik **Add user** → **Create new user**
4. Masukkan email dan password untuk Super Admin
5. Copy **User ID** yang baru dibuat
6. Buka **Table Editor** → Pilih tabel **admin_users**
7. Klik **Insert** → **Insert row**
8. Isi data:
   - `user_id`: [User ID yang di-copy tadi]
   - `email`: [Email yang sama]
   - `name`: [Nama Super Admin]
   - `role`: `super_admin`
   - `is_active`: `true`
9. Klik **Save**

### Opsi 2: Via SQL Editor

```sql
-- 1. Buat user di auth.users (ganti email dan password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@rorokostum.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Ambil user_id yang baru dibuat
-- (Lihat di Supabase Dashboard → Authentication → Users)

-- 3. Buat entry di admin_users
INSERT INTO admin_users (
  user_id,
  email,
  name,
  role,
  is_active
) VALUES (
  '[USER_ID_DARI_STEP_2]',
  'admin@rorokostum.com',
  'Super Admin',
  'super_admin',
  true
);
```

## Cara Mengelola Admin

### Login sebagai Super Admin

1. Buka `/admin/login`
2. Masukkan email dan password Super Admin
3. Klik **Login**

### Menambah Admin Baru

1. Login sebagai Super Admin
2. Klik menu **Kelola Admin** di sidebar
3. Klik tombol **+ Tambah Admin**
4. Isi form:
   - **Nama Lengkap**: Nama admin baru
   - **Email**: Email untuk login
   - **Password**: Password untuk login (minimal 6 karakter)
   - **Role**: Pilih `Admin` atau `Super Admin`
5. Klik **Simpan**

### Mengedit Admin

1. Di halaman **Kelola Admin**, klik tombol **✏️** pada admin yang ingin diedit
2. Update data yang diperlukan:
   - Nama
   - Role
   - Status aktif/nonaktif
3. Klik **Update**

**Catatan**: Email tidak dapat diubah setelah admin dibuat

### Menonaktifkan Admin

1. Di halaman **Kelola Admin**, klik tombol **🔒** untuk menonaktifkan
2. Admin yang dinonaktifkan tidak akan bisa login
3. Klik tombol **🔓** untuk mengaktifkan kembali

### Menghapus Admin

1. Di halaman **Kelola Admin**, klik tombol **🗑️** pada admin yang ingin dihapus
2. Konfirmasi penghapusan
3. Admin akan dihapus dari database

**Peringatan**:
- Super Admin terakhir tidak dapat dihapus
- Pastikan ada minimal 1 Super Admin aktif di sistem

## Keamanan

### Proteksi yang Diterapkan

1. **Tidak Ada Registrasi Publik**
   - Tombol registrasi dihapus dari halaman login
   - Hanya Super Admin yang dapat membuat akun admin baru

2. **Validasi Login**
   - Setiap login dicek di tabel `admin_users`
   - Jika user tidak ada di tabel, login ditolak
   - Jika user nonaktif, login ditolak

3. **Row Level Security (RLS)**
   - Tabel `admin_users` dilindungi dengan RLS
   - Hanya Super Admin yang dapat insert/update/delete
   - Semua admin dapat melihat daftar admin (read only untuk admin biasa)

4. **Protected Routes**
   - Semua halaman admin memerlukan autentikasi
   - Sistem mengecek apakah user ada di `admin_users`
   - Sistem mengecek apakah user aktif (`is_active = true`)

5. **Menu Conditional**
   - Menu "Kelola Admin" hanya muncul untuk Super Admin
   - Admin biasa tidak akan melihat menu tersebut

## Troubleshooting

### Tidak Bisa Login

**Pesan**: "Akun Anda tidak terdaftar sebagai admin"
- **Penyebab**: User ada di Supabase Auth tapi tidak ada di tabel `admin_users`
- **Solusi**: Super Admin harus menambahkan user ke tabel `admin_users`

**Pesan**: "Akun Anda telah dinonaktifkan"
- **Penyebab**: Field `is_active` di `admin_users` bernilai `false`
- **Solusi**: Super Admin harus mengaktifkan kembali akun

**Pesan**: "Email atau password salah"
- **Penyebab**: Kredensial salah atau user tidak ada di Supabase Auth
- **Solusi**: Cek email dan password, atau hubungi Super Admin

### Super Admin Terkunci

Jika Super Admin lupa password atau terkunci:

1. Buka Supabase Dashboard
2. **Authentication** → **Users**
3. Cari user Super Admin
4. Klik **Send Magic Link** atau **Reset Password**
5. Atau langsung update password via SQL:

```sql
UPDATE auth.users
SET encrypted_password = crypt('password_baru', gen_salt('bf'))
WHERE email = 'admin@rorokostum.com';
```

### Tidak Ada Super Admin

Jika semua Super Admin terhapus atau nonaktif:

1. Buka Supabase Dashboard
2. **Table Editor** → `admin_users`
3. Update salah satu admin:
   - Set `role` = `super_admin`
   - Set `is_active` = `true`
4. Atau via SQL:

```sql
UPDATE admin_users
SET role = 'super_admin', is_active = true
WHERE email = 'admin@rorokostum.com';
```

## Best Practices

1. **Selalu Jaga Minimal 2 Super Admin Aktif**
   - Untuk menghindari kehilangan akses jika satu Super Admin bermasalah

2. **Gunakan Email Unik untuk Setiap Admin**
   - Jangan share akun admin

3. **Password Strong**
   - Minimal 8 karakter
   - Kombinasi huruf besar, kecil, angka, dan simbol

4. **Audit Log**
   - Cek kolom `created_by` untuk melacak siapa yang membuat admin
   - Cek `created_at` untuk melihat kapan admin dibuat

5. **Nonaktifkan Admin yang Tidak Aktif**
   - Jangan langsung hapus, nonaktifkan dulu
   - Bisa diaktifkan kembali jika diperlukan

## Struktur Database

### Tabel: admin_users

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference ke auth.users |
| email | text | Email admin (unique) |
| name | text | Nama lengkap |
| role | text | 'super_admin' atau 'admin' |
| is_active | boolean | Status aktif/nonaktif |
| created_at | timestamptz | Waktu dibuat |
| created_by | uuid | ID admin yang membuat |
| updated_at | timestamptz | Waktu terakhir update |

## FAQ

**Q: Bisakah admin biasa melihat daftar admin?**
A: Ya, admin biasa dapat melihat daftar admin tapi tidak bisa mengedit/hapus.

**Q: Bisakah admin mengubah password sendiri?**
A: Saat ini belum ada fitur change password. Bisa ditambahkan jika diperlukan.

**Q: Apa yang terjadi jika Super Admin menghapus dirinya sendiri?**
A: Sistem akan mencegah penghapusan Super Admin terakhir.

**Q: Bisakah mengubah email admin?**
A: Tidak, email tidak dapat diubah karena terikat dengan Supabase Auth.

**Q: Berapa jumlah maksimal admin?**
A: Tidak ada batasan, tapi disarankan sesuai kebutuhan untuk keamanan.
