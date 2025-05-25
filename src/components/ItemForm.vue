<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    
    <!-- Debug info -->
    <div class="mb-4 p-2 bg-gray-100 text-sm">
      <strong>Debug:</strong><br>
      Name: {{ newItem.name?.length || 0 }} chars ({{ newItem.name }})<br>
      Image: {{ newItem.imageUrl ? 'Set' : 'Not set' }} ({{ newItem.imageUrl }})<br>
      Details: {{ newItem.details?.length || 0 }} chars ({{ newItem.details }})<br>
      Uploading: {{ isUploading }}<br>
      Valid: {{ isFormValid }}
    </div>
    
    <div>
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
        <label class="block text-gray-700 font-medium mb-2">Item Image</label>
        
        <!-- Replace IKUpload with regular file input -->
        <IKUpload
          fileName="item-upload"
          :onError="onUploadError"
          :onSuccess="onUploadSuccess"
          :onUploadStart="onUploadStart"
          useUniqueFileName="true"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
        
        <div v-if="isUploading" class="mt-2 text-blue-600">
          Uploading image...
        </div>
        
        <div v-if="uploadError" class="mt-2 text-red-600">
          {{ uploadError }}
        </div>
        
        <!-- Preview -->
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
import { IKImage, IKUpload } from '@imagekit/vue'; // Changed from 'imagekitio-vue'
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemForm',
  components: { IKImage, IKUpload },
  emits: ['item-added', 'cancel'],
  setup(props, { emit }) {
    const newItem = ref({
      name: '',
      imageUrl: '',
      details: '',
      status: 'not_sold' as const
    });
    
    const isUploading = ref(false);
    const uploadError = ref('');
    
    const onUploadStart = () => {
      console.log('Upload started...');
      isUploading.value = true;
      uploadError.value = '';
    };
    
    const onUploadSuccess = (res: any) => {
      console.log('Upload successful:', res);
      isUploading.value = false;
      
      if (res.filePath) {
        newItem.value.imageUrl = res.filePath;
        console.log('✅ Image uploaded:', res.filePath);
      } else {
        console.error('No filePath in response:', res);
        uploadError.value = 'Upload succeeded but no file path returned';
      }
    };
    
    const onUploadError = (err: any) => {
      console.error('Upload error:', err);
      isUploading.value = false;
      uploadError.value = `Upload failed: ${err.message || err.toString()}`;
    };
    
    const isFormValid = computed(() => {
      return !!(
        newItem.value.name.trim() && 
        newItem.value.imageUrl.trim() && 
        newItem.value.details.trim() &&
        !isUploading.value
      );
    });
    
    const handleSubmit = () => {
      if (!isFormValid.value) return;
      
      const itemToAdd: Item = {
        ...newItem.value,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString()
      };
      
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