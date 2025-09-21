<template>
  <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
    <div class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#eef2ff] via-white/95 to-[#e0f2fe] p-6 shadow-[0_32px_90px_-60px_rgba(86,97,255,0.55)] ring-1 ring-white/70 backdrop-blur">
      <span class="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-primary-200/50 blur-3xl" />
      <span class="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-secondary-200/50 blur-3xl" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Inventory
        </p>
        <p class="mt-5 text-4xl font-semibold text-primary-900">
          {{ props.stats.items }}
        </p>
        <p class="mt-2 text-sm text-primary-600">
          Active items in stock
        </p>
      </div>
    </div>
    <button
      type="button"
      class="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#e0f2fe] via-[#eef2ff] to-white/95 p-6 text-left shadow-[0_32px_90px_-60px_rgba(86,97,255,0.55)] ring-1 ring-white/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_42px_110px_-60px_rgba(86,97,255,0.72)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      @click="emit('show-sold-details')"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.primary.200/0.35),transparent_60%)] opacity-80" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Sold
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-4xl font-semibold text-primary-900">

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
    <div class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#dcfce7] via-white/95 to-[#bbf7d0] p-6 shadow-[0_32px_90px_-60px_rgba(34,197,94,0.4)] ring-1 ring-white/70 backdrop-blur">
      <span class="pointer-events-none absolute -right-16 top-10 h-32 w-32 rounded-full bg-success-200/50 blur-3xl" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-success-600">
          Paid
        </p>
        <p class="mt-4 flex items-baseline gap-2 text-4xl font-semibold text-success-700">
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
      class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#312e81] via-[#4f46e5] to-[#ec4899] p-6 text-left text-white shadow-[0_44px_130px_-60px_rgba(76,81,255,0.8)] drop-shadow-[0_20px_44px_rgba(76,81,255,0.4)] transition hover:-translate-y-1 hover:shadow-[0_52px_150px_-60px_rgba(76,81,255,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
      :aria-pressed="showOutstanding"
      @click="toggleOutstanding"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.white/0.45),transparent_55%)] opacity-80" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">
          {{ displayTitle }}
        </p>
        <p class="mt-4 text-4xl font-semibold drop-shadow-[0_6px_18px_rgba(35,30,75,0.55)]">
          ${{ displayValue.toFixed(2) }}
        </p>
        <div class="mt-5 h-2 w-full rounded-full bg-white/40">
          <div
            class="h-2 rounded-full bg-white transition-all duration-500"
            :style="{ width: revenuePercent + '%' }"
          />
        </div>
        <p class="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/90">
          {{ revenuePercentLabel }}% collected
        </p>
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
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
