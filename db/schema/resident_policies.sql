
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
