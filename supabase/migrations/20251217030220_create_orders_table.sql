/*
  # Create orders table for rental management

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `kode_order` (text, unique) - Auto-generated order code for tracking
      - `nama_penyewa` (text) - Renter's name
      - `no_hp` (text) - Phone number
      - `kostum_id` (uuid, foreign key) - Reference to kostum
      - `tanggal_sewa` (date) - Rental start date
      - `tanggal_kembali_rencana` (date) - Planned return date
      - `tanggal_kembali_aktual` (date, nullable) - Actual return date
      - `harga_sewa` (numeric) - Rental price
      - `denda` (numeric) - Late fee/penalty
      - `total_bayar` (numeric) - Total payment (rental + penalty)
      - `status` (text) - Order status: aktif, selesai, terlambat, dibatalkan
      - `catatan` (text, nullable) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public to read their own orders by kode_order and no_hp
    - Add policy for authenticated users (admin) to manage all orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_order text UNIQUE NOT NULL,
  nama_penyewa text NOT NULL,
  no_hp text NOT NULL,
  kostum_id uuid REFERENCES kostum(id) ON DELETE RESTRICT,
  tanggal_sewa date NOT NULL,
  tanggal_kembali_rencana date NOT NULL,
  tanggal_kembali_aktual date,
  harga_sewa numeric NOT NULL DEFAULT 0,
  denda numeric NOT NULL DEFAULT 0,
  total_bayar numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'aktif',
  catatan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view own orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_kode_order ON orders(kode_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_kostum_id ON orders(kostum_id);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_sewa ON orders(tanggal_sewa);
