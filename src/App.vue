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
import { Item, mapRecordToItem, defaultItems } from './types/item';

// Items state
const items = ref<Item[]>([]);
const showForm = ref(false);
const isLoading = ref(true);
const serverError = ref('');

// Fetch items from Airtable
async function fetchItems() {
  isLoading.value = true;
  serverError.value = '';
  
  try {
    const response = await fetch('https://api.airtable.com/v0/appb4avbjcFIK4C6s/inventory', {
      headers: {
        'Authorization': 'Bearer patazXusPtFl038QV' // CORRECT CURRENT TOKEN
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      items.value = data.records.map(mapRecordToItem);
      console.log('Fetched items:', items.value);
    } else {
      const error = await response.json();
      serverError.value = `Error fetching items: ${error.error?.message || 'Unknown error'}`;
      // Fall back to default items if there's an error
      items.value = [...defaultItems];
    }
  } catch (err) {
    console.error('Error fetching items:', err);
    serverError.value = 'Network error fetching items';
    // Fall back to default items if there's an error
    items.value = [...defaultItems];
  } finally {
    isLoading.value = false;
  }
}

// Load items from server on mount
onMounted(() => {
  fetchItems();
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