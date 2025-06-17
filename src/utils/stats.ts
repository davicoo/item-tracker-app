import { supabase } from '../supabaseClient';
import type { Item } from '../types/item';

export interface Stats {
  items: number;
  sold: number;
  sold_paid: number;
  sold_paid_total: number;
}


export interface PeriodStats {
  last30Days: number;
  last6Months: number;
  lastYear: number;
}

export interface PeriodTotals {
  last30Days: number;
  last6Months: number;
  lastYear: number;
}

const BUCKET = 'stats';
const FILE_NAME = 'current-stats.json';

async function buildPath(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  return userId ? `${userId}/${FILE_NAME}` : null;
}

export function calculateStats(items: Item[]): Stats {
  const total = items.length;
  const sold = items.filter(i => i.status === 'sold').length;
  const soldPaidItems = items.filter(i => i.status === 'sold_paid');
  const sold_paid = soldPaidItems.length;
  const sold_paid_total = soldPaidItems.reduce((sum, item) => {
    const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    // Account for the 20% fee that goes to the shop
    const net = isNaN(num) ? 0 : num * 0.8;
    return sum + net;
  }, 0);
  return { items: total, sold, sold_paid, sold_paid_total };
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

export function calculatePeriodTotals(items: Item[]): PeriodTotals {
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(now.getDate() - 30);
  const m6 = new Date(now);
  m6.setMonth(now.getMonth() - 6);
  const y1 = new Date(now);
  y1.setFullYear(now.getFullYear() - 1);

  const totalSince = (date: Date) =>
    items.reduce((sum, item) => {
      if (item.status === 'sold_paid' && new Date(item.dateAdded) >= date) {
        const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
        const net = isNaN(num) ? 0 : num * 0.8;
        return sum + net;
      }
      return sum;
    }, 0);

  return {
    last30Days: totalSince(d30),
    last6Months: totalSince(m6),
    lastYear: totalSince(y1)
  };
}

export async function fetchStats(): Promise<Stats | null> {
  const path = await buildPath();
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) {
    console.error('Error downloading stats:', error);
    return null;
  }
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as Partial<Stats>;
    return {
      items: parsed.items ?? 0,
      sold: parsed.sold ?? 0,
      sold_paid: parsed.sold_paid ?? 0,
      sold_paid_total: parsed.sold_paid_total ?? 0
    };
  } catch (err) {
    console.error('Error parsing stats:', err);
    return null;
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  const path = await buildPath();
  if (!path) return;
  const blob = new Blob([JSON.stringify(stats)], { type: 'application/json' });
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'application/json'
  });
  if (error) {
    console.error('Error uploading stats:', error);
  }
}
