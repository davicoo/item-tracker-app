<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibled mb-4">Add New Item</h2>
    
    <IKContext
      publicKey="public_8RxT918PPFr+aU5aqwgMZx/waIU="
      urlEndpoint="https://ik.imagekit.io/mydwcapp"
      transformationPosition="path"
      authenticationEndpoint="https://myinvtory.netlify.app/.netlify/functions/auth"
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
          
          <IKUpload
            :fileName="`item-${Date.now()}`"
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
      console.log('Upload successful:', res);
      isUploading.value = false;
      newItem.value.imageUrl = res.filePath;
    };
    
    const onUploadError = (err: any) => {
      console.error('Upload error:', err);
      isUploading.value = false;
      uploadError.value = `Upload failed: ${err.message || err.toString()}`;
    };
    
    const isFormValid = computed(() => {
      return newItem.value.name.trim() !== '' && 
             newItem.value.imageUrl !== '' && 
             newItem.value.details.trim() !== '' &&
             !isUploading.value;
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