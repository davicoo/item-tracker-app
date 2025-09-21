<template>
  <div
    class="fixed inset-0 z-[720] overflow-y-auto bg-[--overlay-bg] px-4 py-8 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-white/98 via-primary-50/85 to-white/98 shadow-2xl shadow-primary-900/20 backdrop-blur-2xl ring-1 ring-white/70">
      <span class="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl" />
      <span class="pointer-events-none absolute -left-16 bottom-12 h-56 w-56 rounded-full bg-secondary-200/25 blur-[120px]" />
      <button
        type="button"
        class="absolute right-6 top-6 inline-flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-primary-600 shadow-lg shadow-primary-900/15 backdrop-blur transition hover:bg-primary-50/80 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        @click="emit('close')"
      >
        <span class="sr-only">Close</span>
        <svg
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 6l12 12M6 18 18 6" />
        </svg>
      </button>
      <div class="relative max-h-[80vh] overflow-y-auto px-6 pb-10 pt-8 sm:px-10">
        <div class="max-w-3xl">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
            Sales Overview
          </p>
          <h2 class="mt-2 text-3xl font-semibold text-title text-primary-900">
            Sold Items Details
          </h2>
          <p class="mt-3 text-sm text-primary-600">
            Analyze performance across months, stores, and categories to understand how inventory is moving.
          </p>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <label class="flex flex-col gap-2 text-sm text-primary-600">
            <span class="font-medium text-primary-700">Month</span>
            <select
              v-model="selectedMonth"
              class="w-full rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-sm shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
          <label class="flex flex-col gap-2 text-sm text-primary-600">
            <span class="font-medium text-primary-700">Store</span>
            <select
              v-model="selectedStore"
              class="w-full rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-sm shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
          <label class="flex flex-col gap-2 text-sm text-primary-600">

            <span class="font-medium text-primary-700">Category</span>
            <select
              v-model="selectedCategory"
              class="w-full rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-sm shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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

        <div class="mt-10 overflow-hidden rounded-2xl border border-primary-100 shadow-lg shadow-primary-900/15">
          <div class="border-b border-primary-100 bg-white/90 px-6 py-4">
            <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">
              Sold Items
            </h3>
          </div>
          <div class="max-h-[320px] overflow-auto bg-white/85">
            <table class="min-w-full divide-y divide-primary-100">
              <thead class="bg-white/95">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    Item
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    Sale Dates
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    Days Between Last Sales
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-100">
                <tr
                  v-for="item in filteredSoldItems"
                  :key="item.id"
                  class="transition hover:bg-primary-50/60"
                >
                  <td class="px-6 py-4 text-sm font-medium text-title">
                    {{ item.name }}
                  </td>
                  <td class="px-6 py-4 text-sm text-[--body-text-color]">
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
                      class="text-primary-500/70"
                    >-</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-[--body-text-color]">
                    {{ daysBetweenLastSales(item.saleDates) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-[--body-text-color]">
                    {{ item.price || '-' }}
                  </td>
                </tr>
                <tr v-if="!filteredSoldItems.length">
                  <td
                    colspan="4"
                    class="px-6 py-12 text-center text-sm text-primary-600"
                  >
                    No sold items match the selected filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-primary-100 bg-white/95 p-6 shadow-lg shadow-primary-900/15 backdrop-blur">
            <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">
              Sales by Store
            </h3>
            <ul class="mt-4 space-y-3 text-sm text-[--body-text-color]">
              <li
                v-for="s in storeSales"
                :key="s.store"
                class="flex items-center justify-between rounded-card bg-white/90 px-4 py-3 text-sm shadow-inner shadow-primary-900/5"
              >
                <span class="font-medium text-primary-800">{{ s.store }}</span>
                <span class="text-primary-600">{{ s.count }} sold · ${{ s.revenue.toFixed(2) }}</span>
              </li>
              <li
                v-if="!storeSales.length"
                class="rounded-card bg-white/90 px-4 py-3 text-sm text-primary-600"
              >
                No store data available.
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-primary-100 bg-white/95 p-6 shadow-lg shadow-primary-900/15 backdrop-blur">
            <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">
              Top Sold Items
            </h3>
            <ul class="mt-4 space-y-3 text-sm text-[--body-text-color]">
              <li
                v-for="ti in topSoldItems"
                :key="ti.name"
                class="flex items-center justify-between rounded-card bg-white/90 px-4 py-3 text-sm shadow-inner shadow-primary-900/5"
              >
                <span class="font-medium text-primary-800">{{ ti.name }}</span>
                <span class="text-primary-600">{{ ti.count }} sold</span>
              </li>
              <li
                v-if="!topSoldItems.length"
                class="rounded-card bg-white/90 px-4 py-3 text-sm text-primary-600"
              >
                No top sellers yet.
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 rounded-2xl border border-dashed border-primary-100 bg-white/95 p-6 shadow-inner shadow-primary-900/10">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">
              Sales Chart
            </h3>
            <p class="text-xs text-primary-500">
              Visualize month-over-month sales momentum.
            </p>
          </div>
          <div class="mt-6 h-64 rounded-card bg-white/95 p-4 shadow-inner shadow-primary-900/10">
            <canvas
              v-if="hasChartData"
              ref="chartCanvas"
              class="h-full w-full"
            />
            <p
              v-else
              class="flex h-full items-center justify-center text-center text-sm text-primary-500"
            >
              No sales data available for the selected filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Item } from '../types/item';
import Chart from 'chart.js/auto';

const props = defineProps<{ items: Item[] }>();
const emit = defineEmits(['close']);

const selectedMonth = ref('');
const selectedStore = ref('');
const selectedCategory = ref('');

const soldItems = computed(() =>
  props.items.filter(i => i.status === 'sold' || i.status === 'sold_paid')
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
    const matchCat =
      !selectedCategory.value || item.tags.includes(selectedCategory.value);
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

watch(topSoldItems, renderChart);
onMounted(renderChart);
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

<style scoped>
/* basic styling */
</style>

