<template>
  <div class="p-4 space-y-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="text-sm text-gray-500">
          Total Items Sold
        </h2>
        <p class="text-2xl font-semibold">
          {{ totalItemsSold }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="text-sm text-gray-500">
          Total Revenue
        </h2>
        <p class="text-2xl font-semibold">
          ${{ totalRevenue.toFixed(2) }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="text-sm text-gray-500">
          Average Sale Price
        </h2>
        <p class="text-2xl font-semibold">
          ${{ avgPrice.toFixed(2) }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="text-sm text-gray-500">
          Top Selling Item
        </h2>
        <p class="text-2xl font-semibold">
          {{ topSeller }}
        </p>
      </div>
    </div>

    <section>
      <h3 class="text-lg font-semibold mb-2">
        Monthly Sales
      </h3>
      <div class="flex space-x-4 overflow-x-auto snap-x">
        <div
          v-for="m in monthlyBreakdown"
          :key="m.month"
          class="min-w-[150px] bg-white rounded-xl shadow p-4 snap-start"
        >
          <h4 class="text-sm text-gray-500">
            {{ m.month }}
          </h4>
          <p class="text-xl font-semibold">
            {{ m.count }} sold
          </p>
          <p class="text-sm text-gray-600">
            ${{ m.revenue.toFixed(2) }}
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-lg font-semibold mb-2">
        Top Items
      </h3>
      <ul class="space-y-2">
        <li
          v-for="item in topItems"
          :key="item.name"
          class="bg-white rounded-xl shadow p-4 flex justify-between"
        >
          <div>
            <p class="font-medium">
              {{ item.name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ item.count }} sold
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">
              Revenue
            </p>
            <p class="font-semibold">
              ${{ item.revenue.toFixed(2) }}
            </p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Sale {
  id: number;
  name: string;
  price: number;
  date: string;
}

const sales = ref<Sale[]>([
  { id: 1, name: 'Widget', price: 25, date: '2024-05-10' },
  { id: 2, name: 'Gadget', price: 35, date: '2024-05-21' },
  { id: 3, name: 'Widget', price: 30, date: '2024-06-02' },
  { id: 4, name: 'Thing', price: 20, date: '2024-06-15' },
]);

const totalItemsSold = computed(() => sales.value.length);

const totalRevenue = computed(() =>
  sales.value.reduce((sum, sale) => sum + sale.price, 0)
);

const avgPrice = computed(() =>
  totalItemsSold.value ? totalRevenue.value / totalItemsSold.value : 0
);

const topSeller = computed(() => {
  const counts: Record<string, number> = {};
  sales.value.forEach((s) => {
    counts[s.name] = (counts[s.name] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || '';
});

const monthlyBreakdown = computed(() => {
  const groups: Record<string, { count: number; revenue: number }> = {};
  sales.value.forEach((s) => {
    const date = new Date(s.date);
    const key = date.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });
    if (!groups[key]) {
      groups[key] = { count: 0, revenue: 0 };
    }
    groups[key].count += 1;
    groups[key].revenue += s.price;
  });
  return Object.entries(groups).map(([month, data]) => ({ month, ...data }));
});

const topItems = computed(() => {
  const map: Record<string, { name: string; count: number; revenue: number }> = {};
  sales.value.forEach((s) => {
    if (!map[s.name]) {
      map[s.name] = { name: s.name, count: 0, revenue: 0 };
    }
    map[s.name].count += 1;
    map[s.name].revenue += s.price;
  });
  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});
</script>

<style scoped>
</style>

