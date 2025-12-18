# User Management - Roro Kostum

Panduan lengkap mengelola user admin di aplikasi Roro Kostum.

## 📋 Daftar Isi
1. [Tentang Auth System](#tentang-auth-system)
2. [Membuat Admin User Baru](#membuat-admin-user-baru)
3. [Mengganti Password Admin](#mengganti-password-admin)
4. [Menghapus Admin User](#menghapus-admin-user)
5. [Melihat Daftar Admin](#melihat-daftar-admin)
6. [Reset Password](#reset-password)
7. [Troubleshooting](#troubleshooting)

---

## 🔐 Tentang Auth System

### Supabase Built-in Authentication

Project ini menggunakan **Supabase Authentication** yang sudah menyediakan:

- **Tabel `auth.users`** - Tabel built-in untuk menyimpan user data
- **Password encryption** - Password otomatis di-encrypt dengan bcrypt
- **Session management** - Token & refresh token otomatis
- **Email verification** - Optional email confirmation
- **Password reset** - Forgot password functionality

### Tidak Ada Tabel User Custom

**PENTING**: Anda TIDAK perlu membuat tabel `users` sendiri! Supabase sudah menyediakan semua yang diperlukan di tabel `auth.users`.

### Struktur `auth.users`

Tabel ini otomatis dibuat oleh Supabase dan berisi:

```sql
auth.users
├── id (uuid) - Primary key
├── email (text) - Email user
├── encrypted_password (text) - Password ter-enkripsi
├── email_confirmed_at (timestamp) - Waktu konfirmasi email
├── created_at (timestamp) - Waktu pembuatan
├── updated_at (timestamp) - Waktu update terakhir
├── raw_app_meta_data (jsonb) - App metadata
├── raw_user_meta_data (jsonb) - User metadata
├── role (text) - User role
└── ... (fields lainnya)
```

---

## 👤 Membuat Admin User Baru

### Method 1: Melalui SQL (Recommended)

**Step 1: Buka Supabase Dashboard**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**

**Step 2: Jalankan SQL Query**

```sql
-- Buat admin user baru
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  instance_id
) VALUES (
  gen_random_uuid(),
  'admin@rorokostum.com',  -- Ganti dengan email yang diinginkan
  crypt('Admin123!', gen_salt('bf')),  -- Ganti dengan password yang diinginkan
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);
```

**Step 3: Verifikasi**

Cek di **Authentication** → **Users** untuk memastikan user baru sudah terbuat.

### Method 2: Melalui Supabase Dashboard UI

**Step 1: Buka Authentication**
1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Buka **Authentication** → **Users**

**Step 2: Tambah User**
1. Klik **Add user** → **Create new user**
2. Isi form:
   - **Email**: Masukkan email admin (contoh: `admin2@rorokostum.com`)
   - **Password**: Masukkan password yang kuat
   - **Auto Confirm User**: ✅ Centang ini (untuk skip email verification)
3. Klik **Create user**

**Step 3: Test Login**
- Buka aplikasi Anda
- Akses `/admin/login`
- Login dengan email dan password yang baru dibuat

### Method 3: Melalui Code (Development Only)

**⚠️ HANYA untuk development/testing!**

Buat file temporary `create-admin.js` di root project:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // JANGAN EXPOSE KE PUBLIC!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin3@rorokostum.com',
    password: 'SecurePassword123!',
    email_confirm: true // Auto-confirm email
  })

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Admin created:', data.user.email)
  }
}

createAdmin()
```

Jalankan:
```bash
node create-admin.js
```

**PENTING**: Hapus file ini setelah selesai dan JANGAN commit ke Git!

---

## 🔑 Mengganti Password Admin

### Method 1: Via Supabase Dashboard (Paling Mudah)

**Step 1: Buka Authentication**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **Authentication** → **Users**

**Step 2: Edit User**
1. Cari user yang ingin diganti passwordnya
2. Klik titik tiga (⋮) di sebelah kanan
3. Pilih **Reset Password** atau **Edit User**
4. Masukkan password baru
5. Klik **Save**

### Method 2: Via SQL

```sql
-- Ganti password untuk user tertentu
UPDATE auth.users
SET
  encrypted_password = crypt('PasswordBaru123!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@rorokostum.com';
```

### Method 3: Self-Service Password Change (Dalam Aplikasi)

Anda bisa membuat fitur "Change Password" di admin panel:

**Contoh implementasi:**

```javascript
// Di AdminSettings.jsx atau component baru
const handleChangePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Password berhasil diubah!')
  }
}
```

**Form di component:**

```jsx
<div className="password-section">
  <h3>Ganti Password</h3>
  <input
    type="password"
    placeholder="Password Baru"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
  />
  <button onClick={() => handleChangePassword(newPassword)}>
    Update Password
  </button>
</div>
```

---

## 🗑️ Menghapus Admin User

### Via Supabase Dashboard

**Step 1: Buka Authentication**
1. Login ke Supabase Dashboard
2. Buka **Authentication** → **Users**

**Step 2: Delete User**
1. Cari user yang ingin dihapus
2. Klik titik tiga (⋮)
3. Pilih **Delete user**
4. Konfirmasi penghapusan

### Via SQL

```sql
-- Hapus user berdasarkan email
DELETE FROM auth.users
WHERE email = 'admin@rorokostum.com';
```

**⚠️ PERHATIAN**:
- Pastikan tidak menghapus SEMUA admin!
- Selalu sisakan minimal 1 admin aktif
- Penghapusan bersifat permanen

---

## 👥 Melihat Daftar Admin

### Via Supabase Dashboard

1. Login ke Supabase Dashboard
2. Buka **Authentication** → **Users**
3. Semua admin users akan tampil di sini

### Via SQL Query

```sql
-- Lihat semua admin users
SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

### Via Admin Panel (Custom Feature)

Anda bisa membuat halaman "User Management" di admin panel:

**Contoh code:**

```javascript
// AdminUsers.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AdminUsers = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    // Note: Ini hanya bisa dilakukan dengan service_role key
    // Atau buat Edge Function untuk ini
    const { data, error } = await supabase.auth.admin.listUsers()

    if (!error) {
      setUsers(data.users)
    }
  }

  return (
    <div>
      <h2>Admin Users</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Created At</th>
            <th>Last Sign In</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : 'Never'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsers
```

**⚠️ PENTING**: `supabase.auth.admin.*` methods memerlukan `service_role` key yang TIDAK boleh di-expose ke client! Sebaiknya buat Edge Function untuk ini.

---

## 🔄 Reset Password (Forgot Password)

### Untuk Admin yang Lupa Password

**Method 1: Admin Lain Reset via Dashboard**
1. Admin lain login ke Supabase Dashboard
2. Buka **Authentication** → **Users**
3. Reset password untuk user yang lupa

**Method 2: Email Reset Link**

Implementasi "Forgot Password" feature:

```javascript
// Di AdminLogin.jsx
const handleForgotPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://your-domain.com/admin/reset-password',
  })

  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Email reset password telah dikirim!')
  }
}
```

**Setup di Supabase:**
1. Buka **Authentication** → **Email Templates**
2. Customize template "Reset Password"
3. Set redirect URL

**⚠️ NOTE**: Untuk production, pastikan email provider sudah dikonfigurasi di Supabase!

---

## 🐛 Troubleshooting

### Problem: "Email not confirmed"

**Cause**: Email confirmation masih enabled

**Solution**:
1. Buka Supabase Dashboard
2. **Authentication** → **Providers** → **Email**
3. Scroll ke **Email Confirmation**
4. Uncheck "Enable email confirmations"
5. Save

Atau confirm manual via SQL:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@rorokostum.com';
```

### Problem: "Invalid login credentials"

**Possible causes:**
1. Email salah
2. Password salah
3. User belum dibuat
4. Email belum confirmed (jika confirmation enabled)

**Solution**:
1. Cek di **Authentication** → **Users** apakah user ada
2. Cek email spelling
3. Reset password via dashboard
4. Confirm email jika perlu

### Problem: "User already registered"

**Cause**: Email sudah digunakan

**Solution**:
- Gunakan email berbeda, atau
- Hapus user lama dulu, atau
- Reset password user yang ada

### Problem: Password tidak bisa login setelah dibuat via SQL

**Cause**: Function `crypt()` mungkin tidak available

**Solution 1**: Enable pgcrypto extension
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Solution 2**: Buat user via Dashboard saja (lebih aman)

### Problem: "Auth session missing"

**Cause**: Session expired atau tidak ter-save

**Solution**:
1. Clear browser cache & cookies
2. Login ulang
3. Check browser console untuk errors
4. Verify Supabase URL & keys di `.env`

---

## 🔐 Security Best Practices

### 1. Password Requirements

Gunakan password yang kuat:
- Minimal 8 karakter
- Kombinasi huruf besar & kecil
- Angka
- Special characters
- Contoh: `MyStr0ng!Pass2024`

### 2. Email Best Practices

- Gunakan email perusahaan (bukan personal)
- Format: `admin@namadomainanda.com`
- Jangan gunakan email yang mudah ditebak seperti `admin@admin.com`

### 3. Protect Service Role Key

**JANGAN PERNAH:**
- ❌ Commit service_role key ke Git
- ❌ Expose ke client-side code
- ❌ Share di public channels

**HANYA gunakan:**
- ✅ Di server-side code
- ✅ Di Supabase Edge Functions
- ✅ Di secure backend

### 4. Regular Password Changes

- Ganti password setiap 3-6 bulan
- Jangan reuse password lama
- Gunakan password manager

### 5. Monitor Login Activity

Cek regular di **Authentication** → **Users**:
- Last sign in time
- Unusual login patterns
- Unknown users

### 6. Limit Admin Accounts

- Hanya buat admin account sesuai kebutuhan
- Delete inactive accounts
- Review user list secara berkala

---

## 📊 User Metadata

Anda bisa menyimpan data tambahan di user metadata:

### App Metadata (Admin Only)

```javascript
// Set via service_role key only
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    department: 'operations'
  }
})
```

### User Metadata (User Can Update)

```javascript
// User bisa update sendiri
await supabase.auth.updateUser({
  data: {
    display_name: 'Admin Roro Kostum',
    phone: '081234567890'
  }
})
```

### Read Metadata

```javascript
// Get current user with metadata
const { data: { user } } = await supabase.auth.getUser()

