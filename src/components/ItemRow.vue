<template>
  <tr>
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="relative w-12 h-12">
        <img
          v-if="item.imageUrl"
          :src="imageToDisplay"
          :alt="item.name"
          class="w-12 h-12 object-cover cursor-pointer"
          @error="handleImageError"
          @click="handleViewImage"
        >
        <div
          v-else
          class="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs text-gray-500"
        >
          No image
        </div>
        <span
          v-if="isLocalImage"
          class="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded"
        >Local</span>
      </div>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="font-semibold">
        {{ item.name }}
      </div>
      <div class="text-xs text-gray-500">
        {{ formattedDate }}
      </div>
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      {{ item.details }}
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      ${{ item.price }}
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      {{ item.quantity }}
      <span

        v-if="availableQuantity(item) < item.minQuantity"

        class="text-red-600 ml-1"
        title="Needs restock"
      >⚠️</span>
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      {{ item.pastSales }}
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      <div v-if="item.skuCodes && item.skuCodes.length">
        <div>{{ item.skuCodes.join(', ') }}</div>
        <div
          v-if="soldEntries.length"
          class="text-xs text-gray-500"
        >
          Sold:
          <span
            v-for="([sku, count], idx) in soldEntries"
            :key="sku"
          >
            {{ sku }}: {{ count }}<span v-if="idx < soldEntries.length - 1">, </span>
          </span>
        </div>
      </div>
    </td>
    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      {{ item.location }}
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <select
        :value="item.status"
        class="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        @change="handleStatusChange"
      >
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="flex space-x-2">
        <button
          class="text-blue-500 hover:text-blue-700 text-sm font-medium"
          @click="handleEdit"
        >
          Edit
        </button>
        <button
          class="text-green-500 hover:text-green-700 text-sm font-medium"
          @click="handleDuplicate"
        >
          Duplicate
        </button>
        <button
          class="text-purple-500 hover:text-purple-700 text-sm font-medium"
          @click="handleReset"
        >
          Restock
        </button>
        <button
          class="text-red-500 hover:text-red-700 text-sm font-medium"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import type { Item } from '../types/item'
import {
  statusOptions,
  DEFAULT_FALLBACK_IMAGE,
  availableQuantity,
  NO_SKU_KEY
} from '../types/item'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  'update-status': [string, 'not_sold' | 'sold' | 'sold_paid']
  'delete-item': [string]
  'edit-item': [Item]
  'view-image': [string]
  'duplicate-item': [Item]
  'reset-item': [string]
}>()

const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}

function handleStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as 'not_sold' | 'sold' | 'sold_paid'
  emit('update-status', props.item.id, newStatus)
}

function handleDelete() {
  emit('delete-item', props.item.id)
}

function handleEdit() {
  emit('edit-item', props.item)
}

function handleDuplicate() {
  emit('duplicate-item', props.item)
}

function handleReset() {
  emit('reset-item', props.item.id)
}

function handleViewImage() {
  emit('view-image', imageToDisplay.value)
}

const formattedDate = computed(() => {
  try {
    const d = new Date(props.item.dateAdded)
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }
  } catch {
    // ignore
  }
  return props.item.dateAdded
})

const isLocalImage = computed(() => props.item.imageUrl?.startsWith('local:'))

const imageToDisplay = computed(() => {
  if (!props.item.imageUrl || imageError.value) {
    return DEFAULT_FALLBACK_IMAGE
  }
  return props.item.imageUrl
})

const soldEntries = computed(() =>
  Object.entries(props.item.soldCounts || {}).filter(([sku]) => sku !== NO_SKU_KEY)
)
</script>

<style scoped>
/* scoped styles if needed */
</style>
