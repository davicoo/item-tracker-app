<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">
      Add New Item
    </h2>
    
    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Item Name</label>
      <input
        v-model="newItem.name"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item name"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Location</label>
      <input
        v-model="newItem.location"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item location"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Price</label>
      <input
        v-model="displayPrice"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item price"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Shop Fee %</label>
      <input
        v-model.number="newItem.feePercent"
        type="number"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        min="0"
        step="0.1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">
        Image <span class="text-red-500">*</span>
      </label>
      <input
        type="file"
        accept="image/*"
        class="w-full px-3 py-2 border border-gray-300 rounded"
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
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Item Details</label>
      <textarea
        v-model="newItem.details"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        rows="3"
        placeholder="Enter item details"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Status</label>
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
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        Save Item
      </button>
      <button
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, computed } from 'vue';
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
  feePercent: 20
});

const displayPrice = computed({
  get: () => (newItem.value.price ? `$${newItem.value.price}` : ''),
  set: (val: string) => {
    const numeric = val.replace(/[^0-9.]/g, '');
    newItem.value.price = numeric;
  }
});
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');

const isFormValid = computed(() => {
  return !!(
    newItem.value.name.trim() &&
    newItem.value.details.trim() &&
    selectedFile.value &&
    newItem.value.location.trim() &&
    newItem.value.price.trim() &&
    newItem.value.feePercent >= 0
  );
});

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    selectedFile.value = files[0];
    previewUrl.value = URL.createObjectURL(files[0]);
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !selectedFile.value) return;

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
      feePercent: 20
    };
    selectedFile.value = null;
    previewUrl.value = '';
  } catch (err: any) {
    console.error(err);
    alert('❌ Error saving item: ' + err.message);
  }
};
</script>
