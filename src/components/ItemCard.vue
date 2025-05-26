<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Image display -->
    <Image 
      v-if="item.imageUrl"
      url-endpoint="https://ik.imagekit.io/mydwcapp"
      :src="item.imageUrl"
      width="400"
      height="192"
      :transformation="[{ crop: 'maintain_ratio' }]"
      :alt="item.name || 'Item image'"
      class="w-full h-48 object-cover"
    />
    <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
      <span class="text-gray-500">No image</span>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">{{ item.name }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ item.details }}</p>
      
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status:</label>
        <select
          :value="item.status"
          @change="handleStatusChange"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option 
            v-for="option in statusOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="flex justify-between items-center">
        <span 
          class="px-2 py-1 rounded text-xs font-medium"
          :class="statusColor"
        >
          {{ statusLabel }}
        </span>
        
        <button
          @click="handleDelete"
          class="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Image } from '@imagekit/vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  item: Item;
}>();

const emit = defineEmits<{
  (e: 'update-status', id: string, status: "not_sold" | "sold" | "sold_paid"): void;
  (e: 'delete-item', id: string): void;
}>();

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
    case 'not_sold': return 'bg-red-100 text-red-800';
    case 'sold': return 'bg-yellow-100 text-yellow-800';
    case 'sold_paid': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>