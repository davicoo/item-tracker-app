<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-800 dark:border-neutral-700"
    >
      <div
        class="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-neutral-700"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
          Sold Items Details
        </h2>
        <button
          class="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700"
          @click="emit('close')"
        >
          <span class="sr-only">Close</span>
          ✖
        </button>
      </div>

      <div class="p-6">
        <div class="flex flex-wrap gap-4 mb-6">
          <select
            v-model="selectedMonth"
            class="p-2 border border-gray-300 rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
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
            class="p-2 border border-gray-300 rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
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
            class="p-2 border border-gray-300 rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
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

        <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-neutral-200">
          Sold Items
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-left dark:divide-neutral-700">
            <thead class="bg-gray-50 dark:bg-neutral-700">
              <tr>
                <th class="px-3 py-2 font-medium text-gray-600 dark:text-neutral-200">
                  Item
                </th>
                <th class="px-3 py-2 font-medium text-gray-600 dark:text-neutral-200">
                  Date Sold
                </th>
                <th class="px-3 py-2 font-medium text-gray-600 dark:text-neutral-200">
                  Price
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
              <tr
                v-for="item in filteredSoldItems"
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-neutral-700"
              >
                <td class="px-3 py-2">
                  {{ item.name }}
                </td>
                <td class="px-3 py-2">
                  {{ formatDate(item.dateAdded) }}
                </td>
                <td class="px-3 py-2">
                  {{ item.price || '-' }}
                </td>
              </tr>
              <tr v-if="!filteredSoldItems.length">
                <td
                  colspan="3"
                  class="px-3 py-4 text-center text-gray-500 dark:text-neutral-400"
                >
                  No sold items
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="mt-8 mb-2 text-lg font-semibold text-gray-800 dark:text-neutral-200">
          Top Sold Items
        </h3>
        <ul class="mb-6 list-disc ps-5 text-gray-700 dark:text-neutral-300">
          <li
            v-for="ti in topSoldItems"
            :key="ti.name"
          >
            {{ ti.name }} - {{ ti.count }}
          </li>
          <li
            v-if="!topSoldItems.length"
            class="list-none text-gray-500 dark:text-neutral-400"
          >
            No data
          </li>
        </ul>

        <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-neutral-200">
          Sales Chart
        </h3>
        <canvas
          ref="chartCanvas"
          class="w-full h-64"
        />
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

function renderChart() {
  if (!chartCanvas.value) return;
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

