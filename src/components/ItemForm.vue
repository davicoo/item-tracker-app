<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    
    <!-- ImageKit Context - Use PUBLIC key -->
    <IKContext
      publicKey="public_BLo55sPu94p4/MUy7mHgfDdvOg8="
      urlEndpoint="https://ik.imagekit.io/mydwcapp"
      transformationPosition="path"
    >
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
    </IKContext>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { IKContext, IKImage, IKUpload } from 'imagekitio-vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

export default defineComponent({
  name: 'ItemForm',
  components: {
    IKContext,
    IKImage,
    IKUpload
  },
  emits: ['item-added', 'cancel'],
  setup(props, { emit }) {
    // ImageKit configuration - Use PUBLIC key
    const imageKitConfig = {
      publicKey: "public_BLo55sPu94p4/MUy7mHgfDdvOg8=", // Changed from private to public
      urlEndpoint: "https://ik.imagekit.io/mydwcapp",
      transformationPosition: "path"
    };

    const newItem = ref<Omit<Item, 'id' | 'dateAdded'>>({
      name: '',
      imageUrl: '',
      details: '',
      status: 'not_sold'
    });
    
    const isUploading = ref<boolean>(false);
    const uploadError = ref<string>('');
    
    // ImageKit upload handlers with better error handling
    const onUploadStart = () => {
      console.log('Upload started...');
      isUploading.value = true;
      uploadError.value = '';
    };
    
    const onUploadSuccess = (res: any) => {
      console.log('Upload successful:', res);
      isUploading.value = false;
      
      // Check if the response has the expected structure
      if (res && res.filePath) {
        newItem.value.imageUrl = res.filePath;
      } else if (res && res.url) {
        newItem.value.imageUrl = res.url;
      } else {
        console.error('Unexpected response structure:', res);
        uploadError.value = 'Upload succeeded but response format is unexpected.';
      }
    };
    
    const onUploadError = (err: any) => {
      console.error('Upload error details:', err);
      isUploading.value = false;
      
      // Provide more specific error messages
      if (err.message) {
        uploadError.value = `Upload failed: ${err.message}`;
      } else if (err.toString().includes('401')) {
        uploadError.value = 'Authentication failed. Check your ImageKit credentials.';
      } else if (err.toString().includes('403')) {
        uploadError.value = 'Upload not allowed. Enable unsigned uploads in ImageKit dashboard.';
      } else {
        uploadError.value = 'Failed to upload image. Please try again.';
      }
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
      imageKitConfig,
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