<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <router-link
          to="/app"
          class="text-blue-600 hover:underline"
        >
          &larr; Back
        </router-link>
        <h1 class="text-2xl font-bold">
          Sold Items Details
        </h1>
        <span />
      </div>

      <div class="bg-white rounded-lg p-4">
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
                <th>Item</th>
                <th>Date Sold</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredSoldItems"
                :key="item.id"
                class="hover"
              >
                <td>{{ item.name }}</td>
                <td>{{ formatDate(item.dateAdded) }}</td>
                <td>{{ item.price || '-' }}</td>
              </tr>
              <tr v-if="!filteredSoldItems.length">
                <td
                  colspan="3"
                  class="text-center"
                >
                  No sold items
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="mt-8 mb-2 text-lg font-semibold">
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
import { supabase } from './supabaseClient';
import type { Item } from './types/item';
import { mapRecordToItem } from './types/item';
import Chart from 'chart.js/auto';

const items = ref<Item[]>([]);

const selectedMonth = ref('');
const selectedStore = ref('');
const selectedCategory = ref('');

const soldItems = computed(() =>
  items.value.filter(i => i.status === 'sold' || i.status === 'sold_paid')
);

const months = computed(() => {
  const set = new Set<string>();
  for (const item of soldItems.value) {
    const d = new Date(item.dateAdded);
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
    const d = new Date(item.dateAdded);
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

async function fetchItems() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false });
  if (!error && data) {
    items.value = data.map(mapRecordToItem);
  }
}

watch(topSoldItems, renderChart);
onMounted(async () => {
  await fetchItems();
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

<style scoped>
/* basic styling */
</style>

