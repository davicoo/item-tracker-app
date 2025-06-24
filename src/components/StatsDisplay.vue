<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white border rounded-lg shadow p-4 text-center">
      <p class="text-sm text-gray-600">
        Items
      </p>
      <p class="text-xl font-bold">
        {{ props.stats.items }}
      </p>
    </div>
    <div class="bg-white border rounded-lg shadow p-4 text-center">
      <p class="text-sm text-gray-600">
        Sold
      </p>
      <p class="text-xl font-bold">
        {{ props.stats.sold }}
      </p>
    </div>
    <div class="bg-white border rounded-lg shadow p-4 text-center">
      <p class="text-sm text-gray-600">
        Paid
      </p>
      <p class="text-xl font-bold">
        {{ props.stats.sold_paid }}
      </p>
    </div>
    <div class="bg-white border rounded-lg shadow p-4 text-center">
      <p class="text-sm text-gray-600">
        Paid Total
      </p>
      <p class="text-xl font-bold">
        ${{ props.stats.sold_paid_total.toFixed(2) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { Stats } from '../utils/stats';

const props = defineProps<{
  stats: Stats;
}>();

</script>

<style scoped>
/* Basic styling */
</style>
