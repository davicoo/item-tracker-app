<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="flex flex-col gap-6 px-4 pt-6 pb-6 max-w-screen-xl mx-auto overflow-y-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-2 flex-1">
          <img
            src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//uglysmall.png"
            alt="ConsignTracker logo"
            class="h-[3.5rem] w-auto object-contain"
          >
          <h1 class="text-3xl font-bold leading-tight">
            ConsignTracker
            <span class="block text-sm font-normal">by UglyStuff.ca</span>
          </h1>
        </div>
        <div
          ref="menuRef"
          class="relative"
        >
          <button
            class="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 active:scale-95 transition"
            @click="toggleMenu"
          >
            ☰ Menu
          </button>
          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50"
          >
            <div class="px-4 py-2 text-xs font-semibold text-gray-500">
              Tools
            </div>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              @click="openExport"
            >
              Export Data
            </button>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              @click="goTo('/notes')"
            >
              Notes
            </button>
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 border-t">
              Settings
            </div>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              @click="goTo('/settings')"
            >
              Settings
            </button>
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 border-t">
              Contact
            </div>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              @click="reportIssue"
            >
              Report an Issue
            </button>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              @click="requestFeature"
            >
              Request a Feature
            </button>
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 border-t">
              Sign Out
            </div>
            <button
              class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              @click="handleSignOut"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <StatsDisplay
        :stats="currentStats"
      />

      <div
        v-if="lowStockItems.length"
        class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4"
      >
        ⚠️ {{ lowStockItems.length }} item(s) need restocking
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
          @reset-item="resetItemForNewVersion"
        />
        <ItemTable
          v-else
          :items="filteredItems"
          @update-status="updateItemStatus"
          @delete-item="deleteItem"
          @edit-item="startEdit"
          @view-image="openImageViewer"
          @duplicate-item="duplicateItem"
          @reset-item="resetItemForNewVersion"
        />
      </template>
      <ImageViewer
        v-if="selectedImage"
        :src="selectedImage"
        @close="selectedImage = null"
      />
      <ExportModal
        v-if="showExportModal"
        :items="items"
        @close="showExportModal = false"
      />
      <ContactModal
        v-if="showContact"
        :default-subject="contactSubject"
        @close="showContact = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import ItemForm from './components/ItemForm.vue';
import EditItemForm from './components/EditItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import ItemTable from './components/ItemTable.vue';
import StatsDisplay from './components/StatsDisplay.vue';
import ImageViewer from './components/ImageViewer.vue';
import ExportModal from './components/ExportModal.vue';
import ContactModal from './components/ContactModal.vue';
import type { Item } from './types/item';
import { mapRecordToItem, availableQuantity, NO_SKU_KEY } from './types/item';
import { supabase } from './supabaseClient';
import { calculateStats, saveStats, type Stats } from './utils/stats';
import { signOut } from './utils/auth';
import { useRouter } from 'vue-router';


// Items state
const router = useRouter();

const items = ref<Item[]>([]);
const showForm = ref(false);
const layout = ref<'grid' | 'table'>('grid');
const columns = ref(2);
const isLoading = ref(true);
const serverError = ref('');
const editingItem = ref<Item | null>(null);
const currentStats = ref<Stats>({ items: 0, sold: 0, sold_paid: 0, sold_paid_total: 0, sold_unpaid_total: 0 });
const searchQuery = ref('');
const selectedImage = ref<string | null>(null);
const showMenu = ref(false);
const showExportModal = ref(false);
const showContact = ref(false);
const contactSubject = ref('');
const menuRef = ref<HTMLElement | null>(null);

function clearSearch() {
  searchQuery.value = '';
}

function openImageViewer(src: string) {
  selectedImage.value = src;
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}

function openExport() {
  showExportModal.value = true;
  closeMenu();
}

function goTo(path: string) {
  router.push(path);
  closeMenu();
}

