
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
