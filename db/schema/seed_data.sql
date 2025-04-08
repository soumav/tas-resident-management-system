
-- ===============================
-- INSERT INITIAL ADMIN USER
-- ===============================

-- Check if admin user already exists in auth.users
DO $$
DECLARE
  admin_exists boolean;
  admin_user_id uuid;
BEGIN
  -- Check if the admin user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@alicesanctuary.com'
  ) INTO admin_exists;
  
  -- Only insert if admin doesn't exist
  IF NOT admin_exists THEN
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      aud,
      role,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      last_sign_in_at,
      confirmation_token,
      email_change_token_new,
      is_super_admin,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@alicesanctuary.com', 
      crypt('Admin123!', gen_salt('bf')), -- Replace 'Admin123!' with a secure password
      now(),
      'authenticated',
      'authenticated',
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      now(),
      now(),
      now(),
      '',
      '',
      FALSE,
      ''
    );
    
    -- Get the user ID for the newly created admin
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@alicesanctuary.com' LIMIT 1;
    
    -- Insert into our custom users table
    INSERT INTO users (id, email, role)
    VALUES (admin_user_id, 'admin@alicesanctuary.com', 'admin');
    
    -- Insert into profiles table
    INSERT INTO profiles (id, name, email)
    VALUES (admin_user_id, 'System Administrator', 'admin@alicesanctuary.com');
    
    RAISE NOTICE 'Admin user created successfully.';
  ELSE
    RAISE NOTICE 'Admin user already exists. Skipping creation.';
  END IF;
END $$;
