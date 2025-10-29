<template>
  <div class="relative w-full max-w-2xl rounded-3xl border border-primary-100 bg-gradient-to-br from-white/98 via-primary-50/85 to-white/98 px-6 py-8 shadow-2xl shadow-primary-900/20 backdrop-blur-2xl ring-1 ring-white/70 sm:px-10 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <div class="flex flex-col gap-2 border-b border-primary-100/70 pb-6">
      <span class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">New Inventory</span>
      <h2 class="text-2xl font-semibold text-title text-primary-900">
        Add New Item
      </h2>
      <p class="text-sm text-primary-600">
        Provide location, pricing, and inventory details so the item is ready to track right away.
      </p>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">Item Name</span>
        <input
          v-model="newItem.name"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="Enter item name"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Location</span>
        <input
          v-model="newItem.location"
          list="storeOptionsList"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="Enter item location"
        >
        <datalist id="storeOptionsList">
          <option
            v-for="store in storeOptions"
            :key="store"
            :value="store"
          />
        </datalist>
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Price</span>
        <input
          v-model="displayPrice"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="Enter item price"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Shop Fee %</span>
        <input
          v-model.number="newItem.feePercent"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
          step="0.1"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Quantity</span>
        <input
          v-model.number="newItem.quantity"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="1"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Restock Alert Level</span>
        <input
          id="min_quantity"
          v-model.number="newItem.minQuantity"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Past Sales</span>
        <input
          v-model.number="newItem.pastSales"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">SKU Codes</span>
        <input
          v-model="skuInput"
          list="skuOptionsList"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="ABC123, ABC124"
        >
        <datalist id="skuOptionsList">
          <option
            v-for="sku in skuOptions"
            :key="sku"
            :value="sku"
          />
        </datalist>
      </label>

      <div class="sm:col-span-2">
        <label class="flex flex-col gap-2 text-sm text-primary-600">
          <span class="font-medium text-primary-800">
            Image <span class="text-danger-500">*</span>
          </span>
          <input
            type="file"
            accept="image/*"
            class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            required
            @change="onFileChange"
          >
        </label>
        <div
          v-if="previewUrl"
          class="mt-3 rounded-card border border-primary-100 bg-white/90 p-3 shadow-inner shadow-primary-900/5"
        >
          <img
            :src="previewUrl"
            alt="Preview"
            class="max-h-48 w-full rounded-card object-contain"
          >
          <button
            class="mt-3 cta-gradient cta-gradient-sm"
            @click="editImage"
          >
            Edit Image
          </button>
        </div>
      </div>

      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">Item Details</span>
        <textarea
          v-model="newItem.details"
          class="min-h-24 rounded-2xl border border-primary-100 bg-white/90 px-4 py-3 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          rows="3"
          placeholder="Enter item details"
        />
      </label>
      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">Status</span>
        <select
          v-model="newItem.status"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        class="cta-gradient cta-gradient-md flex-1"
        :disabled="!isFormValid || loading"
        @click="handleSubmit"
      >
        Save Item
      </button>
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-primary-100 bg-white/90 px-6 py-3 text-sm font-semibold text-primary-700 shadow-md shadow-primary-900/10 transition hover:bg-primary-50/80 disabled:opacity-60"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>

    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[--overlay-bg]"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-white/80 border-t-transparent" />
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
import { ref, computed, watch, onMounted } from 'vue';
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
  minQuantity: 0,
  skuCodes: [] as string[],
  soldCounts: {} as Record<string, number>,
  pastSales: 0,
  saleDates: [] as string[]
});

const loading = ref(false);

const storeOptions = ref<string[]>([]);
const skuOptions = ref<string[]>([]);

onMounted(async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  const { data } = await supabase
    .from('profiles')
    .select('store_types, sku_options')
    .eq('id', user.id)
    .maybeSingle();
  storeOptions.value = (data?.store_types as string[] | null) || [];
  skuOptions.value = (data?.sku_options as string[] | null) || [];
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
    newItem.value.quantity > 0 &&
    newItem.value.minQuantity >= 0
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
        min_quantity: newItem.value.minQuantity,
        sku_codes: newItem.value.skuCodes,
        status: newItem.value.status,
        location: newItem.value.location,
        price: newItem.value.price,
        fee_percent: newItem.value.feePercent,
        image_url: imageUrl,
        date_added: new Date().toISOString(),
        tags: [],
        sold_counts: newItem.value.soldCounts,
        past_sales: newItem.value.pastSales,
        sold_dates: newItem.value.saleDates
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
      minQuantity: 0,
      skuCodes: [],
      soldCounts: {},
      pastSales: 0,
      saleDates: []
    };
    selectedFile.value = null;
    previewUrl.value = '';
    skuInput.value = '';
  } catch (err: unknown) {
    console.error(err);
    alert('❌ Error saving item: ' + err.message);
  } finally {
    loading.value = false;
  }
};
</script>

