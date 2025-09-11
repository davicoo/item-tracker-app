-- Setup script for per-user folders
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table public.folders enable row level security;

drop policy if exists "Individuals can delete their own folders" on public.folders;
create policy "Individuals can delete their own folders" on public.folders
  for delete using ((select auth.uid()) = user_id);

drop policy if exists "Individuals can insert their own folders" on public.folders;
create policy "Individuals can insert their own folders" on public.folders
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Individuals can update their own folders" on public.folders;
create policy "Individuals can update their own folders" on public.folders
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Individuals can view their own folders" on public.folders;
create policy "Individuals can view their own folders" on public.folders
  for select using ((select auth.uid()) = user_id);
