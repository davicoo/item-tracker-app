<template>
  <div class="max-w-4xl mx-auto p-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-center mb-2">Item Tracker</h1>
      <p class="text-gray-600 text-center">Track your items and their sale status</p>
    </header>

    <!-- Add New Item Button -->
    <div class="mb-6 text-center">
      <button 
        @click="isFormVisible = !isFormVisible"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
      >
        {{ isFormVisible ? "Cancel" : "Add New Item" }}
      </button>
    </div>

    <!-- Add New Item Form -->
    <ItemForm 
      v-if="isFormVisible" 
      @item-added="addItem"
      @cancel="isFormVisible = false"
    />

    <!-- Items Grid -->
    <ItemGrid 
      :items="items" 
      @update-status="updateItemStatus" 
      @delete-item="deleteItem"
    />

    <!-- Empty state -->
    <div v-if="items.length === 0" class="text-center p-8 bg-gray-100 rounded-lg">
      <p class="text-gray-500">No items yet. Add your first item!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import ItemForm from './components/ItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import { Item, defaultItems } from './types/item';

export default defineComponent({
  name: 'App',
  components: {
    ItemForm,
    ItemGrid
  },
  setup() {
    const items = ref<Item[]>([]);
    const isFormVisible = ref(false);

    // Load items from localStorage on component mount
    onMounted(() => {
      const savedItems = localStorage.getItem('itemTrackerItems');
      if (savedItems) {
        items.value = JSON.parse(savedItems);
      } else {
        items.value = defaultItems;
        localStorage.setItem('itemTrackerItems', JSON.stringify(defaultItems));
      }
    });

    // Save items to localStorage whenever they change
    watch(items, (newItems) => {
      localStorage.setItem('itemTrackerItems', JSON.stringify(newItems));
    }, { deep: true });

    // Add new item
    const addItem = (newItem: Item) => {
      items.value.push(newItem);
      isFormVisible.value = false;
    };

    // Update item status
    const updateItemStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
      const item = items.value.find(item => item.id === id);
      if (item) {
        item.status = status;
      }
    };

    // Delete an item
    const deleteItem = (id: string) => {
      items.value = items.value.filter(item => item.id !== id);
    };

    return {
      items,
      isFormVisible,
      addItem,
      updateItemStatus,
      deleteItem
    };
  }
});
</script>