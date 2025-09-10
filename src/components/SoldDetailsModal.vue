<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="emit('close')"
      >
        ✕
      </button>
      <h2 class="mb-4 text-xl font-semibold">
        Sold Items Details
      </h2>
      <div class="p-0">
        <div class="flex flex-wrap gap-4 mb-6">
          <select
            v-model="selectedMonth"
            class="select select-bordered"
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
          <select
            v-model="selectedStore"
            class="select select-bordered"
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
          <select
            v-model="selectedCategory"
            class="select select-bordered"
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
        </div>

        <h3 class="mb-2 text-lg font-semibold">
          Sold Items
        </h3>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>
                  Item
                </th>
                <th>
                  Sale Dates
                </th>
                <th>
                  Days Between Last Sales
                </th>
                <th>
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredSoldItems"
                :key="item.id"
                class="hover"
              >
                <td>
                  {{ item.name }}
                </td>
                <td>
                  <div v-if="item.saleDates && item.saleDates.length">
                    <div
                      v-for="(d, i) in item.saleDates"
                      :key="i"
                    >
                      {{ formatDate(d) }}
                    </div>
                  </div>
                  <span v-else>-</span>
                </td>
                <td>
                  {{ daysBetweenLastSales(item.saleDates) }}
                </td>
                <td>
                  {{ item.price || '-' }}
                </td>
              </tr>
              <tr v-if="!filteredSoldItems.length">
                <td colspan="4" class="text-center">
                  No sold items
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="mt-8 mb-2 text-lg font-semibold">
          Sales by Store
        </h3>
        <ul class="mb-6 list-disc ps-5">
          <li
            v-for="s in storeSales"
            :key="s.store"
          >
            {{ s.store }} - {{ s.count }} sold (${{ s.revenue.toFixed(2) }})
          </li>
          <li
            v-if="!storeSales.length"
            class="list-none text-gray-500"
          >
            No data
          </li>
        </ul>

        <h3 class="mb-2 text-lg font-semibold">
          Top Sold Items
        </h3>
        <ul class="mb-6 list-disc ps-5">
          <li
            v-for="ti in topSoldItems"
            :key="ti.name"
          >
            {{ ti.name }} - {{ ti.count }}
          </li>
          <li
            v-if="!topSoldItems.length"
            class="list-none text-gray-500"
          >
            No data
          </li>
        </ul>

        <h3 class="mb-2 text-lg font-semibold">
          Sales Chart
        </h3>
        <div class="w-full h-64">
          <canvas
            v-if="hasChartData"
            ref="chartCanvas"
            class="w-full h-full"
          />
          <p
            v-else
            class="flex items-center justify-center h-full text-center text-gray-500"
          >
            No sales data
          </p>
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

