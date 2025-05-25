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
        <input
          type="file"
          @change="handleFileUpload"
          accept="image/*"
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
import { IKImage } from 'imagekitio-vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemForm',
  components: { IKImage },
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
    
    // Proper file upload using ImageKit API
    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      isUploading.value = true;
      uploadError.value = '';
      
      try {
        console.log('Getting authentication...');
        
        // Step 1: Get authentication from your Netlify function
        const authResponse = await fetch('https://myinvtory.netlify.app/.netlify/functions/auth');
        const authData = await authResponse.json();
        
        if (!authResponse.ok) {
          throw new Error(`Auth failed: ${authData.error || 'Unknown error'}`);
        }
        
        console.log('Auth successful:', authData);
        
        // Step 2: Upload to ImageKit with authentication
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `item-${Date.now()}`);
        formData.append('publicKey', 'public_8RxT918PPFr+aU5aqwgMZx/waIU=');
        formData.append('signature', authData.signature);
        formData.append('expire', authData.expire.toString());
        formData.append('token', authData.token);
        
        console.log('Uploading to ImageKit...');
        
        const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadData.message || 'Unknown error'}`);
        }
        
        if (uploadData.filePath) {
          newItem.value.imageUrl = uploadData.filePath;
          console.log('✅ Image uploaded successfully:', uploadData.filePath);
        } else {
          throw new Error('No file path in response');
        }
        
      } catch (error) {
        console.error('Upload error:', error);
        uploadError.value = `Upload failed: ${error.message}`;
      } finally {
        isUploading.value = false;
      }
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
      handleFileUpload,
      handleSubmit,
      isFormValid
    };
  }
});
</script>