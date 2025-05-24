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
    />@cancel="isFormVisible = false"
    />
    <!-- Items Grid -->
    <ItemGrid  Grid -->
      :items="items" 
      @update-status="updateItemStatus" 
      @delete-item="deleteItem"mStatus" 
    />@delete-item="deleteItem"
    />
    <!-- Empty state -->
    <div v-if="items.length === 0" class="text-center p-8 bg-gray-100 rounded-lg">
      <p class="text-gray-500">No items yet. Add your first item!</p> rounded-lg">
    </div>lass="text-gray-500">No items yet. Add your first item!</p>
  </div>v>
</template>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import ItemForm from './components/ItemForm.vue';
import ItemGrid from './components/ItemGrid.vue';
import type { Item } from './types/item';
import { defaultItems } from './types/item';import { Item, defaultItems } from './types/item';

export default defineComponent({ defineComponent({
  name: 'App',
  components: { {
    ItemForm,,
    ItemGridItemGrid
  },
  setup() {
    const items = ref<Item[]>([]);
    const isFormVisible = ref(false);    const isFormVisible = ref(false);

    // Load items from localStorage on component mountm localStorage on component mount
    onMounted(() => {
      const savedItems = localStorage.getItem('itemTrackerItems');= localStorage.getItem('itemTrackerItems');
      if (savedItems) {
        items.value = JSON.parse(savedItems);value = JSON.parse(savedItems);
      } else {
        items.value = defaultItems;
        localStorage.setItem('itemTrackerItems', JSON.stringify(defaultItems)); localStorage.setItem('itemTrackerItems', JSON.stringify(defaultItems));
      }
    });    });

    // Save items to localStorage whenever they changee whenever they change
    watch(items, (newItems) => {
      localStorage.setItem('itemTrackerItems', JSON.stringify(newItems));tem('itemTrackerItems', JSON.stringify(newItems));
    }, { deep: true });    }, { deep: true });

    // Add new item
    const addItem = (newItem: Item) => {em) => {
      items.value.push(newItem);
      isFormVisible.value = false;isFormVisible.value = false;
    };    };

    // Update item status
    const updateItemStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => { | "sold" | "sold_paid") => {
      const item = items.value.find(item => item.id === id);= items.value.find(item => item.id === id);
      if (item) {
        item.status = status; item.status = status;
      }}
    };    };

    // Delete an item
    const deleteItem = (id: string) => {
      items.value = items.value.filter(item => item.id !== id);items.value = items.value.filter(item => item.id !== id);
    };    };

    return {
      items,
      isFormVisible,sible,
      addItem,
      updateItemStatus,Status,
      deleteItemdeleteItem
    }; };
  }
});

</script></script>
import { defineComponent, ref, computed } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemCard',
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    },
    onUpdateStatus: {
      type: Function as PropType<(id: string, status: "not_sold" | "sold" | "sold_paid") => void>,
      required: true
    },
    onDeleteItem: {
      type: Function as PropType<(id: string) => void>,
      required: true
    }
  },
  setup(props) {
    const isSoldPaid = computed(() => props.item.status === 'sold_paid');

    const handleStatusChange = (event: Event) => {
      const selectElement = event.target as HTMLSelectElement;
      const newStatus = selectElement.value as "not_sold" | "sold" | "sold_paid";
      props.onUpdateStatus(props.item.id, newStatus);
    };

    const handleDelete = () => {
      props.onDeleteItem(props.item.id);
    };

    return {
      isSoldPaid,
      handleStatusChange,
      handleDelete
    };
  }
});
import { defineComponent, PropType } from 'vue';
import type { Item } from '../types/item';
import ItemCard from './ItemCard.vue';

export default defineComponent({
  name: 'ItemGrid',
  components: {
    ItemCard
  },
  props: {
    items: {
      type: Array as PropType<Item[]>,
      required: true
    }
  },
  emits: ['update-status', 'delete-item'],
  setup(props, { emit }) {
    const handleUpdateStatus = (id: string, status: "not_sold" | "sold" | "sold_paid") => {
      emit('update-status', id, status);
    };

    const handleDeleteItem = (id: string) => {
      emit('delete-item', id);
    };

    return {
      handleUpdateStatus,
      handleDeleteItem
    };
  }
});