<template>
  <div
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">
          Sold Items Details
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="emit('close')"
        >
          ✖
        </button>
      </div>

      <div class="flex flex-wrap gap-4 mb-4">
        <select
          v-model="selectedMonth"
          class="border rounded p-2"
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
          class="border rounded p-2"
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
          class="border rounded p-2"
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

      <h3 class="text-lg font-semibold mb-2">
        Sold Items
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left mb-4">
          <thead>
            <tr>
              <th class="px-2 py-1">
                Item
              </th>
              <th class="px-2 py-1">
                Date Sold
              </th>
              <th class="px-2 py-1">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredSoldItems"
              :key="item.id"
              class="border-t"
            >
              <td class="px-2 py-1">
                {{ item.name }}
              </td>
              <td class="px-2 py-1">
                {{ formatDate(item.dateAdded) }}
              </td>
              <td class="px-2 py-1">
                {{ item.price || '-' }}
              </td>
            </tr>
            <tr v-if="!filteredSoldItems.length">
              <td
                colspan="3"
                class="text-center py-2 text-gray-500"
              >
                No sold items
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-lg font-semibold mb-2 mt-4">
        Top Sold Items
      </h3>
      <ul class="mb-4 list-disc pl-5">
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

      <h3 class="text-lg font-semibold mb-2">
        Sales Chart
      </h3>
      <canvas
        ref="chartCanvas"
        class="w-full h-64"
      />
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

