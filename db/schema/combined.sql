-- ===============================
-- COMBINED SCHEMA FILE FOR EASY EXECUTION
-- ===============================
-- This file contains all schema definitions and operations in one file
-- for easy execution. The separated files are still maintained for better
-- organization and maintenance.

-- Reset tables if they exist (be careful with this in production)
drop table if exists messages cascade;
drop table if exists volunteers cascade;
drop table if exists staff cascade;
drop table if exists residents cascade;
drop table if exists resident_subgroups cascade;
drop table if exists resident_groups cascade;
drop table if exists resident_types cascade;
drop table if exists resident_categories cascade;
drop table if exists profiles cascade;
drop table if exists pending_users cascade;
drop table if exists users cascade;

-- Create users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  role text not null default 'user',
  created_at timestamp with time zone default now() not null
);

-- Create profiles table
create table profiles (
  id uuid primary key references users(id),
  name text,
  email text,
  created_at timestamp with time zone default now() not null
);

-- Create pending_users table for admin approval flow
create table pending_users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  requested_role text not null default 'user',
  created_at timestamp with time zone default now() not null,
  status text not null default 'pending' -- 'pending', 'approved', 'rejected'
);

-- Create resident categories table
create table resident_categories (
  id serial primary key,
  name text not null
);

-- Create resident types table
create table resident_types (
  id serial primary key,
  name text not null,
  category_id integer not null references resident_categories(id)
);

-- Create resident groups table
create table resident_groups (
  id serial primary key,
  name text not null,
  description text
);

-- Create resident subgroups table
create table resident_subgroups (
  id serial primary key,
  name text not null,
  description text,
  group_id integer not null references resident_groups(id)
);

-- Create residents table
create table residents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type_id integer not null references resident_types(id),
  group_id integer references resident_groups(id),
  subgroup_id integer references resident_subgroups(id),
  arrival_date timestamp with time zone default now() not null,
  description text,
  image_url text,
  created_at timestamp with time zone default now() not null,
  year_arrived text
);

-- Create staff table
create table staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  name text not null,
  email text not null unique,
  role text not null,
  created_at timestamp with time zone default now() not null
);

-- Create volunteers table
create table volunteers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  volunteer_type text not null,
  created_at timestamp with time zone default now() not null
);

