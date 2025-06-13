<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">
      Edit Item
    </h2>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Item Name</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item name"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Location</label>
      <input
        v-model="form.location"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item location"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Price</label>
      <input
        v-model="form.price"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item price"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Image</label>
      <input
        type="file"
        accept="image/*"
        class="w-full px-3 py-2 border border-gray-300 rounded"
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
        v-model="form.details"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        rows="3"
        placeholder="Enter item details"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Status</label>
      <select
        v-model="form.status"
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
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        @click="handleSubmit"
      >
        Update Item
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
import { ref, watch } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';
import { supabase } from '../supabaseClient';

const props = defineProps<{ item: Item }>();

const emit = defineEmits<{ 'item-updated': [Item]; cancel: [] }>();

const form = ref({
  name: props.item.name,
  details: props.item.details,
  status: props.item.status,
  location: props.item.location,
  price: props.item.price,
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>(props.item.imageUrl);

watch(
  () => props.item,
  (val) => {
    form.value = {
      name: val.name,
      details: val.details,
      status: val.status,
      location: val.location,
      price: val.price,
    };
    previewUrl.value = val.imageUrl;
    selectedFile.value = null;
  }
);

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    selectedFile.value = files[0];
    previewUrl.value = URL.createObjectURL(files[0]);
  }
}

async function handleSubmit() {
  try {
    let imageUrl = props.item.imageUrl;
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: imageError } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile.value);
      if (imageError) throw imageError;
      imageUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
    }

    const { data: updated, error } = await supabase
      .from('items')
      .update({
        name: form.value.name,
        details: form.value.details,
        status: form.value.status,
        location: form.value.location,
        price: form.value.price,
        image_url: imageUrl,
      })
      .eq('id', props.item.id)
      .select()
      .single();

    if (error) throw error;

    const item: Item = {
      id: updated.id,
      name: updated.name,
      imageUrl: updated.image_url ?? '',
      details: updated.details,
      status: updated.status,
      dateAdded: updated.date_added,
      location: updated.location,
      price: updated.price,
    };

    emit('item-updated', item);
  } catch (err: any) {
    console.error(err);
    alert('❌ Error updating item: ' + err.message);
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
