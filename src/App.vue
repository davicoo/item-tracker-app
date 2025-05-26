<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">Item Tracker</h1>
    
    <!-- Show server error if any -->
    <div v-if="serverError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ serverError }}
    </div>
    
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
const serverError = ref('');

// Load items from server on mount
onMounted(async () => {
  try {
    isLoading.value = true;
    serverError.value = '';
    
    // Fetch items from Netlify function
    const response = await fetch('/.netlify/functions/getItems');
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Use items from server
    items.value = data;
    console.log('Loaded items from server:', items.value);
    
  } catch (error) {
    console.error('Error loading items from server:', error);
    serverError.value = 'Failed to load items from server. Using default items.';
    
    // Try to load from localStorage as fallback
    try {
      const savedItems = localStorage.getItem('itemTrackerItems');
      if (savedItems) {
        items.value = JSON.parse(savedItems);
        console.log('Loaded items from localStorage fallback');
      } else {
        items.value = defaultItems;
        console.log('Using default items');
      }
    } catch (localError) {
      console.error('Error with localStorage fallback:', localError);
      items.value = defaultItems;
    }
  } finally {
    isLoading.value = false;
  }
});

// Save items to server with debouncing
let saveTimeout: number | undefined;
watch(items, () => {
  // Clear previous timeout
  if (saveTimeout) clearTimeout(saveTimeout);
  
  // Set a timeout to avoid too many saves
  saveTimeout = setTimeout(async () => {
    try {
      serverError.value = '';
      console.log('Saving items to server...');
      
      // Send items to server
      const response = await fetch('/.netlify/functions/saveItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items.value)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      console.log('Items saved to server successfully');
      
    } catch (error) {
      console.error('Error saving to server:', error);
      serverError.value = 'Failed to save items to server. Saving locally as fallback.';
      
      // Fallback to localStorage if server save fails
      try {
        localStorage.setItem('itemTrackerItems', JSON.stringify(items.value));
        console.log('Items saved to localStorage as fallback');
      } catch (localError) {
        console.error('Error with localStorage fallback:', localError);
      }
    }
  }, 1000) as unknown as number;
}, { deep: true });

// Handle adding a new item
const handleItemAdded = (newItem: Item) => {
  console.log('Adding new item:', newItem);
  items.value = [...items.value, newItem]; // Create a new array to ensure reactivity
  showForm.value = false;
};

// Handle updating an item's status
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