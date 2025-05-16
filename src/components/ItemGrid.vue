<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <ItemCard 
      v-for="item in items" 
      :key="item.id" 
      :item="item"
      @update-status="updateStatus"
      @delete="deleteItem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ItemCard from './ItemCard.vue';
import { Item } from '../types/item';

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
    const updateStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
      emit('update-status', id, status);
    };
    
    const deleteItem = (id: string) => {
      emit('delete-item', id);
    };
    
    return {
      updateStatus,
      deleteItem
    };
  }
});
</script>