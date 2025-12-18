/*
  # Add quantity tracking to kostum table

  1. Changes
    - Add `kuantitas_total` column to kostum table (total inventory)
    - Add `kuantitas_tersedia` column to kostum table (available quantity)
    - Set default values for existing data
    - Update status_ketersediaan logic will be handled in application layer

  2. Notes
    - kuantitas_total: Total inventory of this costume
    - kuantitas_tersedia: Currently available quantity (not rented)
    - When kuantitas_tersedia = 0, status should be 'disewa'
    - When kuantitas_tersedia > 0, status should be 'tersedia'
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kostum' AND column_name = 'kuantitas_total'
  ) THEN
    ALTER TABLE kostum ADD COLUMN kuantitas_total integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kostum' AND column_name = 'kuantitas_tersedia'
  ) THEN
    ALTER TABLE kostum ADD COLUMN kuantitas_tersedia integer NOT NULL DEFAULT 1;
  END IF;
END $$;

UPDATE kostum 
SET kuantitas_total = 1, kuantitas_tersedia = 1 
WHERE kuantitas_total IS NULL OR kuantitas_tersedia IS NULL;

UPDATE kostum 
SET kuantitas_tersedia = 0 
WHERE status_ketersediaan = 'disewa';
