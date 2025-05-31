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
        Image <span class="text-red-500">*</span>
      </label>
      <input
        type="file"
        accept="image/*"
        @change="onFileChange"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
      <div v-if="previewUrl" class="mt-2">
        <img
          :src="previewUrl"
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
import { statusOptions } from '../types/item';

const emit = defineEmits(['item-added', 'cancel']);

const newItem = ref({
  name: '',
  details: '',
  status: 'not_sold' as const,
  location: '',
  price: ''
});
const selectedFile = ref<File|null>(null);
const previewUrl = ref<string>('');

const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() && 
    newItem.value.details.trim() &&
    selectedFile.value &&
    newItem.value.location.trim() &&
    newItem.value.price.trim()
  );
});

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    selectedFile.value = files[0];
    previewUrl.value = URL.createObjectURL(files[0]);
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !selectedFile.value) return;

  const formData = new FormData();
  formData.append('fields[Name]', newItem.value.name);
  formData.append('fields[Details]', newItem.value.details);
  formData.append('fields[Status]', newItem.value.status);
  formData.append('fields[Location]', newItem.value.location);
  formData.append('fields[Price]', newItem.value.price);
  formData.append('fields[Date Added]', new Date().toISOString());
  formData.append('fields[Image]', selectedFile.value);

  try {
    const response = await fetch('https://api.airtable.com/v0/appY87rzlquNoiaXX/Artwork%20Inventory', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer patIntcLUw6UAafXq'
      },
      body: formData
    });

    if (response.ok) {
      emit('item-added');
      newItem.value = {
        name: '',
        details: '',
        status: 'not_sold',
        location: '',
        price: ''
      };
      selectedFile.value = null;
      previewUrl.value = '';
    } else {
      const error = await response.json();
      alert('❌ Failed to save item to Airtable: ' + JSON.stringify(error));
    }
  } catch (err) {
    alert('❌ Network error saving to Airtable');
  }
};
</script>
