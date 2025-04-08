
-- SQL script to create an admin user entry in both tables
-- This script generates a UUID automatically during insertion

-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Get the user ID from auth.users if it already exists
DO $$ 
DECLARE
    new_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists in auth.users
    SELECT id, true INTO new_user_id, user_exists
    FROM auth.users 
    WHERE email = 'soumav91@gmail.com'
    LIMIT 1;
    
    -- If user doesn't exist in auth, generate a new UUID
    IF user_exists IS NULL THEN
        new_user_id := uuid_generate_v4();
        RAISE NOTICE 'Generated new UUID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Found existing user with ID: %', new_user_id;
    END IF;

    -- Insert into users table with admin role, using ON CONFLICT for idempotent execution
    INSERT INTO public.users (id, email, role, created_at)
    VALUES 
      (new_user_id, 'soumav91@gmail.com', 'admin', NOW())
    ON CONFLICT (email) DO UPDATE 
      SET role = 'admin', id = new_user_id
      RETURNING id INTO new_user_id;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, name, email, created_at)
    VALUES 
      (new_user_id, 'Soumav Das', 'soumav91@gmail.com', NOW())
    ON CONFLICT (id) DO UPDATE
      SET name = 'Soumav Das', email = 'soumav91@gmail.com';

    -- Also insert into auth.users if it doesn't exist there (requires superuser privileges)
    -- This part may need to be executed by a DB admin if you don't have sufficient privileges
    -- Or alternatively, you can use the Supabase admin UI to create this user

    RAISE NOTICE 'Created/Updated admin user with ID: %', new_user_id;

    -- Also explicitly update user_id mapping in auth schema if needed
    -- This typically requires superadmin privileges and may fail in some environments
    BEGIN
        UPDATE auth.users 
        SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
        WHERE id = new_user_id;
        RAISE NOTICE 'Updated auth.users metadata for user: %', new_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update auth.users metadata. This is normal if you do not have superadmin privileges.';
    END;
END $$;

-- Verification query - run this separately after the above transaction completes
-- SELECT u.id, u.email, u.role, p.name
-- FROM users u 
-- LEFT JOIN profiles p ON u.id = p.id
-- WHERE u.email = 'soumav91@gmail.com';

-- Also check auth metadata - requires admin privileges
-- SELECT id, email, raw_app_meta_data, raw_user_meta_data 
-- FROM auth.users 
-- WHERE email = 'soumav91@gmail.com';
