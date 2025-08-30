-- Migration script to replace auth.uid() with (select auth.uid())
-- in existing RLS policies. Run this against an existing Supabase project.

-- Profiles policies
drop policy "select own profile" on public.profiles;
create policy "select own profile" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- Items policies
drop policy "select own items" on public.items;
create policy "select own items" on public.items
  for select using ((select auth.uid()) = user_id);

drop policy "insert own items" on public.items;
create policy "insert own items" on public.items
  for insert with check ((select auth.uid()) = user_id);

drop policy "update own items" on public.items;
create policy "update own items" on public.items
  for update using ((select auth.uid()) = user_id);

drop policy "delete own items" on public.items;
create policy "delete own items" on public.items
  for delete using ((select auth.uid()) = user_id);

-- Storage policies
drop policy "user images" on storage.objects;
create policy "user images" on storage.objects
  for all
  using (
    bucket_id = 'images' and (select auth.uid()) = split_part(name, '/', 1)::uuid
  )
  with check (
    bucket_id = 'images' and (select auth.uid()) = split_part(name, '/', 1)::uuid
  );

drop policy "user stats" on storage.objects;
create policy "user stats" on storage.objects
  for all
  using (
    bucket_id = 'stats' and (select auth.uid()) = split_part(name, '/', 1)::uuid
  )
  with check (
    bucket_id = 'stats' and (select auth.uid()) = split_part(name, '/', 1)::uuid
  );

