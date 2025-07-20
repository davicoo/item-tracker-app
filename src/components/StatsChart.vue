<template>
  <div class="chart-container relative z-50 bg-white p-6 rounded-xl shadow-xl max-w-2xl mx-auto mt-10 overflow-y-auto max-h-[90vh]">
    <button
      class="absolute top-0 right-0 m-2 text-gray-500"
      aria-label="Close"
      @click="emit('close')"
    >
      &times;
    </button>
    <div class="flex justify-end mb-2 space-x-2">
      <button
        class="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 active:scale-95"
        @click="prevSlide"
      >
        Prev
      </button>
      <button
        class="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 active:scale-95"
        @click="nextSlide"
      >
        Next
      </button>
    </div>
    <canvas
      ref="canvas"
      class="w-full h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import type { Item } from '../types/item';
import {
  calculatePeriodStats,
  calculatePeriodTotals,
  calculateMonthlyRevenue,
  calculateStatusDistribution,
  type PeriodStats,
  type PeriodTotals,
  type MonthlyRevenue,
  type StatusDistribution
} from '../utils/stats';

const props = defineProps<{ items: Item[] }>();
const emit = defineEmits<{ close: [] }>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;
const slide = ref(0);
const totalSlides = 3;

function nextSlide() {
  slide.value = (slide.value + 1) % totalSlides;
}
function prevSlide() {
  slide.value = (slide.value - 1 + totalSlides) % totalSlides;
}

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

function buildSlideConfig(items: Item[]): ChartConfiguration {
  if (slide.value === 0) {
    const data = buildData(items);
    return {
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
        },
        plugins: {
          zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
        }
      }
    } as ChartConfiguration;
  } else if (slide.value === 1) {
    const revenue: MonthlyRevenue = calculateMonthlyRevenue(items);
    return {
      type: 'line',
      data: {
        labels: revenue.labels,
        datasets: [
          {
            label: 'Monthly Revenue',
            backgroundColor: 'rgba(52, 211, 153, 0.5)',
            borderColor: '#34d399',
            fill: true,
            data: revenue.totals
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
        }
      }
    } as ChartConfiguration;
  }

  const dist: StatusDistribution = calculateStatusDistribution(items);
  return {
    type: 'pie',
    data: {
      labels: dist.labels,
      datasets: [
        {
          label: 'Status',
          backgroundColor: ['#60a5fa', '#fbbf24', '#34d399'],
          data: dist.counts
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  } as ChartConfiguration;
}

function renderChart() {
  if (!canvas.value) return;
  const config = buildSlideConfig(props.items);

  if (chart) {
    chart.destroy();
  } else {
    Chart.register(...registerables, zoomPlugin);
  }
  chart = new Chart(canvas.value, config);
}

onMounted(() => {
  renderChart();
});

watch(
  [() => props.items, slide],
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-height: 300px;
  max-height: 90vh;
}
</style>
