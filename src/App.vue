<template>
  <!-- Remove IKContext wrapper - not needed with global plugin -->
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
    
    <ItemGrid 
      :items="items" 
      @update-status="updateItemStatus" 
      @delete-item="deleteItem" 
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, toRefs } from 'vue';
import ItemForm from './components/ItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import type { Item } from './types/item';
import { defaultItems } from './types/item';

export default defineComponent({
  name: 'App',
  components: {
    ItemForm,
    ItemGrid
  },
  setup() {
    const items = ref<Item[]>([]);
    const showForm = ref(false);
    const isLoading = ref(true);

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

    watch(items, (newItems) => {
      localStorage.setItem('itemTrackerItems', JSON.stringify(newItems));
    }, { deep: true });

    function addItem(newItem: Item) {
      items.value.push(newItem);
      showForm.value = false; 
    }

    const updateItemStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
      const item = items.value.find(item => item.id === id);
      if (item) {
        item.status = status;
      }
    };

    const deleteItem = (id: string) => {
      items.value = items.value.filter(item => item.id !== id);
    };

    return {
      ...toRefs({ items, showForm, isLoading }),
      addItem,
      updateItemStatus,
      deleteItem
    };
  }
});
</script>

<style>
/* Add any global styles here */
</style>