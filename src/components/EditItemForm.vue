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
        v-model="displayPrice"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Enter item price"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Shop Fee %</label>
      <input
        v-model.number="form.feePercent"
        type="number"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        min="0"
        step="0.1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Date Added</label>
      <DatePicker
        v-model="form.dateAdded"
        placeholder="Select day"
      />
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

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Tags</label>
      <div class="flex flex-wrap mb-2">
        <span
          v-for="(tag, idx) in form.tags"
          :key="idx"
          class="bg-gray-200 rounded-full px-2 py-1 text-sm mr-2 mb-2 flex items-center"
        >
          {{ tag }}
          <button
            class="ml-1 text-red-500"
            @click="removeTag(idx)"
          >
            ✕
          </button>
        </span>
      </div>
      <input
        v-model="tagInput"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Add tag and press Enter"
        @keyup.enter.prevent="addTag"
      >
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
import { ref, watch, computed } from 'vue';
import DatePicker from './DatePicker.vue';
import type { Item } from '../types/item';
import { statusOptions, mapRecordToItem } from '../types/item';
import { supabase } from '../supabaseClient';

const props = defineProps<{ item: Item }>();

const emit = defineEmits<{ 'item-updated': [Item]; cancel: [] }>();

const form = ref({
  name: props.item.name,
  details: props.item.details,
  status: props.item.status,
  location: props.item.location,
  price: props.item.price,
  feePercent: props.item.feePercent ?? 20,
  dateAdded: props.item.dateAdded.slice(0, 10),
  tags: [...(props.item.tags || [])]
});

const displayPrice = computed({
  get: () => (form.value.price ? `$${form.value.price}` : ''),
  set: (val: string) => {
    const numeric = val.replace(/[^0-9.]/g, '');
    form.value.price = numeric;
  }
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>(props.item.imageUrl);
const tagInput = ref('');

watch(
  () => props.item,
  (val) => {
    form.value = {
      name: val.name,
      details: val.details,
      status: val.status,
      location: val.location,
      price: val.price,
      feePercent: val.feePercent ?? 20,
      dateAdded: val.dateAdded.slice(0, 10),
      tags: [...(val.tags || [])]
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

function addTag() {
  const val = tagInput.value.trim();
  if (val && !form.value.tags.includes(val)) {
    form.value.tags.push(val);
  }
  tagInput.value = '';
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1);
}

function toISODate(input: string): string {
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  const parts = input.split(/[./-]/);
  if (parts.length === 3) {
    let year = parts[0];
    let month = parts[1];
    let day = parts[2];
    if (year.length !== 4) {
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
    const iso = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    if (!isNaN(iso.getTime())) {
      return iso.toISOString();
    }
  }
  return new Date().toISOString();
}

async function handleSubmit() {
  try {
    let imageUrl = props.item.imageUrl;
    if (selectedFile.value) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const fileExt = selectedFile.value.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error: imageError } = await supabase.storage
        .from('images')
        .upload(filePath, selectedFile.value);
      if (imageError) throw imageError;
      imageUrl = supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl;
    }

    const { data: updated, error } = await supabase
      .from('items')
      .update({
        name: form.value.name,
        details: form.value.details,
        status: form.value.status,
        location: form.value.location,
        price: form.value.price,
        fee_percent: form.value.feePercent,
        image_url: imageUrl,
        date_added: toISODate(form.value.dateAdded),
        tags: form.value.tags
      })
      .eq('id', props.item.id)
      .select()
      .single();

    if (error) throw error;

    const item: Item = mapRecordToItem(updated);

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