function openContact(subject: string) {
  contactSubject.value = subject;
  showContact.value = true;
  closeMenu();
}

function reportIssue() {
  openContact('Issue Report');
}

function requestFeature() {
  openContact('Feature Request');

}

async function handleSignOut() {
  closeMenu();
  await signOut();
  router.push('/login');
}

function onClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});

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
  } catch (err: unknown) {
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

    const response = await fetch('/.netlify/functions/saveItems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items.value)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }


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
      const stats = calculateStats(items.value);
      currentStats.value = stats;
      await saveStats(stats);
    } catch (localError) {
      console.error('Error with localStorage fallback:', localError);
      if (localError instanceof DOMException && localError.name === 'QuotaExceededError') {
        // Storage may be filled with stale data. Clear it and retry once.
        try {
          localStorage.clear();
          localStorage.setItem('itemTrackerItems', JSON.stringify(items.value));
          const stats = calculateStats(items.value);
          currentStats.value = stats;
          await saveStats(stats);
        } catch (retryError) {
          console.error('Retry after clearing storage failed:', retryError);
          alert('Browser storage is full. Items were not saved locally.');
        }
      }
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

  try {
    const itemIndex = items.value.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    const item = items.value[itemIndex];
    const wasSold = item.status === 'sold' || item.status === 'sold_paid';
    const willBeSold = status === 'sold' || status === 'sold_paid';
    let newSoldCounts = { ...(item.soldCounts || {}) };
    if (!wasSold && willBeSold) {
      if (item.skuCodes && item.skuCodes.length) {
        for (const sku of item.skuCodes) {
          newSoldCounts[sku] = (newSoldCounts[sku] || 0) + 1;
        }
      } else {
        newSoldCounts[NO_SKU_KEY] = (newSoldCounts[NO_SKU_KEY] || 0) + 1;
      }
    }

    const { data, error } = await supabase
      .from("items")
      .update({ status, sold_counts: newSoldCounts })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (itemIndex !== -1 && data) {
      const updatedItems = [...items.value];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status: data.status,
        soldCounts: newSoldCounts,
      };
      items.value = updatedItems;
      currentStats.value = calculateStats(items.value);
    }
  } catch (err: unknown) {
    console.error(err);
    alert("❌ Error updating status: " + err.message);
  }
};

// Reset a sold item for its next version.
// This marks the item as available again while preserving its cumulative
// sold counts so we can track how many versions have moved over time.
const resetItemForNewVersion = async (id: string) => {
  try {
    const itemIndex = items.value.findIndex(item => item.id === id);
    const existing = items.value[itemIndex];
    const newPastSales = (existing?.pastSales || 0) + 1;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('items')
      .update({ status: 'not_sold', date_added: now, past_sales: newPastSales })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (itemIndex !== -1 && data) {
      const updatedItems = [...items.value];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status: 'not_sold',
        dateAdded: data.date_added,
        pastSales: newPastSales,
      };
      items.value = updatedItems;
      currentStats.value = calculateStats(items.value);
    }
  } catch (err: unknown) {
    console.error(err);
    alert('❌ Error resetting item: ' + err.message);
  }
};

// Handle deleting an item
const deleteItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    items.value = items.value.filter(item => item.id !== id);
    currentStats.value = calculateStats(items.value);
  } catch (err: unknown) {
    console.error(err);
    alert('❌ Error deleting item: ' + err.message);
  }
};

async function duplicateItem(item: Item) {
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
          tags: item.tags,
          sold_counts: {},
          past_sales: 0
        }
      ])
      .select()
      .single();
    if (error) throw error;
    const newItem: Item = mapRecordToItem(inserted);
    items.value = [newItem, ...items.value];
    currentStats.value = calculateStats(items.value);
  } catch (err: unknown) {
    console.error(err);
    alert('❌ Error duplicating item: ' + err.message);
  }
}

</script>

<style>
/* Add any global styles here */
</style>
