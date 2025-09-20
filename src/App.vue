<template>
  <div class="min-h-screen bg-[--ui-soft-bg] font-sans">
    <div class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-12">
      <div class="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6 shadow-xl shadow-primary-500/10">
        <span class="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-300/30 blur-3xl" />
        <span class="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-secondary-300/25 blur-[120px]" />
        <div class="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div class="flex flex-1 items-center gap-4">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-white/70 shadow-inner shadow-primary-900/10 backdrop-blur">
              <img
                src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//uglysmall.png"
                alt="ConsignTracker logo"
                class="h-12 w-auto rounded-none object-contain shadow-none"
                @error="(e) => (e.target as HTMLImageElement).src = '/ugly_192px.png'"
              >
            </div>
            <div>
              <h1 class="text-3xl font-semibold text-title text-primary-900">
                ConsignTracker
              </h1>
              <p class="text-sm text-caption text-primary-600">
                by UglyStuff.ca
              </p>
            </div>
          </div>
          <div
            ref="menuRef"
            class="relative z-50"
          >
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-primary-700 shadow-lg shadow-primary-900/10 backdrop-blur transition hover:border-primary-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              @click="toggleMenu"
            >
              <svg
                class="size-4"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Menu</span>
            </button>
            <div
              v-if="showMenu"
              class="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-primary-100 bg-[--ui-bg] p-3 shadow-2xl shadow-primary-900/20"
            >
              <div class="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                Tools
              </div>
              <button
                class="flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-[--body-text-color] transition hover:bg-[--ui-soft-bg]"
                @click="openExport"
              >
                <span>Export Data</span>
                <svg
                  class="size-4 text-caption"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button
                class="mt-1 flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-[--body-text-color] transition hover:bg-[--ui-soft-bg]"
                @click="goTo('/notes')"
              >
                <span>Notes</span>
                <svg
                  class="size-4 text-caption"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <div class="my-2 h-px bg-[--ui-border-color]" />
              <div class="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                Settings
              </div>
              <button
                class="flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-[--body-text-color] transition hover:bg-[--ui-soft-bg]"
                @click="goTo('/settings')"
              >
                <span>Settings</span>
                <svg
                  class="size-4 text-caption"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <div class="my-2 h-px bg-[--ui-border-color]" />
              <div class="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                Contact
              </div>
              <button
                class="flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-[--body-text-color] transition hover:bg-[--ui-soft-bg]"
                @click="reportIssue"
              >
                <span>Report an Issue</span>
                <svg
                  class="size-4 text-caption"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button
                class="mt-1 flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-[--body-text-color] transition hover:bg-[--ui-soft-bg]"
                @click="requestFeature"
              >
                <span>Request a Feature</span>
                <svg
                  class="size-4 text-caption"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <div class="my-2 h-px bg-[--ui-border-color]" />
              <div class="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-danger-500">
                Sign Out
              </div>
              <button
                class="flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-medium text-danger-600 transition hover:bg-danger-50"
                @click="handleSignOut"
              >
                <span>Sign Out</span>
                <svg
                  class="size-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <section class="rounded-3xl border border-primary-100 bg-gradient-to-br from-white via-primary-50/40 to-white p-6 shadow-lg shadow-primary-500/10">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-title text-primary-900">
              Dashboard Snapshot
            </h2>
            <p class="text-sm text-caption text-primary-600">
              Monitor sales, payments, and outstanding totals at a glance.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-primary-600 shadow-sm shadow-primary-900/10 transition hover:bg-white"
            @click="showSoldDetails = true"
          >
            View sold breakdown
            <svg
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div class="mt-6">
          <StatsDisplay
            :stats="currentStats"
            @show-sold-details="showSoldDetails = true"
          />
        </div>
      </section>

      <SoldDetailsModal
        v-if="showSoldDetails"
        :items="items"
        @close="showSoldDetails = false"
      />

      <div
        v-if="lowStockItems.length"
        class="mb-4 flex items-center gap-3 rounded-card border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 shadow-sm shadow-warning-500/10"
      >
        ⚠️ {{ lowStockItems.length }} item(s) need restocking
      </div>


      <!-- Show server error if any -->
      <div
        v-if="serverError"
        class="mb-4 flex items-center gap-3 rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 shadow-sm shadow-danger-500/10"
      >
        {{ serverError }}
      </div>
    
      <div
        v-if="showForm && !editingItem"
        class="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[--overlay-bg] px-4 py-8 backdrop-blur-sm"
        @click.self="showForm = false"
      >
        <ItemForm
          @item-added="handleItemAdded"
          @cancel="showForm = false"
        />
      </div>

      <div
        v-if="editingItem"
        class="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[--overlay-bg] px-4 py-8 backdrop-blur-sm"
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
        class="mb-6 flex justify-end sm:justify-start"
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-indigo-500 to-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-950/30 ring-1 ring-inset ring-white/20 transition hover:translate-y-0.5 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          @click="showForm = true"
        >
          <svg
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Item
        </button>
      </div>
    
      <div class="flex flex-col flex-wrap items-center gap-3 rounded-3xl border border-primary-100 bg-gradient-to-r from-white via-primary-50/60 to-white p-4 shadow-lg shadow-primary-500/10 sm:flex-row sm:justify-between">
        <div class="flex flex-wrap items-center gap-3">
          <label
            for="view"
            class="text-sm font-medium text-primary-600"
          >View</label>
          <select
            id="view"
            v-model="layout"
            class="rounded-btn border border-primary-100 bg-white/70 px-3 py-2 text-sm text-[--body-text-color] shadow-sm shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
              class="text-sm font-medium text-primary-600"
            >Columns</label>
            <select
              id="columns"
              v-model.number="columns"
              class="rounded-btn border border-primary-100 bg-white/70 px-3 py-2 text-sm text-[--body-text-color] shadow-sm shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
      </div>


      <div class="flex flex-col gap-3 rounded-3xl border border-primary-100 bg-white/80 p-4 shadow-lg shadow-primary-500/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="flex-1 rounded-btn border border-primary-100 bg-white/70 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
        <button
          v-if="searchQuery"
          class="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-sm font-medium text-primary-600 shadow-sm shadow-primary-500/10 transition hover:bg-white"
          @click="clearSearch"
        >
          Clear
        </button>
      </div>

      <div
        v-if="isLoading"
        class="rounded-3xl border border-primary-100 bg-white/70 py-12 text-center text-sm text-primary-600 shadow-inner shadow-primary-900/10"
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
import SoldDetailsModal from './components/SoldDetailsModal.vue';
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
const showSoldDetails = ref(false);

const blockingOverlayActive = computed(
  () =>
    showForm.value ||
    Boolean(editingItem.value) ||
    showSoldDetails.value ||
    showExportModal.value ||
    showContact.value ||
    Boolean(selectedImage.value)
);

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
  document.body.classList.remove('overflow-hidden');
});

watch(
  blockingOverlayActive,
  value => {
    document.body.classList.toggle('overflow-hidden', value);
  },
  { immediate: true }
);

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
    const newSaleDates = [...(existing?.saleDates || []), now];
    const { data, error } = await supabase
      .from('items')
      .update({ status: 'not_sold', date_added: now, past_sales: newPastSales, sold_dates: newSaleDates })
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
        saleDates: newSaleDates,
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
