<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-card border border-[--ui-border-color] bg-[--ui-bg]/95 p-6 shadow-sm shadow-gray-950/10 backdrop-blur">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-caption">
        Inventory
      </p>
      <p class="mt-4 text-3xl font-semibold text-title">
        {{ props.stats.items }}
      </p>
      <p class="mt-2 text-sm text-caption">
        Active items in stock
      </p>
    </div>
    <button
      type="button"
      class="group rounded-card border border-[--ui-border-color] bg-[--ui-bg] p-6 text-left shadow-sm shadow-gray-950/10 transition hover:border-primary-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      @click="emit('show-sold-details')"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-caption">
        Sold
      </p>
      <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold text-title">
        {{ props.stats.sold }}
        <span class="text-sm font-medium text-caption">items</span>
      </p>
      <div class="mt-5 h-2 w-full rounded-full bg-primary-100">
        <div
          class="h-2 rounded-full bg-primary-500 transition-all duration-500"
          :style="{ width: soldPercent + '%' }"
        />
      </div>
      <p class="mt-2 text-xs text-caption">
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
    </button>
    <div class="rounded-card border border-[--ui-border-color] bg-[--ui-bg] p-6 shadow-sm shadow-gray-950/10">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-caption">
        Paid
      </p>
      <p class="mt-4 flex items-baseline gap-2 text-3xl font-semibold text-title">
        {{ props.stats.sold_paid }}
        <span class="text-sm font-medium text-caption">items</span>
      </p>
      <div class="mt-5 h-2 w-full rounded-full bg-success-100">
        <div
          class="h-2 rounded-full bg-success-500 transition-all duration-500"
          :style="{ width: paidPercent + '%' }"
        />
      </div>
      <p class="mt-2 text-xs text-caption">
        {{ paidPercentLabel }}% of sold items paid
      </p>
    </div>
    <button
      type="button"
      class="relative overflow-hidden rounded-card bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-500 p-6 text-left text-white shadow-lg shadow-primary-950/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      @click="toggleOutstanding"
    >
      <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.white/0.35),transparent_55%)] opacity-70" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
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
