<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Debug info to see what's happening -->
    <div
      v-if="!item.imageUrl"
      class="p-2 bg-red-100 text-xs"
    >
      No image URL available: {{ JSON.stringify(item) }}
    </div>
    
    <!-- Image display with local fallback support -->
    <div
      v-if="item.imageUrl"
      class="h-48 overflow-hidden"
    >
      <img 
        :src="imageToDisplay"
        :alt="item.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      >
    </div>
    <div
      v-else
      class="w-full h-48 bg-gray-200 flex items-center justify-center"
    >
      <div class="text-center p-4">
        <span class="text-gray-500 block">{{ item.name }}</span>
        <span class="text-gray-400 text-sm">No image available</span>
      </div>
    </div>
    
    <!-- Add a badge for local images -->
    <div
      v-if="isLocalImage"
      class="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
    >
      Local Only
    </div>
    
    <!-- Item details -->
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">
        {{ item.name }}
      </h3>
      <p class="text-gray-600 text-sm mb-3">
        {{ item.details }}
      </p>
      
      <!-- Status controls -->
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status:</label>
        <select
          :value="item.status"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          @change="handleStatusChange"
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
      
      <!-- Status badge and actions -->
      <div class="flex justify-between items-center">
        <span
          class="px-2 py-1 rounded text-xs font-medium"
          :class="statusColor"
        >
          {{ statusLabel }}
        </span>
        <div class="space-x-2">
          <button
            class="text-blue-500 hover:text-blue-700 text-sm font-medium"
            @click="handleEdit"
          >
            Edit
          </button>
          <button
            class="text-red-500 hover:text-red-700 text-sm font-medium"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, computed, defineProps, defineEmits } from 'vue';
import type { Item } from '../types/item';
import { statusOptions, DEFAULT_FALLBACK_IMAGE } from '../types/item';

const props = defineProps<{
  item: Item;
}>();

const emit = defineEmits<{
  'update-status': [string, 'not_sold' | 'sold' | 'sold_paid']
  'delete-item': [string]
  'edit-item': [Item]
}>()

// Add image error handling
const imageError = ref(false);

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

const handleEdit = () => {
  emit('edit-item', props.item);
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

// Add computed properties for local image handling
const isLocalImage = computed(() => {
  return props.item.imageUrl?.startsWith('local:');
});


// Use the fallback image when needed
const imageToDisplay = computed(() => {
  if (!props.item.imageUrl || imageError.value) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  
  return props.item.imageUrl;
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>