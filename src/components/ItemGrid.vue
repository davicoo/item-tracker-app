<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      @update-status="updateItemStatus"
      @delete="deleteItem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Item } from '../types/item';
import ItemCard from './ItemCard.vue';

export default defineComponent({
  name: 'ItemGrid',
  components: {
    ItemCard
  },
  props: {
    items: {
      type: Array as PropType<Item[]>,
      required: true
    }
  },
  emits: ['update-status', 'delete-item'],
  setup(props, { emit }) {
    // Update item status
    const updateItemStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
      emit('update-status', id, status);
    };
    
    // Delete item
    const deleteItem = (id: string) => {
      emit('delete-item', id);
    };
    
    return {
      updateItemStatus,
      deleteItem
    };
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>