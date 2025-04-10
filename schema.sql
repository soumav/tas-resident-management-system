
-- Reset tables if they exist (be careful with this in production)
drop table if exists user_approval_requests;
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
  role text not null default 'pending', -- Changed default role to 'pending'
  created_at timestamp with time zone default now() not null
);

-- Create profiles table
create table profiles (
  id uuid primary key references users(id),
  name text,
  email text,
  created_at timestamp with time zone default now() not null
);

-- Create user approval requests table
create table user_approval_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  requested_role text not null,
  status text not null default 'pending', -- pending, approved, denied
  requested_at timestamp with time zone default now() not null,
  processed_at timestamp with time zone,
  processed_by uuid references users(id),
  notes text
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
alter table user_approval_requests enable row level security;
alter table residents enable row level security;
alter table resident_types enable row level security;
alter table resident_categories enable row level security;
alter table resident_groups enable row level security;
alter table resident_subgroups enable row level security;
alter table staff enable row level security;
alter table volunteers enable row level security;
alter table messages enable row level security;

-- Note: RLS policies need to be created manually as requested by the user

-- =============================================
-- INSTRUCTIONS FOR MANUALLY CREATING ADMIN USER
-- =============================================

/*
To create your first admin user, follow these steps:

1. First, create a user through Supabase Authentication:
   - Go to Authentication → Users → "Add User"
   - Enter email and password

2. Get the UUID of the created user from the Authentication panel

3. Run the following SQL queries, replacing:
   - 'admin-user-uuid' with the actual UUID from step 2
   - 'admin@example.com' with your admin email
   - 'Admin User' with your admin name

-- Create the admin user in the users table
INSERT INTO users (id, email, role, created_at)
VALUES ('admin-user-uuid', 'admin@example.com', 'admin', now());

-- Create the admin profile in the profiles table
INSERT INTO profiles (id, name, email, created_at)
VALUES ('admin-user-uuid', 'Admin User', 'admin@example.com', now());

This admin user will now be able to approve or deny new user registrations.
*/
