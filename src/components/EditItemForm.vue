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
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item name"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Location</label>
      <input
        v-model="form.location"
        type="text"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item location"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Price</label>
      <input
        v-model="displayPrice"
        type="text"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Enter item price"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Shop Fee %</label>
      <input
        v-model.number="form.feePercent"
        type="number"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        min="0"
        step="0.1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Quantity</label>
      <input
        v-model.number="form.quantity"
        type="number"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        min="1"
      >
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">SKU Codes</label>
      <input
        v-model="skuInput"
        type="text"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="ABC123, ABC124"
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
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
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
      <label class="block text-gray-700 font-medium mb-2">Item Details</label>
      <textarea
        v-model="form.details"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        rows="3"
        placeholder="Enter item details"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-medium mb-2">Status</label>
      <select
        v-model="form.status"
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
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
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Add tag and press Enter"
        @keyup.enter.prevent="addTag"
      >
    </div>

    <div class="flex space-x-2">
      <button
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        :disabled="loading"
        @click="handleSubmit"
      >
        Update Item
      </button>
      <button
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium"
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
import { ref, watch, computed } from 'vue';
import ImageCropper from './ImageCropper.vue';
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
  quantity: props.item.quantity,
  skuCodes: [...(props.item.skuCodes || [])],
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
const skuInput = ref(form.value.skuCodes.join(', '));
const showCropper = ref(false);
const cropperSrc = ref('');
const loading = ref(false);

watch(skuInput, val => {
  form.value.skuCodes = val.split(',').map(v => v.trim()).filter(Boolean);
});

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
      quantity: val.quantity,
      skuCodes: [...(val.skuCodes || [])],
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

function toISODate(input: string): string | null {
  // Replace dots, forward slashes and backslashes with dashes
  const normalized = input.replace(/[./\\]/g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = new Date(`${normalized}T00:00:00.000Z`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return null;
}

async function handleSubmit() {
  loading.value = true;
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

    const dateISO = toISODate(form.value.dateAdded);
    if (!dateISO) {
      alert('❌ Invalid date. Please select a valid date.');
      return;
    }

    const { data: updated, error } = await supabase
      .from('items')
      .update({
        name: form.value.name,
        details: form.value.details,
        status: form.value.status,
        location: form.value.location,
        price: form.value.price,
        quantity: form.value.quantity,
        sku_codes: form.value.skuCodes,
        fee_percent: form.value.feePercent,
        image_url: imageUrl,
        date_added: dateISO,
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
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

