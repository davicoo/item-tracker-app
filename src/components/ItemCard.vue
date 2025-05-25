<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- ImageKit Context for displaying images -->
    <IKContext
      :publicKey="imageKitConfig.publicKey"
      :urlEndpoint="imageKitConfig.urlEndpoint"
      :transformationPosition="imageKitConfig.transformationPosition"
    >
      <!-- Use ImageKit Image component or fallback to regular img -->
      <IKImage 
        v-if="item.imageUrl.startsWith('/')"
        :path="item.imageUrl"
        :transformation="[{ height: '192', width: '400', crop: 'maintain_ratio' }]"
        :alt="item.name"
        class="w-full h-48 object-cover"
      />
      <img 
        v-else
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-48 object-cover"
      />
    </IKContext>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">{{ item.name }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ item.details }}</p>
      
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status:</label>
        <select
          :value="item.status"
          @change="handleStatusChange"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
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
      
      <div class="flex justify-between items-center">
        <span 
          class="px-2 py-1 rounded text-xs font-medium"
          :class="statusColor"
        >
          {{ statusLabel }}
        </span>
        
        <button
          @click="handleDelete"
          class="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { IKContext, IKImage } from 'imagekitio-vue';
import type { PropType } from 'vue';
import type { Item } from '../types/item';
import { statusOptions } from '../types/item';

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
    // ImageKit configuration - make sure this is defined first
    const imageKitConfig = {
      publicKey: "public_BLo55sPu94p4/MUy7mHgfDdvOg8=", // Replace with your actual key
      urlEndpoint: "https://ik.imagekit.io/mydwcapp", // Replace with your actual endpoint
      transformationPosition: "path"
    };

    const handleStatusChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit('update-status', props.item.id, target.value as "not_sold" | "sold" | "sold_paid");
    };
    
    const handleDelete = () => {
      emit('delete-item', props.item.id);
    };
    
    const statusLabel = computed(() => {
      const option = statusOptions.find(opt => opt.value === props.item.status);
      return option?.label || 'Unknown';
    });
    
    const statusColor = computed(() => {
      switch (props.item.status) {
        case 'not_sold':
          return 'bg-red-100 text-red-800';
        case 'sold':
          return 'bg-yellow-100 text-yellow-800';
        case 'sold_paid':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    });
    
    // Make sure to return imageKitConfig
    return {
      imageKitConfig,
      statusOptions,
      handleStatusChange,
      handleDelete,
      statusLabel,
      statusColor
    };
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>