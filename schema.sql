
-- Reset tables if they exist (be careful with this in production)
drop table if exists messages;
drop table if exists volunteers;
drop table if exists staff;
drop table if exists residents;
drop table if exists resident_subgroups;
drop table if exists resident_groups;
drop table if exists resident_types;
drop table if exists resident_categories;
drop table if exists profiles;
drop table if exists users;

-- Create users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  role text not null default 'user', -- 'user', 'staff', or 'admin'
  created_at timestamp with time zone default now() not null
);

-- Create profiles table
create table profiles (
  id uuid primary key references users(id),
  name text,
  email text,
  created_at timestamp with time zone default now() not null
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
alter table residents enable row level security;
alter table resident_types enable row level security;
alter table resident_categories enable row level security;
alter table resident_groups enable row level security;
alter table resident_subgroups enable row level security;
alter table staff enable row level security;
alter table volunteers enable row level security;
alter table messages enable row level security;

---------------------------------------------------------------
-- USER ROLE POLICIES
---------------------------------------------------------------

-- USERS: READ-ONLY ACCESS TO ALL TABLES
-- Users table
create policy "Users can read all users" on users for select using (true);

-- Profiles table
create policy "Users can read all profiles" on profiles for select using (true);

-- Residents table
create policy "Users can read all residents" on residents for select using (true);

-- Resident types table
create policy "Users can read all resident types" on resident_types for select using (true);

-- Resident categories table
create policy "Users can read all resident categories" on resident_categories for select using (true);

-- Resident groups table
create policy "Users can read all resident groups" on resident_groups for select using (true);

-- Resident subgroups table
create policy "Users can read all resident subgroups" on resident_subgroups for select using (true);

-- Staff table
create policy "Users can read all staff" on staff for select using (true);

-- Volunteers table
create policy "Users can read all volunteers" on volunteers for select using (true);

-- Messages table
create policy "Users can read all messages" on messages for select using (true);

---------------------------------------------------------------
-- STAFF ROLE POLICIES
---------------------------------------------------------------

-- Staff can do all operations except delete staff members
-- Users table
create policy "Staff can read all users" on users for select 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
create policy "Staff can insert users" on users for insert 
  with check (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
create policy "Staff can update users" on users for update 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
create policy "Staff can delete users except staff" on users for delete 
  using (auth.jwt() ->> 'role' = 'staff' and 
         (select role from users where id = auth.uid()) != 'staff');

-- Profiles table
create policy "Staff can manage all profiles" on profiles for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Residents table
create policy "Staff can manage all residents" on residents for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Resident types table
create policy "Staff can manage all resident types" on resident_types for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Resident categories table
create policy "Staff can manage all resident categories" on resident_categories for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Resident groups table
create policy "Staff can manage all resident groups" on resident_groups for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Resident subgroups table
create policy "Staff can manage all resident subgroups" on resident_subgroups for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Staff cannot delete other staff members
create policy "Staff can read all staff" on staff for select 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
create policy "Staff can insert staff" on staff for insert 
  with check (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
create policy "Staff can update staff" on staff for update 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');
  
-- Staff cannot delete staff (only admin can)

-- Volunteers table
create policy "Staff can manage all volunteers" on volunteers for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

-- Messages table
create policy "Staff can manage all messages" on messages for all 
  using (auth.jwt() ->> 'role' = 'staff' or auth.jwt() ->> 'role' = 'admin');

---------------------------------------------------------------
-- ADMIN ROLE POLICIES
---------------------------------------------------------------

-- Admin can do all operations on all tables
-- Users table
create policy "Admin can manage all users" on users for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Profiles table
create policy "Admin can manage all profiles" on profiles for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Residents table
create policy "Admin can manage all residents" on residents for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Resident types table
create policy "Admin can manage all resident types" on resident_types for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Resident categories table
create policy "Admin can manage all resident categories" on resident_categories for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Resident groups table
create policy "Admin can manage all resident groups" on resident_groups for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Resident subgroups table
create policy "Admin can manage all resident subgroups" on resident_subgroups for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Staff table - admin can delete staff
create policy "Admin can manage all staff" on staff for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Volunteers table
create policy "Admin can manage all volunteers" on volunteers for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Messages table
create policy "Admin can manage all messages" on messages for all 
  using (auth.jwt() ->> 'role' = 'admin');

-- Storage policies for resident images
DROP POLICY IF EXISTS "Anyone can read resident images" ON storage.objects;
CREATE POLICY "Anyone can read resident images" 
  ON storage.objects FOR select
  USING (bucket_id = 'resident-images');

DROP POLICY IF EXISTS "Staff and admin can upload resident images" ON storage.objects;
CREATE POLICY "Staff and admin can upload resident images" 
  ON storage.objects FOR insert
  WITH CHECK (bucket_id = 'resident-images' AND 
             (auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'));

DROP POLICY IF EXISTS "Staff and admin can update resident images" ON storage.objects;
CREATE POLICY "Staff and admin can update resident images" 
  ON storage.objects FOR update
  USING (bucket_id = 'resident-images' AND 
        (auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'));

DROP POLICY IF EXISTS "Staff and admin can delete resident images" ON storage.objects;
CREATE POLICY "Staff and admin can delete resident images" 
  ON storage.objects FOR delete
  USING (bucket_id = 'resident-images' AND 
        (auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'));

-- Function to allow admins to create buckets
CREATE OR REPLACE FUNCTION create_storage_bucket(bucket_id TEXT, bucket_public BOOLEAN DEFAULT false)
RETURNS void AS $$
BEGIN
  IF (SELECT auth.jwt() ->> 'role') = 'admin' THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_id, bucket_id, bucket_public);
  ELSE
    RAISE EXCEPTION 'Permission denied: only admins can create storage buckets';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy that allows the function to be called by admins
DROP POLICY IF EXISTS "Admin can create buckets" ON storage.buckets;
CREATE POLICY "Admin can create buckets" 
  ON storage.buckets FOR insert
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
