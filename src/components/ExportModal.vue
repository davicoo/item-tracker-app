<template>
  <div

    class="fixed inset-0 z-[420] overflow-y-auto bg-[--overlay-bg] px-4 py-8 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-white/98 via-primary-50/85 to-white/98 px-6 py-6 shadow-2xl shadow-primary-900/20 backdrop-blur-xl sm:px-8">
      <span class="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-primary-200/30 blur-3xl" />
      <button
        class="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-primary-600 shadow-sm shadow-primary-900/10 backdrop-blur transition hover:bg-primary-50/80 hover:text-primary-700"

        @click="emit('close')"
      >
        <span class="sr-only">Close</span>
        &times;
      </button>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Data Tools
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-title text-primary-900">
          Export Inventory
        </h2>
        <p class="mt-2 text-sm text-primary-600">
          Choose a format to download your items for reporting or backups.
        </p>
      </div>
      <label
        for="format"
        class="mt-6 block text-sm font-medium text-primary-700"
      >Format</label>
      <select
        id="format"
        v-model="format"

        class="mt-2 w-full rounded-btn border border-primary-100 bg-white/90 px-3 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"

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

        class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-indigo-500 to-secondary-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-950/30 drop-shadow-[0_12px_32px_rgba(76,81,255,0.45)] transition hover:translate-y-0.5 hover:shadow-2xl disabled:opacity-60"

        :disabled="exporting"
        @click="handleExport"
      >
        <svg
          v-if="exporting"
          class="size-4 animate-spin text-white"
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
        <span>{{ exporting ? 'Exporting…' : `Export ${format.toUpperCase()}` }}</span>
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
