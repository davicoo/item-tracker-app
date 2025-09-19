<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 p-6 text-white shadow-xl shadow-sky-900/30">
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,theme(colors.white/0.3),transparent_55%)]" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Inventory
        </p>
        <p class="mt-4 text-3xl font-semibold">
          {{ props.stats.items }}
        </p>
        <p class="mt-2 text-sm text-white/80">
          Active items in stock
        </p>
      </div>
    </div>
    <button
      type="button"
      class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-6 text-left text-white shadow-xl shadow-fuchsia-900/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
      @click="emit('show-sold-details')"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.white/0.25),transparent_55%)]" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Sold
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold">
          {{ props.stats.sold }}
          <span class="text-sm font-medium text-white/70">items</span>
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-white/30">
          <div
            class="h-2 rounded-full bg-white transition-all duration-500"
            :style="{ width: soldPercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-white/80">
          {{ soldPercentLabel }}% of inventory sold
        </p>
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
          View sold insights
          <svg
            class="size-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-900/30">
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.white/0.25),transparent_55%)]" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Paid
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold">
          {{ props.stats.sold_paid }}
          <span class="text-sm font-medium text-white/70">items</span>
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-white/30">
          <div
            class="h-2 rounded-full bg-white transition-all duration-500"
            :style="{ width: paidPercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-white/80">
          {{ paidPercentLabel }}% of sold items paid
        </p>
      </div>
    </div>
    <button
      type="button"
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-left text-white shadow-xl shadow-amber-900/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      @click="toggleOutstanding"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.white/0.35),transparent_55%)] opacity-80" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          {{ displayTitle }}
        </p>
        <p class="mt-4 text-3xl font-semibold">
          ${{ displayValue.toFixed(2) }}
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-white/30">
          <div
            class="h-2 rounded-full bg-white/90 transition-all duration-500"
            :style="{ width: revenuePercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-white/80">
          {{ revenuePercentLabel }}% collected
        </p>
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
          {{ toggleHint }}
          <svg
            class="size-4 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Stats } from '../utils/stats';

const props = defineProps<{
  stats: Stats;
}>();
const emit = defineEmits(['show-sold-details']);

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const showOutstanding = ref(false);
const toggleOutstanding = () => {
  showOutstanding.value = !showOutstanding.value;
};

const soldPercent = computed(() =>
  clampPercent(props.stats.items ? (props.stats.sold / props.stats.items) * 100 : 0)
);

const paidPercent = computed(() =>
  clampPercent(props.stats.sold ? (props.stats.sold_paid / props.stats.sold) * 100 : 0)
);

const revenuePercent = computed(() => {
  const total = props.stats.sold_paid_total + props.stats.sold_unpaid_total;
  return clampPercent(total ? (props.stats.sold_paid_total / total) * 100 : 0);
});

const soldPercentLabel = computed(() => Math.round(soldPercent.value));
const paidPercentLabel = computed(() => Math.round(paidPercent.value));
const revenuePercentLabel = computed(() => Math.round(revenuePercent.value));

const displayValue = computed(() =>
  showOutstanding.value ? props.stats.sold_unpaid_total : props.stats.sold_paid_total
);
const displayTitle = computed(() =>
  showOutstanding.value ? 'Outstanding Balance' : 'Paid Total'
);
const toggleHint = computed(() =>
  showOutstanding.value ? 'View paid totals' : 'View outstanding balance'
);
</script>
