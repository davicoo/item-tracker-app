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
      <label class="block text-gray-700 font-medium mb-2">Item Image</label>
      
      <!-- Replace IKUpload with regular file input -->
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileSelect"
        accept="image/*"
        class="w-full px-3 py-2 border border-gray-300 rounded"
      />
      
      <button 
        @click="handleUpload" 
        :disabled="!selectedFile || isUploading"
        class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {{ isUploading ? 'Uploading...' : 'Upload Image' }}
      </button>
      
      <div v-if="isUploading" class="mt-2">
        <progress :value="progress" max="100" class="w-full"></progress>
        <p class="text-blue-600 text-sm">{{ Math.round(progress) }}%</p>
      </div>
      
      <div v-if="uploadError" class="mt-2 text-red-600">
        {{ uploadError }}
      </div>
      
      <!-- Preview uploaded image -->
      <Image 
        v-if="newItem.imageUrl"
        :src="newItem.imageUrl"
        width="240"
        height="160"
        alt="Preview"
        class="mt-2 rounded"
      />
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
import { 
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError
} from '@imagekit/vue';
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
  status: 'not_sold' as const
});

const isUploading = ref(false);
const uploadError = ref('');
const progress = ref(0);
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  selectedFile.value = file || null;
  uploadError.value = '';
};

async function authenticate() {
  try {
    const res = await fetch('https://myinvtory.netlify.app/.netlify/functions/auth');
    if (!res.ok) {
      throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Auth response:', data);
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

async function handleUpload() {
  const file = selectedFile.value;
  if (!file) return;

  try {
    isUploading.value = true;
    uploadError.value = '';
    progress.value = 0;

    console.log('Starting upload for file:', file.name, file.type);

    // Get authentication credentials
    const creds = await authenticate();
    console.log('Got credentials:', creds);
    
    const resp = await upload({
      file,
      fileName: `item-${Date.now()}-${file.name}`,
      publicKey: creds.publicKey,
      signature: creds.signature,
      expire: creds.expire,
      token: creds.token,
      // Add these important options
      useUniqueFileName: true,
      folder: "/items", // Optional: organize uploads in a folder
      onProgress: (e) => {
        progress.value = (e.loaded / e.total) * 100;
        console.log('Upload progress:', progress.value);
      }
    });
    
    console.log('Upload successful:', resp);
    
    // Store the full ImageKit URL
    newItem.value.imageUrl = resp.url;
    
  } catch (err) {
    console.error('Upload error:', err);
    
    if (err instanceof ImageKitAbortError) {
      uploadError.value = 'Upload was aborted';
    } else if (err instanceof ImageKitInvalidRequestError) {
      uploadError.value = 'Invalid file format or request. Please use JPG, PNG, or GIF files.';
    } else if (err instanceof ImageKitUploadNetworkError) {
      uploadError.value = 'Network error - please check your connection';
    } else if (err instanceof ImageKitServerError) {
      uploadError.value = 'Server error - please try again later';
    } else {
      uploadError.value = `Upload failed: ${err.message || 'Unknown error'}`;
    }
  } finally {
    isUploading.value = false;
  }
}

const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() && 
    newItem.value.details.trim() &&
    !isUploading.value
  );
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  const itemToAdd: Item = {
    ...newItem.value,
    id: Date.now().toString()
  };
  
  emit('item-added', itemToAdd);
  
  // Reset form
  newItem.value = {
    name: '',
    imageUrl: '',
    details: '',
    status: 'not_sold'
  };
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  uploadError.value = '';
  progress.value = 0;
};
</script>