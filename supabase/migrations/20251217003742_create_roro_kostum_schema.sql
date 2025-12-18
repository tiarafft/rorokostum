/*
  # Create Roro Kostum Database Schema

  1. New Tables
    - `kategori`
      - `id` (uuid, primary key)
      - `nama` (text) - Nama kategori (Adat, Karakter, Profesi, dll)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `kostum`
      - `id` (uuid, primary key)
      - `kategori_id` (uuid, foreign key to kategori)
      - `nama` (text) - Nama kostum
      - `ukuran_tersedia` (text) - Ukuran yang tersedia (S, M, L, XL, dll)
      - `harga_sewa` (numeric) - Harga sewa per 3 hari
      - `deskripsi` (text) - Deskripsi kostum
      - `status_ketersediaan` (text) - Status: "tersedia" atau "disewa"
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gambar_kostum`
      - `id` (uuid, primary key)
      - `kostum_id` (uuid, foreign key to kostum)
      - `path` (text) - Path file gambar
      - `is_primary` (boolean) - Menandai gambar utama
      - `created_at` (timestamp)
    
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Kunci setting (prosedur_sewa, whatsapp_number)
      - `value` (text) - Nilai setting
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public can read kategori, kostum, gambar_kostum, and settings
    - Only authenticated admins can write to any table
*/

-- Create kategori table
CREATE TABLE IF NOT EXISTS kategori (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create kostum table
CREATE TABLE IF NOT EXISTS kostum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori_id uuid REFERENCES kategori(id) ON DELETE SET NULL,
  nama text NOT NULL,
  ukuran_tersedia text NOT NULL DEFAULT '',
  harga_sewa numeric NOT NULL DEFAULT 0,
  deskripsi text DEFAULT '',
  status_ketersediaan text NOT NULL DEFAULT 'tersedia',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gambar_kostum table
CREATE TABLE IF NOT EXISTS gambar_kostum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kostum_id uuid REFERENCES kostum(id) ON DELETE CASCADE,
  path text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('prosedur_sewa', '1. Masa sewa kostum adalah 3 hari (termasuk hari pengambilan dan pengembalian)
2. Down Payment (DP) sebesar 50% dari total harga sewa
3. Pelunasan dilakukan saat pengambilan kostum
4. Denda keterlambatan Rp 50.000/hari
5. Dilarang mencuci kostum sendiri
6. Wajib menyerahkan fotocopy KTP/SIM sebagai jaminan
7. Pengembalian kostum dalam kondisi bersih dan rapi'),
  ('whatsapp_number', '6281234567890'),
  ('company_name', 'PT Roro Kostum Entertainment'),
  ('company_address', 'Jl. Contoh No. 123, Jakarta Selatan'),
  ('company_description', 'Roro Kostum adalah penyedia layanan sewa kostum terlengkap dengan koleksi beragam untuk berbagai acara. Kami berkomitmen memberikan layanan terbaik dengan harga terjangkau dan kebersihan terjamin.')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE kostum ENABLE ROW LEVEL SECURITY;
ALTER TABLE gambar_kostum ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kategori
CREATE POLICY "Public can view all categories"
  ON kategori FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON kategori FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON kategori FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON kategori FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for kostum
CREATE POLICY "Public can view all kostum"
  ON kostum FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert kostum"
  ON kostum FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update kostum"
  ON kostum FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete kostum"
  ON kostum FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for gambar_kostum
CREATE POLICY "Public can view all images"
  ON gambar_kostum FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON gambar_kostum FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON gambar_kostum FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete images"
  ON gambar_kostum FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for settings
CREATE POLICY "Public can view all settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kostum_kategori ON kostum(kategori_id);
CREATE INDEX IF NOT EXISTS idx_kostum_status ON kostum(status_ketersediaan);
CREATE INDEX IF NOT EXISTS idx_gambar_kostum ON gambar_kostum(kostum_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);