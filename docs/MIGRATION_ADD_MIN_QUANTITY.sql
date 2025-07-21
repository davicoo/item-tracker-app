-- Migration script to add min_quantity column for restock alerts
-- Run this against an existing Supabase project.

alter table if exists public.items
  add column if not exists min_quantity integer default 0;