-- Create messages table
create table messages (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid not null references residents(id),
  user_id uuid not null references users(id),
  message text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table profiles enable row level security;
alter table pending_users enable row level security;
alter table residents enable row level security;
alter table resident_types enable row level security;
alter table resident_categories enable row level security;
alter table resident_groups enable row level security;
alter table resident_subgroups enable row level security;
alter table staff enable row level security;
alter table volunteers enable row level security;
alter table messages enable row level security;

-- ===============================
-- POLICY DEFINITIONS
-- ===============================

-- Users table policies
-- Everyone can read all users for basic functionality
create policy "Anyone can read users" on users for select using (true);

-- Both staff and admin can delete users
create policy "Staff and admin can delete users" on users 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update users
create policy "Staff and admin can insert/update users" on users 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update users" on users 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Profiles policies
-- Everyone can read all profiles
create policy "Anyone can read profiles" on profiles for select using (true);

-- Both staff and admin can delete profiles
create policy "Staff and admin can delete profiles" on profiles 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update profiles
create policy "Staff and admin can insert/update profiles" on profiles 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update profiles" on profiles 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Pending users policies
-- Users can create their own pending requests
create policy "Users can create pending requests" on pending_users 
  for insert with check (auth.role() = 'anon' or auth.role() = 'authenticated');

-- Users can see their own pending requests
create policy "Users can see their own pending requests" on pending_users 
  for select using (email = auth.email());

-- Both staff and admin can delete pending users
create policy "Staff and admin can delete pending users" on pending_users 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can view pending users
create policy "Staff and admin can view pending users" on pending_users 
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can approve/reject pending users
create policy "Staff and admin can approve/reject pending users" on pending_users 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Resident tables read-only policies for regular users
-- Anyone can read residents and related tables
create policy "Anyone can read residents" on residents for select using (true);
create policy "Anyone can read resident types" on resident_types for select using (true);
create policy "Anyone can read resident categories" on resident_categories for select using (true);
create policy "Anyone can read resident groups" on resident_groups for select using (true);
create policy "Anyone can read resident subgroups" on resident_subgroups for select using (true);

-- Both staff and admin can delete residents
create policy "Staff and admin can delete residents" on residents 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update residents
create policy "Staff and admin can insert/update residents" on residents 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update residents" on residents 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Both staff and admin can delete resident types
create policy "Staff and admin can delete resident types" on resident_types
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update resident types
create policy "Staff and admin can insert/update resident types" on resident_types
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update resident types" on resident_types
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Both staff and admin can delete resident categories
create policy "Staff and admin can delete resident categories" on resident_categories
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update resident categories
create policy "Staff and admin can insert/update resident categories" on resident_categories
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update resident categories" on resident_categories
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Both staff and admin can delete resident groups
create policy "Staff and admin can delete groups" on resident_groups
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update resident groups
create policy "Staff and admin can insert/update groups" on resident_groups
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update groups" on resident_groups
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Both staff and admin can delete resident subgroups
create policy "Staff and admin can delete subgroups" on resident_subgroups
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update resident subgroups
create policy "Staff and admin can insert/update subgroups" on resident_subgroups
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update subgroups" on resident_subgroups
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and volunteer management policies
-- Only admin can delete staff
create policy "Only admin can delete staff" on staff 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

-- Staff and admin can view staff
create policy "Staff and admin can read staff" on staff 
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update staff
create policy "Staff and admin can insert staff" on staff 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update staff" on staff 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Both staff and admin can delete volunteers
create policy "Staff and admin can delete volunteers" on volunteers 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update volunteers
create policy "Staff and admin can insert volunteers" on volunteers 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update volunteers" on volunteers 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Anyone can read volunteers
create policy "Anyone can read volunteers" on volunteers 
  for select using (true);

-- Messages policies
-- Anyone can read messages
create policy "Anyone can read messages" on messages 
  for select using (true);

-- Both staff and admin can delete messages
create policy "Staff and admin can delete messages" on messages 
  for delete using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can insert/update messages
create policy "Staff and admin can insert messages" on messages 
  for insert with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can update messages" on messages 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Users can create their own messages
create policy "Users can create their own messages" on messages 
  for insert with check (auth.uid() = user_id);

-- Storage policies for the resident-images bucket
-- Enable admin to create buckets
create policy "Only admin can create buckets"
  on storage.buckets for insert 
  with check (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

-- Give everyone access to view buckets
create policy "Enable bucket access for all users"
  on storage.buckets for select using (true);

-- Grant access to objects in resident-images bucket
create policy "Give everyone access to view images"
  on storage.objects for select
  using (bucket_id = 'resident-images');

-- Both staff and admin can delete files
create policy "Staff and admin can delete files"
  on storage.objects for delete
  using (
    bucket_id = 'resident-images' and
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can upload files to resident-images
create policy "Staff and admin can upload files to resident-images"
  on storage.objects for insert 
  with check (
    bucket_id = 'resident-images' and
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can update objects in resident-images
create policy "Staff and admin can update objects in resident-images"
  on storage.objects for update
  using (
    bucket_id = 'resident-images' and
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- ===============================
-- INSERT INITIAL ADMIN USER
-- ===============================

-- Insert admin user into auth.users (you'll need to run this SQL with Supabase admin privileges)
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
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@alicesanctuary.com' LIMIT 1;

  -- Insert into our custom users table
  INSERT INTO users (id, email, role)
  VALUES (admin_user_id, 'admin@alicesanctuary.com', 'admin');
  
  -- Insert into profiles table
  INSERT INTO profiles (id, name, email)
  VALUES (admin_user_id, 'System Administrator', 'admin@alicesanctuary.com');
END $$;