console.log(user.app_metadata) // Admin-only data
console.log(user.user_metadata) // User data
```

---

## 🎯 Rekomendasi Setup

### Production Setup

1. **Buat 2-3 admin users** (untuk backup)
2. **Enable email confirmation** untuk security
3. **Setup custom email templates** dengan branding perusahaan
4. **Configure email provider** (SMTP atau third-party)
5. **Regular backup** credentials di tempat aman
6. **Document** semua admin accounts dan tanggung jawabnya

### Development Setup

1. **Disable email confirmation** untuk testing mudah
2. **Gunakan test emails** seperti `admin@test.com`
3. **Simple passwords** OK untuk development
4. **Document** test credentials di team docs

---

## 📝 Checklist Admin User Management

### Initial Setup
- [ ] Buat admin user pertama
- [ ] Test login berhasil
- [ ] Simpan credentials di password manager
- [ ] Buat backup admin account
- [ ] Document semua admin emails

### Regular Maintenance
- [ ] Review user list setiap bulan
- [ ] Hapus inactive accounts
- [ ] Update passwords every 3-6 months
- [ ] Monitor login activity
- [ ] Backup credentials updated

### Security Audit
- [ ] All passwords strong & unique
- [ ] No service_role key exposed
- [ ] Email confirmation configured
- [ ] Only necessary admins exist
- [ ] Login activity normal

---

## 🆘 Need Help?

Untuk pertanyaan lebih lanjut:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Dashboard](https://app.supabase.com)
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [CREATE_ADMIN.md](./CREATE_ADMIN.md)

---

**Keamanan adalah prioritas! Selalu protect credentials Anda dengan baik.** 🔐
