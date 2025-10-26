<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <router-link
          to="/app"
          class="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          &larr; Back
        </router-link>
        <div class="flex-1 text-center sm:text-left">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            Sales Overview
          </p>
          <h1 class="mt-1 text-3xl font-semibold text-gray-900">
            Sold Items Details
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            Analyze performance across months, stores, and categories to understand how inventory is moving.
          </p>
        </div>
        <span class="hidden w-16 sm:block" />
      </header>

      <div
        v-if="loading"
        class="rounded-lg bg-white p-6 text-center text-sm text-gray-600 shadow"
      >
        Loading sold item details...
      </div>
      <div
        v-else-if="error"
        class="rounded-lg bg-red-50 p-6 text-center text-sm text-red-600 shadow"
      >
        {{ error }}
      </div>
      <div
        v-else
        class="flex flex-col gap-8"
      >
        <section class="rounded-lg bg-white p-6 shadow">
          <h2 class="text-lg font-semibold text-gray-900">
            Filters
          </h2>
          <div class="mt-4 grid gap-4 md:grid-cols-3">
            <label class="flex flex-col gap-1 text-sm font-medium text-gray-700">
              <span>Month</span>
              <select
                v-model="selectedMonth"
                class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">
                  All Months
                </option>
                <option
                  v-for="m in months"
                  :key="m"
                  :value="m"
                >
                  {{ formatMonth(m) }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium text-gray-700">
              <span>Store</span>
              <select
                v-model="selectedStore"
                class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">
                  All Stores
                </option>
                <option
                  v-for="s in stores"
                  :key="s"
                  :value="s"
                >
                  {{ s }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium text-gray-700">
              <span>Category</span>
              <select
                v-model="selectedCategory"
                class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">
                  All Categories
                </option>
                <option
                  v-for="c in categories"
                  :key="c"
                  :value="c"
                >
                  {{ c }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <section class="overflow-hidden rounded-lg bg-white shadow">
          <header class="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Sold Items
            </h2>
          </header>
          <div class="max-h-[320px] overflow-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-white">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Item
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Sale Dates
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Days Between Last Sales
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="item in filteredSoldItems"
                  :key="item.id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <div
                      v-if="item.saleDates && item.saleDates.length"
                      class="space-y-1"
                    >
                      <div
                        v-for="(d, i) in item.saleDates"
                        :key="i"
                      >
                        {{ formatDate(d) }}
                      </div>
                    </div>
                    <span
                      v-else
                      class="text-gray-400"
                    >-</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ daysBetweenLastSales(item.saleDates) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ item.price || '-' }}
                  </td>
                </tr>
                <tr v-if="!filteredSoldItems.length">
                  <td
                    colspan="4"
                    class="px-6 py-12 text-center text-sm text-gray-600"
                  >
                    No sold items match the selected filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-lg bg-white p-6 shadow">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Sales by Store
            </h3>
            <ul class="mt-4 space-y-3 text-sm text-gray-600">
              <li
                v-for="s in storeSales"
                :key="s.store"
                class="flex items-center justify-between rounded border border-gray-100 px-4 py-3"
              >
                <span class="font-medium text-gray-900">{{ s.store }}</span>
                <span>{{ s.count }} sold · ${{ s.revenue.toFixed(2) }}</span>
              </li>
              <li
                v-if="!storeSales.length"
                class="rounded border border-dashed border-gray-200 px-4 py-3 text-gray-500"
              >
                No store data available.
              </li>
            </ul>
          </div>
          <div class="rounded-lg bg-white p-6 shadow">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Top Sold Items
            </h3>
            <ul class="mt-4 space-y-3 text-sm text-gray-600">
              <li
                v-for="ti in topSoldItems"
                :key="ti.name"
                class="flex items-center justify-between rounded border border-gray-100 px-4 py-3"
              >
                <span class="font-medium text-gray-900">{{ ti.name }}</span>
                <span>{{ ti.count }} sold</span>
              </li>
              <li
                v-if="!topSoldItems.length"
                class="rounded border border-dashed border-gray-200 px-4 py-3 text-gray-500"
              >
                No top sellers yet.
              </li>
            </ul>
          </div>
        </section>

        <section class="rounded-lg bg-white p-6 shadow">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Sales Chart
            </h3>
            <p class="text-xs text-gray-500">
              Visualize month-over-month sales momentum.
            </p>
          </div>
          <div class="mt-6 h-64 rounded border border-dashed border-gray-200 p-4">
            <canvas
              v-if="hasChartData"
              ref="chartCanvas"
              class="h-full w-full"
            />
            <p
              v-else
              class="flex h-full items-center justify-center text-center text-sm text-gray-500"
            >
              No sales data available for the selected filters.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import { supabase } from '@/supabaseClient';
import type { Item } from '@/types/item';
import { mapRecordToItem } from '@/types/item';

const items = ref<Item[]>([]);
const loading = ref(true);
const error = ref('');

const selectedMonth = ref('');
const selectedStore = ref('');
const selectedCategory = ref('');

async function fetchItems() {
  loading.value = true;
  error.value = '';
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      throw new Error('not-authenticated');
    }

    const { data, error: dbError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('date_added', { ascending: false });

    if (dbError) throw dbError;

    items.value = (data ?? []).map(mapRecordToItem);
  } catch (err) {
    console.error('Failed to load sold details', err);
    error.value =
      err instanceof Error && err.message === 'not-authenticated'
        ? 'You must be signed in to view sold details.'
        : 'Unable to load sold item details right now. Please try again.';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const soldItems = computed(() =>
  items.value.filter(i => i.status === 'sold' || i.status === 'sold_paid')
);

function lastSaleDate(item: Item): string {
  return item.saleDates && item.saleDates.length
    ? item.saleDates[item.saleDates.length - 1]
    : item.dateAdded;
}

const months = computed(() => {
  const set = new Set<string>();
  for (const item of soldItems.value) {
    const d = new Date(lastSaleDate(item));
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(key);
    }
  }
  return Array.from(set).sort();
});

const stores = computed(() => {
  const set = new Set<string>();
  for (const item of soldItems.value) {
    if (item.location) set.add(item.location);
  }
  return Array.from(set).sort();
});

const categories = computed(() => {
  const set = new Set<string>();
  for (const item of soldItems.value) {
    for (const tag of item.tags || []) set.add(tag);
  }
  return Array.from(set).sort();
});

const filteredSoldItems = computed(() => {
  return soldItems.value.filter(item => {
    const d = new Date(lastSaleDate(item));
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const matchMonth = !selectedMonth.value || selectedMonth.value === monthKey;
    const matchStore = !selectedStore.value || item.location === selectedStore.value;
    const tags = item.tags ?? [];
    const matchCat = !selectedCategory.value || tags.includes(selectedCategory.value);
    return matchMonth && matchStore && matchCat;
  });
});

function totalSoldFor(item: Item): number {
  const soldCounts = Object.values(item.soldCounts || {}).reduce(
    (a, b) => a + b,
    0
  );
  return item.pastSales + soldCounts;
}

const topSoldItems = computed(() => {
  const map = new Map<string, number>();
  for (const item of filteredSoldItems.value) {
    const count = totalSoldFor(item);
    map.set(item.name, (map.get(item.name) || 0) + count);
  }
  return Array.from(map, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

function daysBetweenLastSales(dates: string[] | undefined): string {
  if (!dates || dates.length < 2) return '-';
  const sorted = [...dates].sort();
  const last = new Date(sorted[sorted.length - 1]);
  const prev = new Date(sorted[sorted.length - 2]);
  const diff = last.getTime() - prev.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24)).toString();
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  const num = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

const storeSales = computed(() => {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const item of filteredSoldItems.value) {
    const key = item.location || 'Unknown';
    const count = totalSoldFor(item);
    const price = parsePrice(item.price);
    const entry = map.get(key) || { count: 0, revenue: 0 };
    entry.count += count;
    entry.revenue += count * price;
    map.set(key, entry);
  }
  return Array.from(map, ([store, data]) => ({ store, ...data }));
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const hasChartData = computed(() => topSoldItems.value.length > 0);

function renderChart() {
  if (!chartCanvas.value || !hasChartData.value) {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    return;
  }

  const labels = topSoldItems.value.map(t => t.name);
  const data = topSoldItems.value.map(t => t.count);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sales',
          data,
          backgroundColor: '#3b82f6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

watch([topSoldItems, hasChartData], () => {
  nextTick(() => {
    renderChart();
  });
});

onMounted(() => {
  fetchItems();
  renderChart();
});

onUnmounted(() => {
  if (chart) chart.destroy();
});

function formatDate(str: string): string {
  const d = new Date(str);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

function formatMonth(str: string): string {
  const [year, month] = str.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}
</script>
