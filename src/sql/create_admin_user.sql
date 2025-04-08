
-- SQL script to automatically create an admin user entry in both tables
-- This script generates a UUID automatically during insertion

-- Generate a UUID for the new admin user
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

    -- Verify that both entries were created successfully
    RAISE NOTICE 'Created admin user with ID: %', new_user_id;
END $$;

-- Verification query - run this separately after the above transaction completes
-- SELECT u.id, u.email, u.role, p.name
-- FROM users u 
-- LEFT JOIN profiles p ON u.id = p.id
-- WHERE u.email = 'soumav91@gmail.com';

