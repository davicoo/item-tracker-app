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
        
        <!-- Temporary simple file input -->
        <input
          type="file"
          @change="handleFileUpload"
          accept="image/*"
          class="w-full px-3 py-2 border border-gray-300 rounded"
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
          <img 
            :src="newItem.imageUrl"
            alt="Preview"
            class="w-60 h-40 object-cover rounded"
          />
          <p class="text-sm text-gray-600 mt-1">Image: {{ newItem.imageUrl }}</p>
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
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemForm',
  emits: ['item-added', 'cancel'],
  setup(props, { emit }) {
    // Initialize with proper reactive values
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
      console.log('Upload successful - full response:', res);
      console.log('Response keys:', Object.keys(res));
      
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
      } else {
        console.error('❌ No valid image path found in response:', res);
        uploadError.value = 'Upload succeeded but could not get image path';
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
        newItem.value.name.trim() && 
        newItem.value.imageUrl.trim() && 
        newItem.value.details.trim() &&
        !isUploading.value
      );
      
      console.log('Form validation:', {
        name: newItem.value.name,
        imageUrl: newItem.value.imageUrl,
        details: newItem.value.details,
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
        
        console.log('✅ Preparing to emit item-added:', itemToAdd);
        try {
          emit('item-added', itemToAdd);
          console.log('✅ Emission successful');
        } catch (emitError) {
          console.error('❌ Emission failed:', emitError);
          uploadError.value = 'Error emitting item-added event';
          return;
        }
        
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
    
    // New method to handle file input change
    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
    
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
      if (!allowedTypes.includes(file.type)) {
        uploadError.value = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        console.error('File type validation failed:', file.type);
        return;
      }
    
      if (file.size > maxSizeInBytes) {
        uploadError.value = `File size exceeds ${maxSizeInMB}MB limit.`;
        console.error('File size validation failed:', file.size);
        return;
      }
    
      isUploading.value = true;
      uploadError.value = '';
      
      try {
        // Step 1: Get authentication from your Netlify function
        const authResponse = await fetch('https://myinvtory.netlify.app/.netlify/functions/auth?' + 
          new URLSearchParams({
            token: Math.random().toString(36),
            // Use seconds, not ms
            expire: Math.floor(Date.now() / 1000 + 3600).toString()
          }));
        
        const authData = await authResponse.json();
        console.log('Auth data:', authData);
        
        // Step 2: Upload to ImageKit
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `item-${Date.now()}`);
        formData.append('publicKey', 'public_8RxT918PPFr+aU5aqwgMZx/waIU=');
        formData.append('signature', authData.signature);
        formData.append('expire', authData.expire);
        formData.append('token', authData.token);
        
        const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        if (uploadData && typeof uploadData === 'object' && 'filePath' in uploadData) {
          newItem.value.imageUrl = uploadData.filePath;
          console.log('✅ Image uploaded to ImageKit:', uploadData.filePath);
          // Reset file input
          (event.target as HTMLInputElement).value = '';
        } else {
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        
        if (uploadData && typeof uploadData === 'object' && 'filePath' in uploadData) {
          newItem.value.imageUrl = uploadData.filePath;
          console.log('✅ Image uploaded to ImageKit:', uploadData.filePath);
        } else {
          console.error('❌ Invalid upload response structure:', uploadData);
          throw new Error('Upload failed: Invalid response structure');
        }
        
      } catch (error) {
        uploadError.value = 'Failed to upload image';
        console.error('Upload error:', error);
      } finally {
        isUploading.value = false;
      }
    return {
      // Reactive properties
      newItem,
      isUploading,
      uploadError,
      statusOptions,

      // Computed properties
      isFormValid,

      // Methods
      onUploadStart,
      onUploadSuccess,
      onUploadError,
      handleSubmit,
      handleFileUpload
    };
      isFormValid
    };
  }
});
</script>