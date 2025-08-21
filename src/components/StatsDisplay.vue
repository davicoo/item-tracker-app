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
    <router-link
      to="/sold-details"
      class="block bg-white rounded-xl shadow-md p-4 text-center cursor-pointer"
    >
      <h2 class="text-sm text-gray-500 uppercase">
        Sold
      </h2>
      <p class="text-2xl font-semibold text-gray-800">
        {{ props.stats.sold }}
      </p>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          class="bg-blue-500 h-2 rounded-full"
          :style="{ width: soldPercent + '%' }"
        />
      </div>
    </router-link>
    <div class="bg-white rounded-xl shadow-md p-4 text-center">
      <h2 class="text-sm text-gray-500 uppercase">
        Paid
      </h2>
      <p class="text-2xl font-semibold text-gray-800">
        {{ props.stats.sold_paid }}
      </p>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          class="bg-green-500 h-2 rounded-full"
          :style="{ width: paidPercent + '%' }"
        />
      </div>
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
      <div class="w-full bg-white/30 rounded-full h-2 mt-2">
        <div
          class="bg-white h-2 rounded-full"
          :style="{ width: revenuePercent + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Stats } from '../utils/stats';

const props = defineProps<{
  stats: Stats;
}>();

const showOutstanding = ref(false);
const toggleOutstanding = () => {
  showOutstanding.value = !showOutstanding.value;
};

const soldPercent = computed(() =>
  props.stats.items ? (props.stats.sold / props.stats.items) * 100 : 0
);

const paidPercent = computed(() =>
  props.stats.sold ? (props.stats.sold_paid / props.stats.sold) * 100 : 0
);

const revenuePercent = computed(() => {
  const total = props.stats.sold_paid_total + props.stats.sold_unpaid_total;
  return total ? (props.stats.sold_paid_total / total) * 100 : 0;
});
</script>

<style scoped>
/* Basic styling */
</style>
