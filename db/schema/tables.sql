
-- Reset policies if they exist
drop policy if exists "Anyone can read users" on users;
drop policy if exists "Staff and admin can delete users" on users;
drop policy if exists "Staff and admin can insert/update users" on users;
drop policy if exists "Staff and admin can update users" on users;

drop policy if exists "Anyone can read profiles" on profiles;
drop policy if exists "Staff and admin can delete profiles" on profiles;
drop policy if exists "Staff and admin can insert/update profiles" on profiles;
drop policy if exists "Staff and admin can update profiles" on profiles;

drop policy if exists "Users can create pending requests" on pending_users;
drop policy if exists "Users can see their own pending requests" on pending_users;
drop policy if exists "Staff and admin can delete pending users" on pending_users;
drop policy if exists "Staff and admin can view pending users" on pending_users;
drop policy if exists "Staff and admin can approve/reject pending users" on pending_users;

drop policy if exists "Anyone can read residents" on residents;
drop policy if exists "Staff and admin can delete residents" on residents;
drop policy if exists "Staff and admin can insert/update residents" on residents;
drop policy if exists "Staff and admin can update residents" on residents;

drop policy if exists "Anyone can read resident types" on resident_types;
drop policy if exists "Staff and admin can delete resident types" on resident_types;
drop policy if exists "Staff and admin can insert/update resident types" on resident_types;
drop policy if exists "Staff and admin can update resident types" on resident_types;

drop policy if exists "Anyone can read resident categories" on resident_categories;
drop policy if exists "Staff and admin can delete resident categories" on resident_categories;
drop policy if exists "Staff and admin can insert/update resident categories" on resident_categories;
drop policy if exists "Staff and admin can update resident categories" on resident_categories;

drop policy if exists "Anyone can read resident groups" on resident_groups;
drop policy if exists "Staff and admin can delete groups" on resident_groups;
drop policy if exists "Staff and admin can insert/update groups" on resident_groups;
drop policy if exists "Staff and admin can update groups" on resident_groups;

drop policy if exists "Anyone can read resident subgroups" on resident_subgroups;
drop policy if exists "Staff and admin can delete subgroups" on resident_subgroups;
drop policy if exists "Staff and admin can insert/update subgroups" on resident_subgroups;
drop policy if exists "Staff and admin can update subgroups" on resident_subgroups;

drop policy if exists "Only admin can delete staff" on staff;
drop policy if exists "Staff and admin can read staff" on staff;
drop policy if exists "Staff and admin can insert staff" on staff;
drop policy if exists "Staff and admin can update staff" on staff;

drop policy if exists "Anyone can read volunteers" on volunteers;
drop policy if exists "Staff and admin can delete volunteers" on volunteers;
drop policy if exists "Staff and admin can insert volunteers" on volunteers;
drop policy if exists "Staff and admin can update volunteers" on volunteers;

drop policy if exists "Anyone can read messages" on messages;
drop policy if exists "Staff and admin can delete messages" on messages;
drop policy if exists "Staff and admin can insert messages" on messages;
drop policy if exists "Staff and admin can update messages" on messages;
drop policy if exists "Users can create their own messages" on messages;

drop policy if exists "Only admin can create buckets" on storage.buckets;
drop policy if exists "Enable bucket access for all users" on storage.buckets;
drop policy if exists "Give everyone access to view images" on storage.objects;
drop policy if exists "Staff and admin can delete files" on storage.objects;
drop policy if exists "Staff and admin can upload files to resident-images" on storage.objects;
drop policy if exists "Staff and admin can update objects in resident-images" on storage.objects;

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
-- ... keep existing code (the remaining table creation code)
