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
      <label class="block text-gray-700 font-medium mb-2">
        Item Image <span class="text-red-500">*</span>
      </label>
      
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
      <div v-if="newItem.imageUrl" class="mt-2">
        <img 
          :src="newItem.imageUrl.startsWith('local:') ? newItem.imageUrl.substring(6) : newItem.imageUrl"
          alt="Preview"
          class="mt-2 rounded max-w-full max-h-40 object-contain"
        />
      </div>

      <!-- Add a message for required image -->
      <div v-if="!newItem.imageUrl && !isUploading" class="mt-2 text-amber-600 text-sm">
        An image is required before saving the item.
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
        {{ newItem.imageUrl ? 'Save Item' : 'Please Upload Image First' }}
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

// Function to resize an image before upload
async function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up FileReader onload function
    reader.onload = function(e) {
      // Create an image element to load the file data
      const img = new Image();
      img.src = e.target?.result as string;
      
      // Once the image is loaded, resize it
      img.onload = function() {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Create a canvas and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
}

// Modified handleUpload with local fallback
async function handleUpload() {
  const file = selectedFile.value;
  if (!file) return;

  try {
    isUploading.value = true;
    uploadError.value = '';
    progress.value = 0;
    
    // First resize the image
    console.log('Resizing image...');
    progress.value = 10; // Show some progress
    
    // Check if it's an image type we can resize
    const isResizableImage = file.type.startsWith('image/');
    
    // Either resize the image or use the original file
    const fileToUpload = isResizableImage 
      ? await resizeImage(file, 1200, 800, 0.85) 
      : file;
      
    console.log(`Original size: ${Math.round(file.size/1024)}KB, Resized: ${Math.round(fileToUpload.size/1024)}KB`);
    progress.value = 20; // Update progress after resizing
    
    // Then try the cloud upload to ImageKit
    try {
      console.log('Attempting cloud upload...');
      
      // Get authentication
      const authResp = await fetch('https://myinvtory.netlify.app/.netlify/functions/auth');
      const authData = await authResp.json();
      
      // Create FormData with the resized image
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('fileName', `item_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      formData.append('publicKey', authData.publicKey);
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      
      // Upload to ImageKit
      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData
      });
      
      progress.value = 80; // Almost done
      
      if (!response.ok) {
        throw new Error(`Cloud upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Cloud upload successful!', result);
      
      // Use the returned URL
      newItem.value.imageUrl = result.url;
      
    } catch (cloudError) {
      console.warn('Cloud upload failed, falling back to local storage:', cloudError);
      
      // If cloud upload fails, store the resized image locally
      // Convert resized blob to data URL
      const dataUrl = await fileToDataUrl(fileToUpload);
      
      // Store locally with a prefix
      newItem.value.imageUrl = `local:${dataUrl}`;
      
      // Show warning
      uploadError.value = 'Cloud upload failed. Image stored locally only.';
    }
    
    progress.value = 100;
    
  } catch (err) {
    console.error('All upload methods failed:', err);
    uploadError.value = `Upload failed: ${err.message}`;
  } finally {
    isUploading.value = false;
  }
}

// Helper to convert Blob to data URL
async function fileToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Update form validation to require an image
const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() && 
    newItem.value.details.trim() &&
    newItem.value.imageUrl && // Require an image
    !isUploading.value
  );
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  const itemToAdd: Item = {
    ...newItem.value,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString()  // Add this line
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