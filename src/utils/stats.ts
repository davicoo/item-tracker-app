import { supabase } from '../supabaseClient';
import type { Item } from '../types/item';

export interface Stats {
  sold: number;
  sold_paid: number;
}

const BUCKET = 'stats';
const FILE_PATH = 'current-stats.json';

export function calculateStats(items: Item[]): Stats {
  const sold = items.filter(i => i.status === 'sold').length;
  const sold_paid = items.filter(i => i.status === 'sold_paid').length;
  return { sold, sold_paid };
}

export async function fetchStats(): Promise<Stats | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(FILE_PATH);
  if (error || !data) {
    console.error('Error downloading stats:', error);
    return null;
  }
  try {
    const text = await data.text();
    return JSON.parse(text) as Stats;
  } catch (err) {
    console.error('Error parsing stats:', err);
    return null;
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  const blob = new Blob([JSON.stringify(stats)], { type: 'application/json' });
  const { error } = await supabase.storage.from(BUCKET).upload(FILE_PATH, blob, {
    upsert: true,
    contentType: 'application/json'
  });
  if (error) {
    console.error('Error uploading stats:', error);
  }
}
