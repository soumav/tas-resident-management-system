
# Creating an Admin User Manually

After creating a user through Supabase Authentication (via sign up), follow these steps to manually add them to the database tables with admin privileges:

## Option 1: Using the SQL Editor in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Find the user you just created and copy their UUID
4. Go to the SQL Editor in Supabase
5. Run the following SQL (replacing the placeholders):

```sql
-- Insert into users table with admin role
INSERT INTO users (id, email, role, created_at)
VALUES 
  ('paste-user-uuid-here', 'user-email@example.com', 'admin', NOW())
ON CONFLICT (id) DO UPDATE 
  SET role = 'admin';

-- Insert into profiles table
INSERT INTO profiles (id, name, email, created_at)
VALUES 
  ('paste-user-uuid-here', 'Admin User Name', 'user-email@example.com', NOW())
ON CONFLICT (id) DO NOTHING;
```

## Option 2: First-Time Setup - Creating an Initial Admin

If this is your first time setting up the system and you need an admin user:

1. Sign up normally through the application
2. Get the UUID from Supabase Authentication dashboard
3. Run the SQL above to set the user as admin

## Verification

To verify the user has been correctly added with admin privileges:

```sql
SELECT u.id, u.email, u.role, p.name
FROM users u 
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'user-email@example.com';
```

The query should show the user with role 'admin' and entries in both tables.
