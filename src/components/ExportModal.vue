<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-lg p-4 w-80 shadow">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold">
          Export Data
        </h2>
        <button
          class="text-gray-500"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>
      <label
        for="format"
        class="block text-sm mb-1"
      >Format</label>
      <select
        id="format"
        v-model="format"
        class="w-full mb-4 px-3 py-2 border rounded"
      >
        <option value="pdf">
          PDF
        </option>
        <option value="xlsx">
          Excel
        </option>
        <option value="csv">
          CSV
        </option>
        <option value="json">
          JSON
        </option>
      </select>
      <button
        class="flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition w-full disabled:opacity-50"
        :disabled="exporting"
        @click="handleExport"
      >
        <svg
          v-if="exporting"
          class="animate-spin h-4 w-4 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>{{ exporting ? 'Exporting...' : `Export ${format.toUpperCase()}` }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Item } from '../types/item'
import { exportDataAs } from '../utils/export'

const props = defineProps<{ items: Item[] }>()
const emit = defineEmits<{ close: [] }>()

const format = ref<'pdf' | 'xlsx' | 'csv' | 'json'>('pdf')
const exporting = ref(false)

async function handleExport() {
  exporting.value = true
  try {
    await exportDataAs(props.items, format.value)
  } finally {
    exporting.value = false
    emit('close')
  }
}
</script>

<style scoped>
</style>
