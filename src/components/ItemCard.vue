<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden relative">
    <!-- Debug info to see what's happening -->
    <div v-if="!item.imageUrl" class="p-2 bg-red-100 text-xs">
      No image URL available: {{ JSON.stringify(item) }}
    </div>
    
    <!-- Image display with local fallback support -->
    <div class="h-48 overflow-hidden">
      <img 
        :src="imageToDisplay"
        :alt="item.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
    </div>
    
    <!-- Add a badge for fallback images -->
    <div v-if="imageError" class="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
      Image Error
    </div>
    
    <!-- Item details -->
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">{{ item.name }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ item.details }}</p>
      
      <!-- Status controls -->
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
      
      <!-- Status badge and delete button -->
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
import { ref, computed } from 'vue';
import type { Item } from '../types/item';
import { statusOptions, DEFAULT_FALLBACK_IMAGE } from '../types/item';

const props = defineProps<{
  item: Item;
}>();

// Add image error handling
const imageError = ref(false);

// Use the fallback image when needed
const imageToDisplay = computed(() => {
  if (!props.item.imageUrl || imageError.value) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  
  if (props.item.imageUrl.startsWith('local:')) {
    return props.item.imageUrl.substring(6);
  }
  
  return props.item.imageUrl;
});

const handleImageError = () => {
  console.log(`Image failed to load: ${props.item.imageUrl}`);
  imageError.value = true;
};

// FIX: Update the handleStatusChange function to properly emit both parameters
const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newStatus = target.value as "not_sold" | "sold" | "sold_paid";
  console.log(`Updating status for item ${props.item.id} to ${newStatus}`);
  emit('update-status', props.item.id, newStatus);
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