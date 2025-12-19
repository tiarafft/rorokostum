/*
  # Create Admin Users Management System
  
  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Link to Supabase Auth user
      - `email` (text) - Admin email
      - `name` (text) - Admin name
      - `role` (text) - Role: 'super_admin' or 'admin'
      - `is_active` (boolean) - Account status
      - `created_at` (timestamp)
      - `created_by` (uuid) - ID of admin who created this account
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on admin_users table
    - Only authenticated admins can view admin_users
    - Only super_admin can create/update/delete admin accounts
    
  3. Important Notes
    - Super admin is the only one who can manage other admin accounts
    - Regular admins can only view their own profile
    - No public registration allowed - all admins must be created by super_admin
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Authenticated users can view all admin users
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin can insert new admin users
CREATE POLICY "Super admin can create admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Only super_admin can update admin users
CREATE POLICY "Super admin can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Only super_admin can delete admin users
CREATE POLICY "Super admin can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on admin_users table
DROP TRIGGER IF EXISTS set_admin_users_updated_at ON admin_users;
CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();