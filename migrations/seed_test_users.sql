-- OpsMind Test Users Seed
-- This script adds test Admin and Support Agent users to the users table
-- Note: Passwords are managed by Supabase Auth, not stored here

-- Admin User
INSERT INTO users (
  id,
  email,
  name,
  password_hash,
  role_id,
  department,
  status,
  initials,
  avatar_color
)
VALUES 
  (
    '062f15df-0785-4f54-b2e4-e58b1952e29c',
    'admin.test@opsmind.com',
    'Admin Yas',
    '',
    'df3c8c1e-65c0-4a66-b502-006bfb20841e',
    'Technical Support',
    'Active',
    'AY',
    'bg-red-100 text-red-700'
  );

-- Support Agent User
INSERT INTO users (
  id,
  email,
  name,
  password_hash,
  role_id,
  department,
  status,
  initials,
  avatar_color
)
VALUES 
  (
    'cc63f8f3-9176-4ea0-bc46-964406015e8e',
    'support.test@opsmind.com',
    'Support Agent',
    '',
    'f73017eb-727a-484b-8459-ea548f76cdf8',
    'Technical Support',
    'Active',
    'SA',
    'bg-blue-100 text-blue-700'
  );
