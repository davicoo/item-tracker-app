<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <img 
      :src="item.imageUrl || '/placeholder.jpg'" 
      :alt="item.name"
      class="w-full h-48 object-cover rounded mb-3"
    />
    <h3 class="text-lg font-semibold mb-1">{{ item.name }}</h3>
    <p class="text-gray-700 text-sm mb-3">{{ item.details }}</p>
    
    <div class="flex items-center justify-between">
      <span :class="[statusColor, 'text-white text-xs px-2 py-1 rounded-full']">
        {{ statusText }}
      </span>
      
      <div class="flex space-x-2">
        <select
          :value="item.status"
          @change="updateStatus($event)"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option 
            v-for="option in statusOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <button
          @click="$emit('delete', item.id)"
          class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemCard',
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  emits: ['update-status', 'delete'],
  setup(props, { emit }) {
    // Get status badge color
    const statusColor = computed(() => {
      switch(props.item.status) {
        case 'not_sold': return 'bg-blue-500';
        case 'sold': return 'bg-yellow-500';
        case 'sold_paid': return 'bg-green-500';
        default: return 'bg-gray-500';
      }
    });
    
    // Get status display text
    const statusText = computed(() => {
      switch(props.item.status) {
        case 'not_sold': return 'Not Sold';
        case 'sold': return 'Sold';
        case 'sold_paid': return 'Sold & Paid';
        default: return 'Unknown';
      }
    });
    
    // Update status handler
    const updateStatus = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit('update-status', props.item.id, target.value as "not_sold" | "sold" | "sold_paid");
    };
    
    return {
      statusOptions,
      statusColor,
      statusText,
      updateStatus
    };
  }
});
</script>