# Roro Kostum - Website Sewa Kostum

Website profesional untuk layanan sewa kostum dengan desain elegan dan aksen emas terang.

## Fitur Utama

### Frontend (Public)
- **Home Page**: Hero section dengan tagline "Kalau bisa sewa, buat apa beli", USP section, dan galeri kostum pilihan
- **Gallery**: Filter berdasarkan kategori, search kostum, dan tampilan kartu kostum
- **Detail Kostum**: Galeri gambar lengkap, informasi detail, dan tombol WhatsApp untuk inquiry
- **Prosedur Sewa**: Halaman statis menampilkan ketentuan sewa
- **Company Profile**: Informasi tentang perusahaan
- **Floating WhatsApp**: Tombol CTA terapung di semua halaman untuk inquiry

### Admin Portal
- **Dashboard**: Overview statistik (total kostum, tersedia, disewa, kategori)
- **Manajemen Kategori**: CRUD kategori kostum
- **Manajemen Kostum**: CRUD kostum dengan multi-upload gambar dari URL Pexels
- **Settings**: Update prosedur sewa, nomor WhatsApp, dan info perusahaan
- **Authentication**: Login sistem untuk admin

## Teknologi

- **Frontend**: React 18 + Vite
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS dengan design system
- **Router**: React Router DOM

## Setup dan Instalasi

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   File `.env` sudah dikonfigurasi dengan Supabase credentials

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. **Build untuk production**:
   ```bash
   npm run build
   ```

## Struktur Database

### Tabel `kategori`
- `id`: UUID (Primary Key)
- `nama`: Text (Nama kategori)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tabel `kostum`
- `id`: UUID (Primary Key)
- `kategori_id`: UUID (Foreign Key ke kategori)
- `nama`: Text (Nama kostum)
- `ukuran_tersedia`: Text (Ukuran yang tersedia)
- `harga_sewa`: Numeric (Harga sewa per 3 hari)
- `deskripsi`: Text
- `status_ketersediaan`: Text (tersedia/disewa)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tabel `gambar_kostum`
- `id`: UUID (Primary Key)
- `kostum_id`: UUID (Foreign Key ke kostum)
- `path`: Text (URL gambar)
- `is_primary`: Boolean (Gambar utama)
- `created_at`: Timestamp

### Tabel `settings`
- `id`: UUID (Primary Key)
- `key`: Text (Unique)
- `value`: Text
- `updated_at`: Timestamp

## Cara Menggunakan Admin Portal

1. **Login Admin**:
   - Akses `/admin/login`
   - Gunakan email dan password admin yang sudah didaftarkan di Supabase Auth

2. **Membuat Admin User**:
   Anda perlu membuat user admin melalui Supabase Dashboard atau menggunakan kode berikut:
   ```javascript
   // Jalankan di console browser atau buat script terpisah
   import { supabase } from './src/lib/supabase'

   const { data, error } = await supabase.auth.signUp({
     email: 'admin@rorokostum.com',
     password: 'password_aman_anda'
   })
   ```

3. **Mengelola Kategori**:
   - Masuk ke menu "Kategori"
   - Klik "Tambah Kategori" untuk menambah kategori baru
   - Contoh: Adat, Karakter, Profesi, Superhero, dll.

4. **Mengelola Kostum**:
   - Masuk ke menu "Kostum"
   - Klik "Tambah Kostum"
   - Isi semua data kostum
   - Untuk gambar, gunakan URL dari Pexels.com:
     - Cari gambar di pexels.com
     - Copy URL gambar (klik kanan > Copy Image Address)
     - Paste ke form dan klik "Tambah"
     - Gambar pertama akan menjadi gambar utama

5. **Update Settings**:
   - Masuk ke menu "Settings"
   - Update nomor WhatsApp (format: 6281234567890)
   - Edit prosedur sewa
   - Update informasi perusahaan

## Desain

- **Color Scheme**:
  - Primary: Emas Terang (#D4AF37)
  - Accent: Putih, Hitam, Gray tones
- **Typography**:
  - Display: Playfair Display
  - Body: Inter
- **Style**: Profesional, Elegan, Modern, Responsif

## Fitur Keamanan

- Row Level Security (RLS) pada semua tabel
- Public dapat membaca data kostum, kategori, dan settings
- Hanya authenticated admin yang dapat melakukan CRUD operations
- Protected routes untuk admin portal

## Support

Untuk pertanyaan atau bantuan, silakan hubungi developer atau buka issue di repository.
