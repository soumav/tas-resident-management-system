
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
