-- Setup script for per-user notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete cascade,
  title text not null,
  item_type text,
  sku text,
  store text,
  text text not null,
  image_url text,
  date date,
  created_at timestamptz default now()
);

alter table public.notes enable row level security;

drop policy if exists "Individuals can delete their own notes" on public.notes;
create policy "Individuals can delete their own notes" on public.notes
  for delete using ((select auth.uid()) = user_id);

drop policy if exists "Individuals can insert their own notes" on public.notes;
create policy "Individuals can insert their own notes" on public.notes
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Individuals can update their own notes" on public.notes;
create policy "Individuals can update their own notes" on public.notes
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Individuals can view their own notes" on public.notes;
create policy "Individuals can view their own notes" on public.notes
  for select using ((select auth.uid()) = user_id);
