<template>
  <div class="mb-6">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { Item } from '../types/item';
import {
  calculatePeriodStats,
  calculatePeriodTotals,
  type PeriodStats,
  type PeriodTotals
} from '../utils/stats';

const props = defineProps<{ items: Item[] }>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

interface ChartData {
  counts: number[];
  totals: number[];
}

function buildData(items: Item[]): ChartData {
  const countStats: PeriodStats = calculatePeriodStats(items);
  const totalStats: PeriodTotals = calculatePeriodTotals(items);

  const counts = [
    countStats.last30Days,
    countStats.last6Months,
    countStats.lastYear
  ];

  const totals = [
    totalStats.last30Days,
    totalStats.last6Months,
    totalStats.lastYear
  ];

  return { counts, totals };
}

function renderChart() {
  if (!canvas.value) return;
  const data = buildData(props.items);

  if (chart) {
    chart.data.datasets[0].data = data.counts;
    chart.data.datasets[1].data = data.totals;
    chart.update();
    return;
  }

  Chart.register(...registerables);
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: ['30 days', '6 months', '1 year'],
      datasets: [
        {
          label: 'Items Sold',
          backgroundColor: '#60a5fa',
          yAxisID: 'yCounts',
          data: data.counts
        },
        {
          label: 'Paid Total ($)',
          backgroundColor: '#34d399',
          yAxisID: 'yTotals',
          data: data.totals
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yCounts: {
          beginAtZero: true,
          position: 'left',
          ticks: { precision: 0 }
        },
        yTotals: {
          beginAtZero: true,
          position: 'right'
        }
      }
    }
  });
}

onMounted(() => {
  renderChart();
});

watch(
  () => props.items,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<style scoped>
div {
  height: 300px;
}
</style>
