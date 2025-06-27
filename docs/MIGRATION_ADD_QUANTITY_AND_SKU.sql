-- Migration script to add quantity and sku_codes columns
-- Run this against an existing Supabase project to update the
-- items table schema.

alter table if exists public.items
  add column if not exists quantity integer default 1;

alter table if exists public.items
  add column if not exists sku_codes text[];
