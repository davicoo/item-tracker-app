<template>
  <div v-if="items.length === 0" class="text-center text-gray-500 py-8">
    No items added yet. Click "Add New Item" to get started.
  </div>
  
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ItemCard 
      v-for="item in items" 
      :key="item.id" 
      :item="item"
      @update-status="(id, status) => $emit('update-status', id, status)" 
      @delete-item="(id) => $emit('delete-item', id)"
    />
  </div>
</template>

<script setup lang="ts">
import ItemCard from './ItemCard.vue';
import type { Item } from '../types/item';

defineProps<{
  items: Item[];
}>();

defineEmits<{
  (e: 'update-status', id: string, status: "not_sold" | "sold" | "sold_paid"): void;
  (e: 'delete-item', id: string): void;
}>();
</script>

<style scoped>
/* Add any component-specific styles here */
</style>