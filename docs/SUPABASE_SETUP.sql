-- SQL script to set up per-user items and storage
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Create items table with a user_id column
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  details text not null,
  status text not null default 'not_sold',
  location text,
  price numeric,
  fee_percent numeric default 20,
  quantity integer default 1,
  sku_codes text[],
  image_url text,
  date_added timestamptz default now(),
  tags text[]
);

-- Restrict rows to their owners
alter table public.items enable row level security;

create policy "select own items" on public.items
  for select using (auth.uid() = user_id);

create policy "insert own items" on public.items
  for insert with check (auth.uid() = user_id);

create policy "update own items" on public.items
  for update using (auth.uid() = user_id);

create policy "delete own items" on public.items
  for delete using (auth.uid() = user_id);

-- Images bucket for uploads
insert into storage.buckets (id, name, public)
values ('images', 'images', false)
on conflict (id) do nothing;

create policy "user images" on storage.objects
  for all
  using (
    bucket_id = 'images' and auth.uid() = split_part(name, '/', 1)::uuid
  )
  with check (
    bucket_id = 'images' and auth.uid() = split_part(name, '/', 1)::uuid
  );

-- Bucket for storing per-user stats
insert into storage.buckets (id, name, public)
values ('stats', 'stats', false)
on conflict (id) do nothing;

create policy "user stats" on storage.objects
  for all
  using (
    bucket_id = 'stats' and auth.uid() = split_part(name, '/', 1)::uuid
  )
  with check (
    bucket_id = 'stats' and auth.uid() = split_part(name, '/', 1)::uuid
  );
