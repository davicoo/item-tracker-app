<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">Item Tracker</h1>
    
    <ItemForm 
      v-if="showForm" 
      @item-added="handleItemAdded" 
      @cancel="showForm = false" 
    />
    
    <div v-if="!showForm" class="mb-6">
      <button
        @click="showForm = true"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
      >
        Add New Item
      </button>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      Loading items...
    </div>
    
    <ItemGrid 
      v-else
      :items="items" 
      @update-status="updateItemStatus" 
      @delete-item="deleteItem" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ItemForm from './components/ItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import type { Item } from './types/item';
import { defaultItems } from './types/item';

// Items state
const items = ref<Item[]>([]);
const showForm = ref(false);
const isLoading = ref(true);

// Load items from localStorage on mount
onMounted(() => {
  try {
    const savedItems = localStorage.getItem('itemTrackerItems');
    if (savedItems) {
      items.value = JSON.parse(savedItems);
    } else {
      items.value = defaultItems;
      localStorage.setItem('itemTrackerItems', JSON.stringify(defaultItems));
    }
  } catch (error) {
    console.error('Error loading items from localStorage:', error);
    items.value = defaultItems;
  } finally {
    isLoading.value = false;
  }
});

// Save items to localStorage when they change
watch(items, (newItems) => {
  console.log('Saving items to localStorage:', newItems);
  localStorage.setItem('itemTrackerItems', JSON.stringify(newItems));
}, { deep: true });

// Handle adding a new item
const handleItemAdded = (newItem: Item) => {
  console.log('Adding new item:', newItem);
  items.value = [...items.value, newItem]; // Create a new array to ensure reactivity
  showForm.value = false;
};

// Handle updating an item's status - make sure both parameters are used
const updateItemStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
  console.log('Updating item status:', id, status);
  
  // Find the item and update its status
  const itemIndex = items.value.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    // Create a new array to ensure reactivity
    const updatedItems = [...items.value];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      status: status
    };
    items.value = updatedItems;
  }
};

// Handle deleting an item
const deleteItem = (id: string) => {
  console.log('Deleting item:', id);
  items.value = items.value.filter(item => item.id !== id);
};
</script>

<style>
/* Add any global styles here */
</style>