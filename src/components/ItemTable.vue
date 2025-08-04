<template>
  <div
    v-if="items.length === 0"
    class="text-center text-gray-500 py-8"
  >
    No items added yet. Click "Add New Item" to get started.
  </div>
  <div
    v-else
    class="overflow-x-auto w-full"
  >
    <table class="min-w-full table-auto text-sm text-left divide-y divide-gray-200">
      <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
        <tr>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Image
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Details
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Qty
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            SKU
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <ItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          @update-status="(id, s) => $emit('update-status', id, s)"
          @delete-item="id => $emit('delete-item', id)"
          @edit-item="item => $emit('edit-item', item)"
          @view-image="src => $emit('view-image', src)"
          @duplicate-item="item => $emit('duplicate-item', item)"
          @reset-item="id => $emit('reset-item', id)"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ItemRow from './ItemRow.vue'
import type { Item } from '../types/item'

const { items } = defineProps<{ items: Item[] }>()

defineEmits<{
  'update-status': [string, 'not_sold' | 'sold' | 'sold_paid']
  'delete-item': [string]
  'edit-item': [Item]
  'view-image': [string]
  'duplicate-item': [Item]
  'reset-item': [string]
}>()
</script>

<style scoped>
/* optional styles */
</style>
