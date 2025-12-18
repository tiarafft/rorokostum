/*
  # Add kuantitas column to orders table

  1. Changes
    - Add `kuantitas` column to orders table (quantity of items rented)
    - Set default value to 1 for existing and new orders
    - This tracks how many units of a costume are rented in this order

  2. Notes
    - kuantitas: Number of costume units rented in this order
    - Must be validated against available quantity in application layer
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'kuantitas'
  ) THEN
    ALTER TABLE orders ADD COLUMN kuantitas integer NOT NULL DEFAULT 1;
  END IF;
END $$;

UPDATE orders 
SET kuantitas = 1 
WHERE kuantitas IS NULL;
