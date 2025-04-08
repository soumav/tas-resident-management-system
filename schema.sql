
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
drop table if exists pending_users;
drop table if exists users;

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
  created_at timestamp with time zone default now() not null
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

-- Only admin and staff can insert/update/delete users
create policy "Staff and admin can manage users" on users 
  for all using (
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

-- Only admin and staff can insert/update/delete profiles
create policy "Staff and admin can manage profiles" on profiles 
  for all using (
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

-- Only admin and staff can view all pending users
create policy "Staff and admin can view pending users" on pending_users 
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Only admin and staff can approve or reject pending users
create policy "Staff and admin can approve/reject pending users" on pending_users 
  for update using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Only admin and staff can delete pending users
create policy "Staff and admin can delete pending users" on pending_users 
  for delete using (
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

-- Staff and admin can manage residents and related tables
create policy "Staff and admin can manage residents" on residents 
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can manage resident types" on resident_types
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can manage resident categories" on resident_categories
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can manage groups" on resident_groups
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

create policy "Staff and admin can manage subgroups" on resident_subgroups
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and volunteer management policies
-- Only admin can manage staff
create policy "Admin can manage staff" on staff 
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

-- Only staff and admin can read staff
create policy "Staff and admin can read staff" on staff 
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Staff and admin can manage volunteers
create policy "Staff and admin can manage volunteers" on volunteers 
  for all using (
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

-- Staff and admin can manage messages
create policy "Staff and admin can manage messages" on messages 
  for all using (
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
-- Enable admin and staff to create buckets
create policy "Enable bucket creation for staff and admin"
  on storage.buckets for insert 
  using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and (users.role = 'staff' or users.role = 'admin')
    )
  );

-- Give everyone access to view buckets
create policy "Enable bucket access for all users"
  on storage.buckets for select using (true);

-- Grant access to objects in resident-images bucket
create policy "Give everyone access to view images"
  on storage.objects for select
  using (bucket_id = 'resident-images');

-- Allow staff and admin to upload files to resident-images
create policy "Allow staff and admin to upload files to resident-images"
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

-- Allow staff and admin to update objects in resident-images
create policy "Allow staff and admin to update objects in resident-images"
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

-- Allow staff and admin to delete objects in resident-images
create policy "Allow staff and admin to delete objects in resident-images"
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
