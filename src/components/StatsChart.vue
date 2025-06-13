<template>
  <div class="mb-6">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { Item } from '../types/item';
import { calculatePeriodStats, type PeriodStats } from '../utils/stats';

const props = defineProps<{ items: Item[] }>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function buildData(items: Item[]): number[] {
  const stats: PeriodStats = calculatePeriodStats(items);
  return [stats.last30Days, stats.last6Months, stats.lastYear];
}

function renderChart() {
  if (!canvas.value) return;
  const data = buildData(props.items);

  if (chart) {
    chart.data.datasets[0].data = data;
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
          data
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
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
