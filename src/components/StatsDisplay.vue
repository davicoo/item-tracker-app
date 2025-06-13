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
</script>

<style scoped>
/* Basic styling */
</style>
