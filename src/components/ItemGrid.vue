<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <ItemCard
      v-for="item in items"
      :key="item?.id || Math.random()"
      :item="item"
      @update-status="$emit('update-status', $event)"
      @delete-item="$emit('delete-item', $event)"
      v-if="item && item.id"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ItemCard from './ItemCard.vue';
import type { Item } from '../types/item';

export default defineComponent({
  name: 'ItemList',
  components: {
    ItemCard
  },
  props: {
    items: {
      type: Array as () => Item[],
      required: true
    }
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>