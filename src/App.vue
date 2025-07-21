<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="flex flex-col gap-6 px-4 pt-6 pb-6 max-w-screen-xl mx-auto overflow-y-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-2 flex-1">
          <img
            src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//uglysmall.png"
            alt="Artwork Tracker logo"
            class="w-8 h-8 object-contain"
          >
          <h1 class="text-3xl font-bold">
            Artwork Tracker
          </h1>
        </div>
        <button
          class="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 active:scale-95 transition"
          @click="signOut"
        >
          Sign Out
        </button>
      </div>

      <StatsDisplay :stats="currentStats" />

      <div
        v-if="lowStockItems.length"
        class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4"
      >
        ⚠️ {{ lowStockItems.length }} item(s) need restocking
      </div>

      <div class="flex justify-end mb-2">
        <button
          class="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition"
          @click="showChart = !showChart"
        >
          {{ showChart ? 'Hide Chart' : 'Show Chart' }}
        </button>
      </div>

      <div
        v-if="showChart"
        class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-40"
        @click.self="showChart = false"
      >
        <StatsChart
          :items="items"
          @close="showChart = false"
        />
      </div>


    
      <!-- Show server error if any -->
      <div
        v-if="serverError"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {{ serverError }}
      </div>
    
      <div
        v-if="showForm && !editingItem"
        class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-40"
        @click.self="showForm = false"
      >
        <ItemForm
          @item-added="handleItemAdded"
          @cancel="showForm = false"
        />
      </div>

      <div
        v-if="editingItem"
        class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-40"
        @click.self="editingItem = null"
      >
        <EditItemForm
          :item="editingItem"
          @item-updated="handleItemUpdated"
          @cancel="editingItem = null"
        />
      </div>
    
      <div
        v-if="!showForm"
        class="mb-6"
      >
        <button
          class="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition"
          @click="showForm = true"
        >
          Add New Item
        </button>
      </div>
    
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 flex-wrap">
        <label
          for="view"
          class="mr-2 text-sm text-gray-700"
        >View:</label>
        <select
          id="view"
          v-model="layout"
          class="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="grid">
            Grid
          </option>
          <option value="table">
            Table
          </option>
        </select>
        <template v-if="layout === 'grid'">
          <label
            for="columns"
            class="ml-4 mr-2 text-sm text-gray-700"
          >Columns:</label>
          <select
            id="columns"
            v-model.number="columns"
            class="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
        </template>
        <div class="mt-4 sm:mt-0 sm:ml-auto">
          <button
            class="flex items-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            :disabled="exporting"
            @click="handleExportPdf"
          >
            <svg
              v-if="exporting"
              class="animate-spin h-4 w-4 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>{{ exporting ? 'Exporting...' : 'Export PDF' }}</span>
          </button>
        </div>
      </div>

      <div class="mb-4 flex flex-col sm:flex-row sm:items-end sm:space-x-2 space-y-2 sm:space-y-0">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="flex-1 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
    
      <template v-else>
        <ItemGrid
          v-if="layout === 'grid'"
          :items="filteredItems"
          :columns="columns"
          @update-status="updateItemStatus"
          @delete-item="deleteItem"
          @edit-item="startEdit"
          @view-image="openImageViewer"
          @duplicate-item="duplicateItem"
        />
        <ItemTable
          v-else
          :items="filteredItems"
          @update-status="updateItemStatus"
          @delete-item="deleteItem"
          @edit-item="startEdit"
          @view-image="openImageViewer"
          @duplicate-item="duplicateItem"
        />
      </template>
      <ImageViewer
        v-if="selectedImage"
        :src="selectedImage"
        @close="selectedImage = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import ItemForm from './components/ItemForm.vue';
import EditItemForm from './components/EditItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import ItemTable from './components/ItemTable.vue';
import StatsDisplay from './components/StatsDisplay.vue';
import StatsChart from './components/StatsChart.vue';
import ImageViewer from './components/ImageViewer.vue';
import type { Item } from './types/item';
import { mapRecordToItem, availableQuantity } from './types/item';
import { supabase } from './supabaseClient';
import { calculateStats, saveStats, type Stats } from './utils/stats';
import { exportItemsToPdf } from './utils/exportPdf';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';


// Items state
const items = ref<Item[]>([]);
const showForm = ref(false);
const showChart = ref(false);
const layout = ref<'grid' | 'table'>('grid');
const columns = ref(2);
const isLoading = ref(true);
const serverError = ref('');
const editingItem = ref<Item | null>(null);
const currentStats = ref<Stats>({ items: 0, sold: 0, sold_paid: 0, sold_paid_total: 0, sold_unpaid_total: 0 });
const searchQuery = ref('');
const selectedImage = ref<string | null>(null);
const exporting = ref(false);

async function signOut() {
  document.cookie = 'introShown=; path=/; max-age=0';
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

const lowStockItems = computed(() =>
  items.value.filter(i => availableQuantity(i) < i.minQuantity)
);



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
    items.value = [];
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
const MAX_SAVE_RETRIES = 3;
let retryCount = 0;
let retryTimeout: number | undefined;

async function attemptSave() {
  try {
    serverError.value = '';
    if (DEBUG) console.log('Saving items to server...');

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

    retryCount = 0;
    return true;
  } catch (error) {
    console.error('Error saving to server:', error);
    serverError.value = `Failed to save items to server: ${(error as Error).message}. Saving locally as fallback.`;

    try {
      localStorage.setItem('itemTrackerItems', JSON.stringify(items.value));
      if (DEBUG) console.log('Items saved to localStorage as fallback');
      const stats = calculateStats(items.value);
      currentStats.value = stats;
      await saveStats(stats);
    } catch (localError) {
      console.error('Error with localStorage fallback:', localError);
    }

    return false;
  }
}

function scheduleRetry() {
  if (retryCount >= MAX_SAVE_RETRIES) {
    return;
  }
  if (retryTimeout) {
    return;
  }
  retryTimeout = setTimeout(async () => {
    retryTimeout = undefined;
    if (DEBUG) console.log('Retrying save to server...');
    const success = await attemptSave();
    if (!success) {
      retryCount++;
      scheduleRetry();
    }
  }, 5000) as unknown as number;
}

watch(items, () => {
  // Clear previous timeout
  if (saveTimeout) clearTimeout(saveTimeout);
  
  // Set a timeout to avoid too many saves
  saveTimeout = setTimeout(async () => {
    const success = await attemptSave();
    if (!success) {
      scheduleRetry();
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

async function duplicateItem(item: Item) {
  if (DEBUG) console.log('Duplicating item:', item.id);
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const { data: inserted, error } = await supabase
      .from('items')
      .insert([
        {
          user_id: user?.id,
          name: item.name,
          details: item.details,
          quantity: item.quantity,
          sku_codes: item.skuCodes,
          status: 'not_sold',
          location: item.location,
          price: item.price,
          fee_percent: item.feePercent,
          image_url: item.imageUrl,
          date_added: new Date().toISOString(),
          tags: item.tags
        }
      ])
      .select()
      .single();
    if (error) throw error;
    const newItem: Item = mapRecordToItem(inserted);
    items.value = [newItem, ...items.value];
    currentStats.value = calculateStats(items.value);
  } catch (err: any) {
    console.error(err);
    alert('❌ Error duplicating item: ' + err.message);
  }
}

async function handleExportPdf() {
  exporting.value = true;
  try {
    await exportItemsToPdf(items.value);
  } finally {
    exporting.value = false;
  }
}
</script>

<style>
/* Add any global styles here */
</style>
