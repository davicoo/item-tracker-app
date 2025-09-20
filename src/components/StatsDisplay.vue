<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="relative overflow-hidden rounded-card border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-6 shadow-lg shadow-primary-500/15">
      <span class="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary-200/60 blur-3xl" />
      <span class="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-secondary-200/40 blur-3xl" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Inventory
        </p>
        <p class="mt-4 text-3xl font-semibold text-primary-900">
          {{ props.stats.items }}
        </p>
        <p class="mt-2 text-sm text-primary-600">
          Active items in stock
        </p>
      </div>
    </div>
    <button
      type="button"
      class="group relative overflow-hidden rounded-card border border-primary-100 bg-gradient-to-br from-white via-primary-50/40 to-white p-6 text-left shadow-lg shadow-primary-500/15 transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      @click="emit('show-sold-details')"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.primary.200/0.35),transparent_60%)] opacity-80" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Sold
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold text-primary-900">
          {{ props.stats.sold }}
          <span class="text-sm font-medium text-primary-600">items</span>
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-primary-100">
          <div
            class="h-2 rounded-full bg-primary-500 transition-all duration-500"
            :style="{ width: soldPercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-primary-600">
          {{ soldPercentLabel }}% of inventory sold
        </p>
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600">
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
    <div class="relative overflow-hidden rounded-card border border-success-200/70 bg-gradient-to-br from-success-50 via-white to-white p-6 shadow-lg shadow-success-500/10">
      <span class="pointer-events-none absolute -right-16 top-10 h-28 w-28 rounded-full bg-success-200/50 blur-3xl" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-success-600">
          Paid
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold text-success-700">
          {{ props.stats.sold_paid }}
          <span class="text-sm font-medium text-success-600">items</span>
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-success-100">
          <div
            class="h-2 rounded-full bg-success-500 transition-all duration-500"
            :style="{ width: paidPercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-success-600">
          {{ paidPercentLabel }}% of sold items paid
        </p>
      </div>
    </div>
    <button
      type="button"
      class="relative overflow-hidden rounded-card border border-transparent bg-gradient-to-br from-indigo-600 via-primary-600 to-secondary-500 p-6 text-left text-white shadow-xl shadow-primary-900/30 transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      :aria-pressed="showOutstanding"
      @click="toggleOutstanding"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.white/0.4),transparent_55%)] opacity-80" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          {{ displayTitle }}
        </p>
        <p class="mt-4 text-3xl font-semibold drop-shadow-sm">
          ${{ displayValue.toFixed(2) }}
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-white/30">
          <div
            class="h-2 rounded-full bg-white/90 transition-all duration-500"
            :style="{ width: revenuePercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs text-white/85">
          {{ revenuePercentLabel }}% collected
        </p>
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium">
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
