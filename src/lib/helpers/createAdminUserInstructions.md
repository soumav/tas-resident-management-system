
# Creating an Admin User Manually

After creating a user through Supabase Authentication (via sign up), follow these steps to manually add them to the database tables with admin privileges:

## Option 1: Using the SQL Editor in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor in Supabase
3. Run the following SQL which automatically generates a UUID:

```sql
-- Generate a UUID and create admin entries in both tables
DO $$ 
DECLARE
    new_user_id UUID := uuid_generate_v4();
BEGIN
    -- Insert into users table with admin role
    INSERT INTO users (id, email, role, created_at)
    VALUES 
      (new_user_id, 'soumav91@gmail.com', 'admin', NOW())
    ON CONFLICT (email) DO UPDATE 
      SET role = 'admin'
      RETURNING id INTO new_user_id;

    -- Insert into profiles table
    INSERT INTO profiles (id, name, email, created_at)
    VALUES 
      (new_user_id, 'Soumav Das', 'soumav91@gmail.com', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Show the created user ID
    RAISE NOTICE 'Created admin user with ID: %', new_user_id;
END $$;
```

## Option 2: Using an Existing Authenticated User

If you've already created a user through authentication and want to make them an admin:

1. Find the user's UUID from the Authentication dashboard
2. Run this simpler SQL:

```sql
-- Make existing user an admin
UPDATE users
SET role = 'admin'
WHERE email = 'soumav91@gmail.com';

-- If needed, update or create a profile entry
INSERT INTO profiles (id, name, email, created_at)
SELECT id, 'Soumav Das', 'soumav91@gmail.com', NOW()
FROM users
WHERE email = 'soumav91@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

## Verification

To verify the user has been correctly added with admin privileges:

```sql
SELECT u.id, u.email, u.role, p.name
FROM users u 
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'soumav91@gmail.com';
```

The query should show the user with role 'admin' and entries in both tables.
