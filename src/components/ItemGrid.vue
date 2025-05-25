<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <!-- ImageKit Context for displaying images -->
    <IKContext
      :publicKey="imageKitConfig.publicKey"
      :urlEndpoint="imageKitConfig.urlEndpoint"
      :transformationPosition="imageKitConfig.transformationPosition"
    >
      <!-- Use ImageKit Image component -->
      <IKImage 
        :path="item.imageUrl"
        :transformation="[{ height: '192', width: '400', crop: 'maintain_ratio' }]"
        :alt="item.name"
        class="w-full h-48 object-cover rounded mb-4"
      />
    </IKContext>

    <h2 class="text-xl font-semibold mb-1">{{ item.name }}</h2>
    <p class="text-gray-600 mb-4">{{ item.details }}</p>

    <div class="flex justify-between items-center">
      <!-- Status badge -->
      <span
        class="px-3 py-1 text-sm font-medium rounded-full"
        :class="{
          'bg-green-100 text-green-800': item.status === 'sold_paid',
          'bg-yellow-100 text-yellow-800': item.status === 'sold',
          'bg-gray-100 text-gray-700': item.status === 'not_sold'
        }"
      >
        {{ formatStatus(item.status) }}
      </span>

      <!-- Controls -->
      <div class="flex items-center space-x-2">
        <select
          v-model="selectedStatus"
          @change="onStatusChange"
          class="border rounded px-3 py-1 text-sm focus:outline-none"
        >
          <option value="not_sold">Not Sold</option>
          <option value="sold">Sold</option>
          <option value="sold_paid">Sold & Paid</option>
        </select>
        <button
          @click="onDelete"
          class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { IKContext, IKImage } from 'imagekitio-vue';
import type { PropType } from 'vue';
import type { Item } from '../types/item';

export default defineComponent({
  name: 'ItemCard',
  components: {
    IKContext,
    IKImage
  },
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  emits: ['update-status', 'delete-item'],
  setup(props, { emit }) {
    // ImageKit configuration (same as in ItemForm)
    const imageKitConfig = {
      publicKey: "public_BLo55sPu94p4/MUy7mHgfDdvOg8=", // Replace with your public key
      urlEndpoint: "https://ik.imagekit.io/mydwcapp", // Replace with your URL endpoint
      transformationPosition: "path"
    };

    const selectedStatus = ref(props.item.status);

    const onStatusChange = () => {
      emit('update-status', props.item.id, selectedStatus.value);
    };

    const onDelete = () => {
      emit('delete-item', props.item.id);
    };

    const formatStatus = (status: Item['status']) => {
      switch (status) {
        case 'not_sold':
          return 'Not Sold';
        case 'sold':
          return 'Sold';
        case 'sold_paid':
          return 'Sold & Paid';
        default:
          return 'Unknown';
      }
    };

    // Sync status if updated externally
    watch(() => props.item.status, (newVal) => {
      selectedStatus.value = newVal;
    });

    return {
      imageKitConfig,
      selectedStatus,
      formatStatus,
      onStatusChange,
      onDelete
    };
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>