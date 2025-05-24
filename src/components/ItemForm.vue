<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    <div>
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Name
        </label>
        <input
          type="text"
          v-model="newItem.name"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Image
        </label>
        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
        />
        <div v-if="previewUrl" class="mt-2">
          <img 
            :src="previewUrl" 
            alt="Preview" 
            class="h-40 object-cover rounded"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Details
        </label>
        <textarea
          v-model="newItem.details"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Status
        </label>
        <select
          v-model="newItem.status"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option 
            v-for="option in statusOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="flex space-x-2">
        <button
          @click="handleSubmit"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType, computed } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';


export default defineComponent({
  name: 'ItemForm',
  emits: ['item-added', 'cancel'],
  setup(props, { emit }) {
    const newItem = ref<Omit<Item, 'id'>>({
      name: '',
      imageUrl: '',
      details: '',
      status: 'not_sold'
    });
    
    const previewUrl = ref<string>('');
    
    // Handle file selection
    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        // Create preview URL
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (typeof fileReader.result === 'string') {
            previewUrl.value = fileReader.result;
            newItem.value.imageUrl = fileReader.result;
          }
        };
        fileReader.readAsDataURL(file);
      }
    };
    
    // Check if form is valid
    const isFormValid = computed(() => {
      return newItem.value.name.trim() !== '' && 
             newItem.value.imageUrl !== '' && 
             newItem.value.details.trim() !== '';
    });
    
    // Handle form submission
    const handleSubmit = () => {
      if (!isFormValid.value) return;
      
      // Create new item with unique ID
      const itemToAdd: Item = {
        ...newItem.value,
        id: Date.now().toString()
      };
      
      // Emit event with new item
      emit('item-added', itemToAdd);
      
      // Reset form
      newItem.value = {
        name: '',
        imageUrl: '',
        details: '',
        status: 'not_sold'
      };
      previewUrl.value = '';
    };
    
    return {
      newItem,
      previewUrl,
      statusOptions,
      handleFileChange,
      handleSubmit,
      isFormValid
    };
  }
});
</script>