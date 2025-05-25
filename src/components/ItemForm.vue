<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    
    <!-- Enhanced debug info -->
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
        <label class="block text-gray-700 font-medium mb-2">
          Item Name
        </label>
        <input
          v-model="newItem.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
          placeholder="Enter item name"
        />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          Item Image
        </label>
        
        <IKUpload
          fileName="test-upload"
          :onError="onUploadError"
          :onSuccess="onUploadSuccess"
          :onUploadStart="onUploadStart"
          useUniqueFileName="true"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <!-- Upload status -->
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
          <p class="text-sm text-gray-600 mt-1">Image path: {{ newItem.imageUrl }}</p>
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
          placeholder="Enter item details"
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
import { IKImage, IKUpload } from 'imagekitio-vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemForm',
  components: {
    IKImage,
    IKUpload
  },
  emits: ['item-added', 'cancel'],
  setup(props, { emit }) {
    const newItem = ref<Omit<Item, 'id' | 'dateAdded'>>({
      name: '',
      imageUrl: '',
      details: '',
      status: 'not_sold'
    });
    
    const isUploading = ref<boolean>(false);
    const uploadError = ref<string>('');
    
    const onUploadStart = () => {
      console.log('Upload started...');
      isUploading.value = true;
      uploadError.value = '';
    };
    
    const onUploadSuccess = (res: any) => {
      console.log('Upload successful - full response:', res);
      console.log('Response keys:', Object.keys(res));
      console.log('Response structure:', JSON.stringify(res, null, 2));
      
      isUploading.value = false;
      
      // Try different possible response properties
      if (res.filePath) {
        newItem.value.imageUrl = res.filePath;
        console.log('✅ Set imageUrl from filePath:', res.filePath);
      } else if (res.url) {
        newItem.value.imageUrl = res.url;
        console.log('✅ Set imageUrl from url:', res.url);
      } else if (res.name) {
        newItem.value.imageUrl = res.name;
        console.log('✅ Set imageUrl from name:', res.name);
      } else if (res.fileId) {
        newItem.value.imageUrl = res.fileId;
        console.log('✅ Set imageUrl from fileId:', res.fileId);
      } else if (typeof res === 'string') {
        newItem.value.imageUrl = res;
        console.log('✅ Set imageUrl from string response:', res);
      } else {
        console.error('❌ No valid image path found in response:', res);
        uploadError.value = 'Upload succeeded but could not get image path';
        
        // Try to extract any string value from the response
        const possiblePath = Object.values(res).find(val => 
          typeof val === 'string' && val.length > 0
        );
        if (possiblePath) {
          newItem.value.imageUrl = possiblePath as string;
          console.log('✅ Found possible path:', possiblePath);
        }
      }
      
      console.log('Final imageUrl:', newItem.value.imageUrl);
    };
    
    const onUploadError = (err: any) => {
      console.error('Upload error details:', err);
      isUploading.value = false;
      uploadError.value = `Upload failed: ${err.message || err.toString()}`;
    };
    
    const isFormValid = computed(() => {
      const valid = !!(
        newItem.value?.name?.trim() && 
        newItem.value?.imageUrl?.trim() && 
        newItem.value?.details?.trim() &&
        !isUploading.value
      );
      
      console.log('Form validation:', {
        name: newItem.value?.name?.trim(),
        imageUrl: newItem.value?.imageUrl?.trim(),
        details: newItem.value?.details?.trim(),
        uploading: isUploading.value,
        valid: valid
      });
      
      return valid;
    });
    
    const handleSubmit = () => {
      console.log('Submit clicked');
      console.log('Form valid:', isFormValid.value);
      console.log('Current item:', newItem.value);
      
      if (!isFormValid.value) {
        console.log('❌ Form is not valid, not submitting');
        return;
      }
      
      try {
        const itemToAdd: Item = {
          ...newItem.value,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString()
        };
        
        console.log('✅ Emitting item-added:', itemToAdd);
        emit('item-added', itemToAdd);
        
        // Reset form
        newItem.value = {
          name: '',
          imageUrl: '',
          details: '',
          status: 'not_sold'
        };
        uploadError.value = '';
        
      } catch (error) {
        console.error('Submit error:', error);
        uploadError.value = 'Error submitting form';
      }
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