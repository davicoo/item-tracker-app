-- Adds sold_dates column to track individual sale dates
ALTER TABLE items
ADD COLUMN IF NOT EXISTS sold_dates text[] DEFAULT '{}';
