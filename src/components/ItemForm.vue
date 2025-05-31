<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    
    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Item Name</label>
      <input
        v-model="newItem.name"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item name"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Location</label>
      <input
        v-model="newItem.location"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item location"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Price</label>
      <input
        v-model="newItem.price"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item price"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">
        Image URL <span class="text-red-500">*</span>
      </label>
      <input
        v-model="newItem.imageUrl"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Paste public image URL (Imgur, Google Drive, etc)"
        required
      />
      <div v-if="newItem.imageUrl" class="mt-2">
        <img
          :src="newItem.imageUrl"
          alt="Preview"
          class="mt-2 rounded max-w-full max-h-40 object-contain"
        />
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Item Details</label>
      <textarea
        v-model="newItem.details"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        rows="3"
        placeholder="Enter item details"
      ></textarea>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Status</label>
      <select v-model="newItem.status" class="w-full px-3 py-2 border border-gray-300 rounded">
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="flex space-x-2">
      <button
        @click="handleSubmit"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        :disabled="!isFormValid"
      >
        Save Item
      </button>
      <button
        @click="$emit('cancel')"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

const emit = defineEmits<{
  'item-added': [item: Item];
  'cancel': [];
}>();

const newItem = ref({
  name: '',
  imageUrl: '',
  details: '',
  status: 'not_sold' as const,
  location: '',
  price: ''
});

const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() && 
    newItem.value.details.trim() &&
    newItem.value.imageUrl &&
    newItem.value.location.trim() &&
    newItem.value.price.trim()
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const itemToAdd = {
    ...newItem.value,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString()
  };

  const payload = {
    data: {
      id: itemToAdd.id,
      name: itemToAdd.name,
      details: itemToAdd.details,
      status: itemToAdd.status,
      image_url: itemToAdd.imageUrl,
      location: itemToAdd.location,
      price: itemToAdd.price,
      date_added: itemToAdd.dateAdded
    }
  };

  try {
    const response = await fetch("https://sheetdb.io/api/v1/3gzsx36ht7mlh", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      emit('item-added', itemToAdd);
      newItem.value = {
        name: '',
        imageUrl: '',
        details: '',
        status: 'not_sold',
        location: '',
        price: ''
      };
    } else {
      alert('❌ Failed to save item to SheetDB');
    }
  } catch (err) {
    alert('❌ Network error saving to SheetDB');
  }
};
</script>