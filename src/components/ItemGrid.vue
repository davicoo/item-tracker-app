<template>
  <div
    v-if="items.length === 0"
    class="text-center text-gray-500 py-8"
  >
    No items added yet. Click "Add New Item" to get started.
  </div>
  
  <div
    v-else
    class="grid gap-6"
    :class="columnsClass"
    :style="gridStyle"
  >
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      @update-status="(id, status) => $emit('update-status', id, status)"
      @delete-item="(id) => $emit('delete-item', id)"
      @edit-item="(item) => $emit('edit-item', item)"
      @view-image="(src) => $emit('view-image', src)"
      @duplicate-item="(item) => $emit('duplicate-item', item)"
      @reset-item="(id) => $emit('reset-item', id)"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed } from 'vue';
import ItemCard from './ItemCard.vue';
import type { Item } from '../types/item';

const props = defineProps<{
  items: Item[];
  columns: number;
}>();

const columnsClass = computed(() => {
  switch (props.columns) {
    case 1:
      return 'grid-cols-1';
    case 3:
      return 'grid-cols-3';
    case 2:
    default:
      return 'grid-cols-2';
  }
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.columns)}, minmax(0, 1fr))`,
}));

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
/* Add any component-specific styles here */
</style>