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
import { ref, onMounted, computed } from 'vue';
import { fetchStats, type Stats } from '../utils/stats';

const props = defineProps<{ stats?: Stats }>();

const fetchedStats = ref<Stats>({ sold: 0, sold_paid: 0 });

onMounted(async () => {
  if (!props.stats) {
    const stored = await fetchStats();
    if (stored) {
      fetchedStats.value = stored;
    }
  }
});

const stats = computed(() => props.stats ?? fetchedStats.value);
</script>

<style scoped>
/* Basic styling */
</style>
