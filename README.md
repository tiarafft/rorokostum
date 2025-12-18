# Roro Kostum - Website Sewa Kostum

Website profesional untuk layanan sewa kostum dengan desain elegan dan aksen emas terang.

## 📖 Dokumentasi Lengkap

**[→ Panduan Setup Lengkap (SETUP_GUIDE.md)](./SETUP_GUIDE.md)** - Dokumentasi lengkap untuk setup project dari awal hingga deployment.

**[→ Cara Membuat Admin User (CREATE_ADMIN.md)](./CREATE_ADMIN.md)** - Panduan membuat user admin pertama.

**[→ User Management (USER_MANAGEMENT.md)](./USER_MANAGEMENT.md)** - Panduan lengkap mengelola admin users, ganti password, dan security.

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
# Copy .env.example ke .env dan isi dengan Supabase credentials
cp .env.example .env

# 3. Jalankan development server
npm run dev

# 4. Build untuk production
npm run build
```

## Fitur Utama

### Frontend (Public)
- **Home Page**: Hero section dengan tagline "Kalau bisa sewa, buat apa beli", USP section, dan galeri kostum pilihan
- **Gallery**: Filter berdasarkan kategori, search kostum, dan tampilan kartu kostum
- **Detail Kostum**: Galeri gambar lengkap, informasi detail, dan tombol WhatsApp untuk inquiry
- **Tracking Order**: Lacak status pesanan dengan kode booking
- **Prosedur Sewa**: Halaman statis menampilkan ketentuan sewa
- **Company Profile**: Informasi perusahaan, Google Maps embed, social media links
- **Footer**: Informasi perusahaan, social media icons (Facebook, Instagram), link Google Maps
- **Floating WhatsApp**: Tombol CTA terapung di semua halaman untuk inquiry

### Admin Portal
- **Dashboard**: Overview statistik (total kostum, tersedia, disewa, kategori)
- **Manajemen Kategori**: CRUD kategori kostum
- **Manajemen Kostum**: CRUD kostum dengan upload gambar ke Supabase Storage
- **Manajemen Orders**: Lihat dan update status pesanan customer
- **Settings**: Update prosedur sewa, nomor WhatsApp, info perusahaan, social media, dan Google Maps
- **Authentication**: Login sistem untuk admin dengan Row Level Security

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
- `kuantitas`: Integer (Jumlah stok tersedia)
- `deskripsi`: Text
- `gambar_url`: Text (URL gambar utama dari Supabase Storage)
- `status_ketersediaan`: Text (tersedia/disewa)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tabel `orders`
- `id`: UUID (Primary Key)
- `kode_booking`: Text (Unique, format: RK-YYYYMMDD-XXXX)
- `kostum_id`: UUID (Foreign Key ke kostum)
- `nama_penyewa`: Text
- `whatsapp_penyewa`: Text
- `tanggal_sewa`: Date
- `tanggal_kembali`: Date
- `kuantitas`: Integer (Jumlah kostum yang disewa)
- `total_harga`: Numeric
- `status`: Text (pending/confirmed/selesai/dibatalkan)
- `catatan`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tabel `settings`
- `id`: UUID (Primary Key)
- `key`: Text (Unique)
- `value`: Text
- `updated_at`: Timestamp

Keys yang tersedia:
- `whatsapp_number` - Nomor WhatsApp perusahaan
- `prosedur_sewa` - Syarat dan ketentuan sewa
- `company_name` - Nama perusahaan
- `company_address` - Alamat perusahaan
- `company_description` - Deskripsi perusahaan
- `facebook_url` - Link Facebook
- `instagram_url` - Link Instagram
- `google_maps_embed` - Google Maps embed URL
- `google_maps_link` - Google Maps location link

### Storage Bucket `kostum-images`
- Public bucket untuk menyimpan gambar kostum
- Path: `/kostum-images/{filename}`
- Access: Public read, Authenticated write

## Cara Menggunakan Admin Portal

### 1. Membuat Admin User Pertama

Sebelum login, Anda perlu membuat user admin. Lihat panduan lengkap di [CREATE_ADMIN.md](./CREATE_ADMIN.md).

**Quick method**: Jalankan SQL di Supabase SQL Editor:

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

**Login credentials:**
- Email: `admin@rorokostum.com`
- Password: `Admin123!`

### 2. Login Admin

- Akses `/admin/login`
- Masukkan email dan password admin

### 3. Mengelola Kategori

- Masuk ke menu "Kategori"
- Klik "Tambah Kategori" untuk menambah kategori baru
- Contoh: Superhero, Kartun, Profesi, Binatang, Tradisional, dll.

### 4. Mengelola Kostum

- Masuk ke menu "Kostum"
- Klik "Tambah Kostum"
- Isi data lengkap (nama, kategori, ukuran, harga, kuantitas, deskripsi)
- Upload gambar kostum dari komputer (akan tersimpan di Supabase Storage)
- Gambar akan otomatis di-upload ke storage bucket `kostum-images`

### 5. Mengelola Orders

- Masuk ke menu "Orders"
- Lihat semua pesanan yang masuk
- Update status pesanan (pending → confirmed → selesai)
- Lihat detail penyewa dan informasi pesanan

### 6. Update Settings

Masuk ke menu "Settings" dan atur:

**Informasi Dasar:**
- Nomor WhatsApp (format: 6281234567890)
- Nama perusahaan
- Alamat perusahaan
- Deskripsi perusahaan

**Prosedur Sewa:**
- Edit syarat dan ketentuan sewa kostum

**Social Media:**
- Facebook URL
- Instagram URL

**Google Maps:**
- Maps Link (untuk tombol di footer)
- Maps Embed URL (untuk embed di company profile)

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
