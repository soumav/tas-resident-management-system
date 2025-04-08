
# Creating an Admin User Manually

After creating a user through Supabase Authentication (via sign up), follow these steps to manually add them to the database tables with admin privileges:

-- Insert into users table
INSERT INTO users (id, email, role, created_at)
VALUES 
  ('REPLACE_WITH_AUTH_USER_UUID', 'soumav91@gmail.com', 'admin', NOW())
ON CONFLICT (id) DO UPDATE 
  SET role = 'admin';

-- Insert into profiles table (references the same user id)
INSERT INTO profiles (id, name, email, created_at)
VALUES 
  ('REPLACE_WITH_AUTH_USER_UUID', 'Sous', 'soumav91@gmail.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify that both entries were created successfully
SELECT u.id, u.email, u.role, p.name
FROM users u 
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = 'REPLACE_WITH_AUTH_USER_UUID';

-- IMPORTANT: Replace 'REPLACE_WITH_AUTH_USER_UUID' with the actual UUID
-- from the Supabase auth.users table for your admin user