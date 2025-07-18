import { supabase } from '../supabaseClient';
import type { Item } from '../types/item';

export interface Stats {
  items: number;
  sold: number;
  sold_paid: number;
  sold_paid_total: number;
  sold_unpaid_total: number;
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
    const fee = typeof item.feePercent === 'number' ? item.feePercent : 20;
    const net = isNaN(num) ? 0 : num * (1 - fee / 100);
    return sum + net;
  }, 0);
  const soldUnpaidItems = items.filter(i => i.status === 'sold');
  const sold_unpaid_total = soldUnpaidItems.reduce((sum, item) => {
    const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    const fee = typeof item.feePercent === 'number' ? item.feePercent : 20;
    const net = isNaN(num) ? 0 : num * (1 - fee / 100);
    return sum + net;
  }, 0);
  return { items: total, sold, sold_paid, sold_paid_total, sold_unpaid_total };
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
        const fee = typeof item.feePercent === 'number' ? item.feePercent : 20;
        const net = isNaN(num) ? 0 : num * (1 - fee / 100);
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
      sold_paid_total: parsed.sold_paid_total ?? 0,
      sold_unpaid_total: parsed.sold_unpaid_total ?? 0
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

export interface MonthlyRevenue {
  labels: string[];
  totals: number[];
}

export function calculateMonthlyRevenue(items: Item[]): MonthlyRevenue {
  const labels: string[] = [];
  const totals: number[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    labels.push(start.toLocaleString('default', { month: 'short' }));
    const total = items.reduce((sum, item) => {
      if (
        item.status === 'sold_paid' &&
        new Date(item.dateAdded) >= start &&
        new Date(item.dateAdded) < end
      ) {
        const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
        const fee = typeof item.feePercent === 'number' ? item.feePercent : 20;
        const net = isNaN(num) ? 0 : num * (1 - fee / 100);
        return sum + net;
      }
      return sum;
    }, 0);
    totals.push(total);
  }
  return { labels, totals };
}

export interface StatusDistribution {
  labels: string[];
  counts: number[];
}

export function calculateStatusDistribution(items: Item[]): StatusDistribution {
  const notSold = items.filter(i => i.status === 'not_sold').length;
  const sold = items.filter(i => i.status === 'sold').length;
  const paid = items.filter(i => i.status === 'sold_paid').length;
  return {
    labels: ['Not Sold', 'Sold', 'Paid'],
    counts: [notSold, sold, paid]
  };
}
