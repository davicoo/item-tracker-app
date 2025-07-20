<template>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-md p-4 text-center">
      <h2 class="text-sm text-gray-500 uppercase">
        Items
      </h2>
      <p class="text-2xl font-semibold text-gray-800">
        {{ props.stats.items }}
      </p>
    </div>
    <div class="bg-white rounded-xl shadow-md p-4 text-center">
      <h2 class="text-sm text-gray-500 uppercase">
        Sold
      </h2>
      <p class="text-2xl font-semibold text-gray-800">
        {{ props.stats.sold }}
      </p>
    </div>
    <div class="bg-white rounded-xl shadow-md p-4 text-center">
      <h2 class="text-sm text-gray-500 uppercase">
        Paid
      </h2>
      <p class="text-2xl font-semibold text-gray-800">
        {{ props.stats.sold_paid }}
      </p>
    </div>
    <div
      class="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white shadow-md p-4 text-center cursor-pointer"
      @click="toggleOutstanding"
    >
      <h2 class="text-sm uppercase">
        {{ showOutstanding ? 'Outstanding' : 'Paid Total' }}
      </h2>
      <p class="text-2xl font-bold">
        $
        {{
          (showOutstanding
            ? props.stats.sold_unpaid_total
            : props.stats.sold_paid_total
          ).toFixed(2)
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Stats } from '../utils/stats';

const props = defineProps<{
  stats: Stats;
}>();

const showOutstanding = ref(false);
const toggleOutstanding = () => {
  showOutstanding.value = !showOutstanding.value;
};
</script>

<style scoped>
/* Basic styling */
</style>
