-- Insert admin user into auth.users using Supabase admin API
-- Note: In production, use Supabase Admin API or Auth UI to create users
-- This script creates the profile for the admin user

INSERT INTO profiles (id, email, full_name, role, username, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'phh1422005@gmail.com',
  'Admin User',
  'admin',
  'admin_phh1422005',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User',
  updated_at = NOW();

-- Verify the admin account was created
SELECT id, email, role, full_name FROM profiles WHERE email = 'phh1422005@gmail.com';
