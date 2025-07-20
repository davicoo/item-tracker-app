<template>
  <div class="relative z-50 bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-10 overflow-y-auto max-h-[90vh]">
    <h2 class="text-xl font-semibold mb-4">
      Add New Item
    </h2>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
      <input
        v-model="newItem.name"
        type="text"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item name"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <input
        v-model="newItem.location"
        type="text"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item location"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
      <input
        v-model="displayPrice"
        type="text"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item price"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Shop Fee %</label>
      <input
        v-model.number="newItem.feePercent"
        type="number"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        min="0"
        step="0.1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
      <input
        v-model.number="newItem.quantity"
        type="number"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        min="1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">SKU Codes</label>
      <input
        v-model="skuInput"
        type="text"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="ABC123, ABC124"
      >
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Image <span class="text-red-500">*</span>
      </label>
      <input
        type="file"
        accept="image/*"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        required
        @change="onFileChange"
      >
      <div
        v-if="previewUrl"
        class="mt-2"
      >
        <img
          :src="previewUrl"
          alt="Preview"
          class="mt-2 rounded max-w-full max-h-40 object-contain"
        >
        <button
          class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          @click="editImage"
        >
          Edit Image
        </button>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Item Details</label>
      <textarea
        v-model="newItem.details"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
        rows="3"
        placeholder="Enter item details"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        v-model="newItem.status"
        class="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 mb-4"
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

    <div class="flex gap-3 mt-4">
      <button
        class="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition disabled:opacity-50"
        :disabled="!isFormValid || loading"
        @click="handleSubmit"
      >
        Save Item
      </button>
      <button
        class="w-full bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>
    <div
      v-if="loading"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
    </div>
    <ImageCropper
      :src="cropperSrc"
      :visible="showCropper"
      @cropped="onCropped"
      @cancel="showCropper = false"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, computed, watch } from 'vue';
import ImageCropper from './ImageCropper.vue';
import { statusOptions } from '../types/item';
import type { Item } from '../types/item';
import { mapRecordToItem } from '../types/item';
import { supabase } from '../supabaseClient';

const emit = defineEmits<{
  'item-added': [Item]
  cancel: []
}>()

const newItem = ref({
  name: '',
  details: '',
  status: 'not_sold' as const,
  location: '',
  price: '',
  feePercent: 20,
  quantity: 1,
  skuCodes: [] as string[]
});

const loading = ref(false);

const displayPrice = computed({
  get: () => (newItem.value.price ? `$${newItem.value.price}` : ''),
  set: (val: string) => {
    const numeric = val.replace(/[^0-9.]/g, '');
    newItem.value.price = numeric;
  }
});
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const skuInput = ref('');
const showCropper = ref(false);
const cropperSrc = ref('');

watch(skuInput, val => {
  newItem.value.skuCodes = val.split(',').map(v => v.trim()).filter(Boolean);
});

const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() &&
    newItem.value.details.trim() &&
    selectedFile.value &&
    newItem.value.location.trim() &&
    newItem.value.price.trim() &&
    newItem.value.feePercent >= 0 &&
    newItem.value.quantity > 0
  );
});

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    cropperSrc.value = URL.createObjectURL(files[0]);
    showCropper.value = true;
  }
}

function editImage() {
  if (previewUrl.value) {
    cropperSrc.value = previewUrl.value;
    showCropper.value = true;
  }
}

function onCropped(file: File) {
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  showCropper.value = false;
}

const handleSubmit = async () => {
  if (!isFormValid.value || !selectedFile.value) return;

  loading.value = true;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const fileExt = selectedFile.value.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;
    const { error: imageError } = await supabase.storage
      .from('images')
      .upload(filePath, selectedFile.value);

    if (imageError) throw imageError;

    const imageUrl = supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl;

  const { data: inserted, error: insertError } = await supabase
    .from('items')
    .insert([
      {
        user_id: user?.id,
        name: newItem.value.name,
        details: newItem.value.details,
        quantity: newItem.value.quantity,
        sku_codes: newItem.value.skuCodes,
        status: newItem.value.status,
        location: newItem.value.location,
        price: newItem.value.price,
        fee_percent: newItem.value.feePercent,
        image_url: imageUrl,
        date_added: new Date().toISOString(),
        tags: []
      }
    ])
    .select()
    .single();

  if (insertError) throw insertError;

  const item: Item = mapRecordToItem(inserted);

  emit('item-added', item);
    newItem.value = {
      name: '',
      details: '',
      status: 'not_sold',
      location: '',
      price: '',
      feePercent: 20,
      quantity: 1,
      skuCodes: []
    };
    selectedFile.value = null;
    previewUrl.value = '';
    skuInput.value = '';
  } catch (err: any) {
    console.error(err);
    alert('❌ Error saving item: ' + err.message);
  } finally {
    loading.value = false;
  }
};
</script>

