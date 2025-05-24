// Define TypeScript interfaces for our item data
export interface Item {
    id: string;
    name: string;
    imageUrl: string;  // This will now contain Cloudinary URLs
    details: string;
    status: "not_sold" | "sold" | "sold_paid";
    dateAdded: string;
  }
  
  // Status option definition
  export interface StatusOption {
    value: "not_sold" | "sold" | "sold_paid";
    label: string;
  }
  
  // Status options for dropdown
  export const statusOptions: StatusOption[] = [
    { value: "not_sold", label: "Not Sold" },
    { value: "sold", label: "Sold" },
    { value: "sold_paid", label: "Sold & Paid" }
  ];
  
  // Default items for demonstration
  export const defaultItems: Item[] = [
    {
      id: "1",
      name: "Vintage Camera",
      imageUrl: "/images/placeholder-image-1.jpg",
      details: "A vintage film camera from the 1970s in excellent condition.",
      status: "not_sold",
      dateAdded: "2023-10-01"
    },
    {
      id: "2",
      name: "Antique Chair",
      imageUrl: "/images/placeholder-image-1.jpg",
      details: "Hand-carved wooden chair from the early 1900s.",
      status: "sold",
      dateAdded: "2023-09-15"
    }
  ];
  
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    <div>
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Name
        </label>
        <input
          v-model="newItem.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Image
        </label>
        
        <!-- ImageKit Upload Component -->
        <IKUpload
          :fileName="`item-${Date.now()}`"
          :onError="onUploadError"
          :onSuccess="onUploadSuccess"
          :onUploadStart="onUploadStart"
          useUniqueFileName="true"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
        
        <!-- Upload status -->
        <div v-if="isUploading" class="mt-2 text-blue-600">
          Uploading image...
        </div>
        
        <!-- Upload error -->
        <div v-if="uploadError" class="mt-2 text-red-600">
          {{ uploadError }}
        </div>
        
        <!-- Preview using ImageKit -->
        <div v-if="newItem.imageUrl" class="mt-2">
          <IKImage 
            :path="newItem.imageUrl"
            :transformation="[{ height: '160', width: '240' }]"
            alt="Preview"
            class="rounded"
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
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          :disabled="!isFormValid"
        >
          {{ isUploading ? 'Uploading...' : 'Save Item' }}
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
import { defineComponent, ref, computed } from 'vue';
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
    
    const isUploading = ref<boolean>(false);
    const uploadError = ref<string>('');
    
    // ImageKit upload handlers
    const onUploadStart = () => {
      isUploading.value = true;
      uploadError.value = '';
    };
    
    const onUploadSuccess = (res: any) => {
      isUploading.value = false;
      // Store the file path from ImageKit response
      newItem.value.imageUrl = res.filePath;
    };
    
    const onUploadError = (err: any) => {
      isUploading.value = false;
      uploadError.value = 'Failed to upload image. Please try again.';
      console.error('Upload error:', err);
    };
    
    // Check if form is valid
    const isFormValid = computed(() => {
      return newItem.value.name.trim() !== '' && 
             newItem.value.imageUrl !== '' && 
             newItem.value.details.trim() !== '' &&
             !isUploading.value;
    });
    
    // Handle form submission
    const handleSubmit = () => {
      if (!isFormValid.value) return;
      
      // Create new item with unique ID
      const itemToAdd: Item = {
        ...newItem.value,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString()
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
      uploadError.value = '';
    };
    
    return {
      newItem,
      isUploading,
      uploadError,
      statusOptions,
      onUploadStart,
      onUploadSuccess,
      onUploadError,
      handleSubmit,
      isFormValid
    };
  }
});
</script>