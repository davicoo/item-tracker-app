import { supabase } from '../supabaseClient';
import type { Item } from '../types/item';

export interface Stats {
  sold: number;
  sold_paid: number;
  sold_paid_total: number;
}


export interface PeriodStats {
  last30Days: number;
  last6Months: number;
  lastYear: number;
}

const BUCKET = 'stats';
const FILE_PATH = 'current-stats.json';

export function calculateStats(items: Item[]): Stats {
  const sold = items.filter(i => i.status === 'sold').length;
  const soldPaidItems = items.filter(i => i.status === 'sold_paid');
  const sold_paid = soldPaidItems.length;
  const sold_paid_total = soldPaidItems.reduce((sum, item) => {
    const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    // Account for the 20% fee that goes to the shop
    const net = isNaN(num) ? 0 : num * 0.8;
    return sum + net;
  }, 0);
  return { sold, sold_paid, sold_paid_total };
}


export function calculatePeriodStats(items: Item[]): PeriodStats {
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(now.getDate() - 30);
  const m6 = new Date(now);
  m6.setMonth(now.getMonth() - 6);
  const y1 = new Date(now);
  y1.setFullYear(now.getFullYear() - 1);

  const countSince = (date: Date) =>
    items.filter(i => (i.status === 'sold' || i.status === 'sold_paid') && new Date(i.dateAdded) >= date).length;

  return {
    last30Days: countSince(d30),
    last6Months: countSince(m6),
    lastYear: countSince(y1)
  };
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
