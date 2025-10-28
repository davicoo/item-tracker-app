<template>
  <div class="relative w-full max-w-2xl rounded-3xl border border-primary-100 bg-gradient-to-br from-white/98 via-primary-50/85 to-white/98 px-6 py-8 shadow-2xl shadow-primary-900/20 backdrop-blur-2xl ring-1 ring-white/70 sm:px-10 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <div class="flex flex-col gap-2 border-b border-primary-100/70 pb-6">
      <span class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Update Inventory</span>
      <h2 class="text-2xl font-semibold text-title text-primary-900">
        Edit Item
      </h2>
      <p class="text-sm text-primary-600">
        Adjust stock levels, pricing, and sale history to keep your catalog accurate.
      </p>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">Item Name</span>
        <input
          v-model="form.name"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="Enter item name"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Location</span>
        <input
          v-model="form.location"
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
          v-model.number="form.feePercent"
          type="number"

          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
          step="0.1"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Quantity</span>
        <input
          v-model.number="form.quantity"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="1"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Restock Alert Level</span>
        <input
          id="edit_min_quantity"
          v-model.number="form.minQuantity"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
        >
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Past Sales</span>
        <input
          v-model.number="form.pastSales"
          type="number"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          min="0"
        >
      </label>

      <div class="sm:col-span-2">
        <span class="block text-sm font-medium text-primary-800">Sale Dates</span>
        <div
          v-for="(d, idx) in form.saleDates"
          :key="idx"
          class="mt-2 flex flex-col gap-3 rounded-card border border-primary-100 bg-white/90 p-3 shadow-inner shadow-primary-900/5 sm:flex-row sm:items-center"
        >
          <DatePicker
            v-model="form.saleDates[idx]"
            class="flex-1"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-danger-50 px-4 py-2 text-sm font-semibold text-danger-600 transition hover:bg-danger-100"
            @click="removeSaleDate(idx)"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/90 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm shadow-primary-900/10 transition hover:bg-primary-50/80"
          @click="addSaleDate"
        >
          Add Sale Date
        </button>
      </div>

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

      <label class="flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Date Added</span>
        <DatePicker
          v-model="form.dateAdded"
          placeholder="Select day"
        />
      </label>

      <div class="sm:col-span-2">
        <label class="flex flex-col gap-2 text-sm text-primary-600">
          <span class="font-medium text-primary-800">Image</span>
          <input
            type="file"
            accept="image/*"
            class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
          v-model="form.details"
          class="min-h-24 rounded-2xl border border-primary-100 bg-white/90 px-4 py-3 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          rows="3"
          placeholder="Enter item details"
        />
      </label>

      <label class="flex flex-col gap-2 text-sm text-primary-600 sm:col-span-2">
        <span class="font-medium text-primary-800">Status</span>
        <select
          v-model="form.status"
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

      <div class="sm:col-span-2">
        <span class="block text-sm font-medium text-primary-800">Tags</span>
        <div class="mt-2 flex flex-wrap gap-2">
          <template v-if="form.tags.length">
            <span
              v-for="(tag, idx) in form.tags"
              :key="idx"
              class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm shadow-primary-900/10"
            >
              {{ tag }}
              <button
                type="button"
                class="text-primary-500 transition hover:text-danger-500"
                @click="removeTag(idx)"
              >
                ✕
              </button>
            </span>
          </template>
          <span
            v-else
            class="rounded-full bg-white/90 px-3 py-1 text-xs text-primary-500"
          >
            No tags added yet.
          </span>
        </div>
        <input
          v-model="tagInput"
          type="text"
          class="mt-3 rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          placeholder="Add tag and press Enter"
          @keyup.enter.prevent="addTag"
        >
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        class="cta-gradient cta-gradient-md flex-1"
        :disabled="loading"
        @click="handleSubmit"
      >
        Update Item
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
import { ref, watch, computed, onMounted } from 'vue';
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
  minQuantity: props.item.minQuantity,
  skuCodes: [...(props.item.skuCodes || [])],
  dateAdded: props.item.dateAdded.slice(0, 10),
  pastSales: props.item.pastSales,
  saleDates: props.item.saleDates.map(d => d.slice(0, 10)),
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
      minQuantity: val.minQuantity,
      skuCodes: [...(val.skuCodes || [])],
      dateAdded: val.dateAdded.slice(0, 10),
      pastSales: val.pastSales,
      saleDates: val.saleDates.map(d => d.slice(0, 10)),
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

function addSaleDate() {
  form.value.saleDates.push(new Date().toISOString().slice(0, 10));
}

function removeSaleDate(index: number) {
  form.value.saleDates.splice(index, 1);
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

    const saleDatesISO: string[] = [];
    for (const d of form.value.saleDates) {
      const iso = toISODate(d);
      if (!iso) {
        alert('❌ Invalid sale date. Please select valid dates.');
        return;
      }
      saleDatesISO.push(iso);
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
        min_quantity: form.value.minQuantity,
        sku_codes: form.value.skuCodes,
        fee_percent: form.value.feePercent,
        image_url: imageUrl,
        date_added: dateISO,
        tags: form.value.tags,
        past_sales: form.value.pastSales,
        sold_dates: saleDatesISO
      })
      .eq('id', props.item.id)
      .select()
      .single();

    if (error) throw error;

    const item: Item = mapRecordToItem(updated);

    emit('item-updated', item);
  } catch (err: unknown) {
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
