
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
alter table residents enable row level security;
alter table resident_types enable row level security;
alter table resident_categories enable row level security;
alter table resident_groups enable row level security;
alter table resident_subgroups enable row level security;
alter table staff enable row level security;
alter table volunteers enable row level security;
alter table messages enable row level security;

-- Create policies
-- Users can read all users but only update themselves
create policy "Users can read all users" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- Profiles policies
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Everyone can read residents and related tables
create policy "Anyone can read residents" on residents for select using (true);
create policy "Anyone can read resident types" on resident_types for select using (true);
create policy "Anyone can read resident categories" on resident_categories for select using (true);
create policy "Anyone can read resident groups" on resident_groups for select using (true);
create policy "Anyone can read resident subgroups" on resident_subgroups for select using (true);

-- Staff and admin can create/update/delete residents
create policy "Staff can manage residents" on residents 
  for all using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and (users.role = 'staff' or users.role = 'admin')
  ));

-- Only admin can manage staff
create policy "Admin can manage staff" on staff 
  for all using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and users.role = 'admin'
  ));

-- Staff and admin can manage volunteers
create policy "Staff can manage volunteers" on volunteers 
  for all using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and (users.role = 'staff' or users.role = 'admin')
  ));

-- Messages can be read by staff
create policy "Staff can read all messages" on messages 
  for select using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and (users.role = 'staff' or users.role = 'admin')
  ));

-- Messages can be created by authenticated users
create policy "Authenticated users can create messages" on messages 
  for insert with check (auth.uid() = user_id);

-- Staff and admin can manage groups and subgroups
create policy "Staff can manage groups" on resident_groups
  for all using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and (users.role = 'staff' or users.role = 'admin')
  ));

create policy "Staff can manage subgroups" on resident_subgroups
  for all using (exists (
    select 1 from users 
    where users.id = auth.uid() 
    and (users.role = 'staff' or users.role = 'admin')
  ));
