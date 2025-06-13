<template>
  <div class="flex space-x-4 mb-6">
    <div class="bg-gray-100 p-4 rounded text-center">
      <p class="text-sm text-gray-600">
        Sold
      </p>
      <p class="text-xl font-bold">
        {{ stats.sold }}
      </p>
    </div>
    <div class="bg-gray-100 p-4 rounded text-center">
      <p class="text-sm text-gray-600">
        Sold &amp; Paid
      </p>
      <p class="text-xl font-bold">
        {{ stats.sold_paid }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { Stats } from '../utils/stats';

defineProps<{
  stats: Stats
}>();

import { ref, onMounted } from 'vue';
import type { Stats } from '../utils/stats';
import { fetchStats } from '../utils/stats';

const stats = ref<Stats>({ sold: 0, sold_paid: 0 });

onMounted(async () => {
  const stored = await fetchStats();
  if (stored) {
    stats.value = stored;
  }
});

</script>

<style scoped>
/* Basic styling */
</style>
