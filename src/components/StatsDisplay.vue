<template>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
    <!-- Items Card -->
    <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <div class="flex items-center gap-x-2">
          <p class="text-xs uppercase text-gray-500 dark:text-neutral-500">
            Items
          </p>
        </div>
        <div class="mt-1 flex items-center gap-x-2">
          <h3 class="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
            {{ props.stats.items }}
          </h3>
        </div>
      </div>
    </div>
    <!-- Sold Card -->
    <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <div class="flex items-center gap-x-2">
          <p class="text-xs uppercase text-gray-500 dark:text-neutral-500">
            Sold
          </p>
        </div>
        <div class="mt-1 flex items-center gap-x-2">
          <h3 class="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
            {{ props.stats.sold }}
          </h3>
        </div>
      </div>
    </div>
    <!-- Paid Card -->
    <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <div class="flex items-center gap-x-2">
          <p class="text-xs uppercase text-gray-500 dark:text-neutral-500">
            Paid
          </p>
        </div>
        <div class="mt-1 flex items-center gap-x-2">
          <h3 class="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
            {{ props.stats.sold_paid }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Paid/Outstanding Toggle Card -->
    <div
      class="flex flex-col bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-2xs rounded-xl border border-blue-400 dark:from-blue-500 dark:to-purple-600 dark:border-blue-500 cursor-pointer"
      @click="toggleOutstanding"
    >
      <div class="p-4 md:p-5">
        <div class="flex items-center gap-x-2">
          <p class="text-xs uppercase opacity-90">
            {{ showOutstanding ? 'Outstanding' : 'Paid Total' }}
          </p>
        </div>
        <div class="mt-1 flex items-center gap-x-2">
          <h3 class="text-xl sm:text-2xl font-medium">
            $
            {{
              (showOutstanding
                ? props.stats.sold_unpaid_total
                : props.stats.sold_paid_total
              ).toFixed(2)
            }}
          </h3>
        </div>
      </div>
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

