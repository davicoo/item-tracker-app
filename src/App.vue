<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-center flex-1">
        Artwork Tracker
      </h1>
      <button
        class="text-sm text-blue-500 hover:underline"
        @click="signOut"
      >
        Sign Out
      </button>
    </div>

    <StatsDisplay :stats="currentStats" />

    <div class="flex justify-end mb-2">
      <button
        class="text-sm text-blue-500 hover:underline"
        @click="showChart = !showChart"
      >
        {{ showChart ? 'Hide Chart' : 'Show Chart' }}
      </button>
    </div>

    <StatsChart
      v-if="showChart"
      :items="items"
    />

    <PrelineDatepicker />

    
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
    
    <div class="mb-4 flex items-center justify-between">
      <label
        for="layout"
        class="mr-2 text-sm text-gray-700"
      >Layout:</label>
      <select
        id="layout"
        v-model.number="columns"
        class="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option :value="1">
          1 column
        </option>
        <option :value="2">
          2 columns
        </option>
        <option :value="3">
          3 columns
        </option>
      </select>
      <button
        class="ml-4 text-sm text-blue-500 hover:underline"
        @click="handleExportPdf"
      >
        Export PDF
      </button>
    </div>

    <div class="mb-4 flex items-end space-x-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search"
        class="flex-1 border border-gray-300 rounded px-2 py-1"
      >
      <button
        v-if="searchQuery"
        class="border border-gray-300 rounded px-2 py-1 bg-gray-100"
        @click="clearSearch"
      >
        Clear
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
      :items="filteredItems"
      :columns="columns"
      @update-status="updateItemStatus"
      @delete-item="deleteItem"
      @edit-item="startEdit"
      @view-image="openImageViewer"
    />
    <ImageViewer
      v-if="selectedImage"
      :src="selectedImage"
      @close="selectedImage = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import ItemForm from './components/ItemForm.vue';
import EditItemForm from './components/EditItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import StatsDisplay from './components/StatsDisplay.vue';
import StatsChart from './components/StatsChart.vue';
import ImageViewer from './components/ImageViewer.vue';
import PrelineDatepicker from './components/PrelineDatepicker.vue';
import type { Item } from './types/item';
import { mapRecordToItem, defaultItems } from './types/item';
import { supabase } from './supabaseClient';
import { calculateStats, saveStats, type Stats } from './utils/stats';
import { exportItemsToPdf } from './utils/exportPdf';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';


// Items state
const items = ref<Item[]>([]);
const showForm = ref(false);
const showChart = ref(false);
const columns = ref(2);
const isLoading = ref(true);
const serverError = ref('');
const editingItem = ref<Item | null>(null);
const currentStats = ref<Stats>({ items: 0, sold: 0, sold_paid: 0, sold_paid_total: 0 });
const searchQuery = ref('');
const selectedImage = ref<string | null>(null);

async function signOut() {
  await supabase.auth.signOut();
}

function clearSearch() {
  searchQuery.value = '';
}

function openImageViewer(src: string) {
  selectedImage.value = src;
}

const filteredItems = computed(() => {
  let results = items.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    results = results.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.details.toLowerCase().includes(q)
    );
  }
  return results;
});



// Fetch items from supabase

async function fetchItems() {
  isLoading.value = true;
  serverError.value = '';

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('date_added', { ascending: false });

    if (error) throw error;
    items.value = data.map(mapRecordToItem); // adjust mapRecordToItem if needed
    const stats = calculateStats(items.value);
    currentStats.value = stats;
    await saveStats(stats);
  } catch (err: any) {
    console.error('Error fetching items:', err);
    serverError.value = 'Error fetching items';
    items.value = [...defaultItems];
    currentStats.value = calculateStats(items.value);
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
      if (DEBUG) console.log('Saving items to server...');
      
      // Send items to server
      const response = await fetch('/.netlify/functions/saveItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items.value)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      if (DEBUG) console.log('Items saved to server successfully');

      const stats = calculateStats(items.value);

      currentStats.value = stats;

      await saveStats(stats);

    } catch (error) {
      console.error('Error saving to server:', error);
      serverError.value = 'Failed to save items to server. Saving locally as fallback.';
      
      // Fallback to localStorage if server save fails
      try {
        localStorage.setItem('itemTrackerItems', JSON.stringify(items.value));
        if (DEBUG) console.log('Items saved to localStorage as fallback');
        const stats = calculateStats(items.value);
        currentStats.value = stats;
        await saveStats(stats);
      } catch (localError) {
        console.error('Error with localStorage fallback:', localError);
      }
    }
  }, 1000) as unknown as number;
}, { deep: true });

// Handle adding a new item
const handleItemAdded = (newItem: Item) => {
  if (DEBUG) console.log('Adding new item:', newItem);
  items.value = [...items.value, newItem]; // Create a new array to ensure reactivity
  currentStats.value = calculateStats(items.value);
  showForm.value = false;
};

// Start editing an item
const startEdit = (item: Item) => {
  editingItem.value = item;
  showForm.value = false;
  // Scroll to top so the edit form is visible without manual scrolling
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle updated item from edit form
const handleItemUpdated = async (updated: Item) => {
  const index = items.value.findIndex(i => i.id === updated.id);
  if (index !== -1) {
    const updatedItems = [...items.value];
    updatedItems[index] = updated;
    items.value = updatedItems;
    currentStats.value = calculateStats(items.value);
  }
  editingItem.value = null;
  await nextTick();
  const element = document.getElementById(`item-${updated.id}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Handle updating an item's status
const updateItemStatus = async (
  id: string,
  status: "not_sold" | "sold" | "sold_paid"
) => {
  if (DEBUG) console.log("Updating item status:", id, status);

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
      currentStats.value = calculateStats(items.value);
    }
  } catch (err: any) {
    console.error(err);
    alert("❌ Error updating status: " + err.message);
  }
};

// Handle deleting an item
const deleteItem = (id: string) => {
  if (DEBUG) console.log('Deleting item:', id);
  items.value = items.value.filter(item => item.id !== id);
  currentStats.value = calculateStats(items.value);
};

async function handleExportPdf() {
  await exportItemsToPdf(items.value);
}
</script>

<style>
/* Add any global styles here */
</style>
