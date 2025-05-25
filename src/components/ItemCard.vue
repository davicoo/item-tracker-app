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
  <!-- Add this for debugging -->
  <div class="mt-4 p-4 bg-gray-100 rounded">
    <h3>Debug - Items data:</h3>
    <pre>{{ JSON.stringify(items, null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { IKContext, IKImage } from 'imagekitio-vue';
import type { PropType } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemCard',
  components: {
    IKContext,
    IKImage
  },
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  emits: ['update-status', 'delete-item'],
  setup(props, { emit }) {
    // ImageKit configuration
    const imageKitConfig = {
      publicKey: "private_qTO9s1aV6K2FSALd597boRa2RN0=",
      urlEndpoint: "https://ik.imagekit.io/mydwcapp",
      transformationPosition: "path"
    };

    const handleStatusChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit('update-status', props.item.id, target.value as "not_sold" | "sold" | "sold_paid");
    };
    
    const handleDelete = () => {
      emit('delete-item', props.item.id);
    };
    
    const statusLabel = computed(() => {
      const option = statusOptions.find(opt => opt.value === props.item.status);
      return option?.label || 'Unknown';
    });
    
    const statusColor = computed(() => {
      switch (props.item.status) {
        case 'not_sold':
          return 'bg-red-100 text-red-800';
        case 'sold':
          return 'bg-yellow-100 text-yellow-800';
        case 'sold_paid':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    });
    
    // IMPORTANT: Make sure imageKitConfig is returned!
    return {
      imageKitConfig,  // ← This line is crucial!
      statusOptions,
      handleStatusChange,
      handleDelete,
      statusLabel,
      statusColor
    };
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>