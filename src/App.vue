<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">
      Item Tracker
    </h1>
    <StatsDisplay />
    
    <!-- Show server error if any -->
    <div
      v-if="serverError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ serverError }}
    </div>
    
    <ItemForm
      v-if="showForm && !editingItem"
      @item-added="handleItemAdded"
      @cancel="showForm = false"
    />

    <EditItemForm
      v-if="editingItem"
      :item="editingItem"
      @item-updated="handleItemUpdated"
      @cancel="editingItem = null"
    />
    
    <div
      v-if="!showForm"
      class="mb-6"
    >
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
        @click="showForm = true"
      >
        Add New Item
      </button>
    </div>
    
    <div
      v-if="isLoading"
      class="text-center py-8"
    >
      Loading items...
    </div>
    
    <ItemGrid
      v-else
      :items="items"
      @update-status="updateItemStatus"
      @delete-item="deleteItem"
      @edit-item="startEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ItemForm from './components/ItemForm.vue';
import EditItemForm from './components/EditItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import StatsDisplay from './components/StatsDisplay.vue';
import type { Item } from './types/item';
import { mapRecordToItem, defaultItems } from './types/item';
import { supabase } from './supabaseClient';
import { calculateStats, saveStats } from './utils/stats';

// Items state
const items = ref<Item[]>([]);
const showForm = ref(false);
const isLoading = ref(true);
const serverError = ref('');
const editingItem = ref<Item | null>(null);



// Fetch items from supabase

async function fetchItems() {
  isLoading.value = true;
  serverError.value = '';

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;
    items.value = data.map(mapRecordToItem); // adjust mapRecordToItem if needed
    const stats = calculateStats(items.value);
    await saveStats(stats);
  } catch (err: any) {
    console.error('Error fetching items:', err);
    serverError.value = 'Error fetching items';
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

      const stats = calculateStats(items.value);
      await saveStats(stats);

    } catch (error) {
      console.error('Error saving to server:', error);
      serverError.value = 'Failed to save items to server. Saving locally as fallback.';
      
      // Fallback to localStorage if server save fails
      try {
        localStorage.setItem('itemTrackerItems', JSON.stringify(items.value));
        console.log('Items saved to localStorage as fallback');
        const stats = calculateStats(items.value);
        await saveStats(stats);
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

// Start editing an item
const startEdit = (item: Item) => {
  editingItem.value = item;
  showForm.value = false;
};

// Handle updated item from edit form
const handleItemUpdated = (updated: Item) => {
  const index = items.value.findIndex(i => i.id === updated.id);
  if (index !== -1) {
    const updatedItems = [...items.value];
    updatedItems[index] = updated;
    items.value = updatedItems;
  }
  editingItem.value = null;
};

// Handle updating an item's status
const updateItemStatus = async (
  id: string,
  status: "not_sold" | "sold" | "sold_paid"
) => {
  console.log("Updating item status:", id, status);

  try {
    const { data, error } = await supabase
      .from("items")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const itemIndex = items.value.findIndex(item => item.id === id);
    if (itemIndex !== -1 && data) {
      const updatedItems = [...items.value];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status: data.status,
      };
      items.value = updatedItems;
    }
  } catch (err: any) {
    console.error(err);
    alert("❌ Error updating status: " + err.message);
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