<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
  >
    <div class="bg-white p-4 rounded shadow-lg">
      <VueCropper
        ref="cropper"
        :src="src"
        :aspect-ratio="1"
        :view-mode="1"
        :auto-crop-area="1"
        :responsive="true"
        :check-orientation="false"
        cross-origin="anonymous"
        style="height: 300px; width: 300px;"
      />
      <div class="mt-4 flex justify-end space-x-2">
        <button
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          @click="cropImage"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

defineProps<{ src: string; visible: boolean }>();
const emit = defineEmits<{ cropped: [File]; cancel: [] }>();

const cropper = ref<any>(null);

function cropImage() {
  const canvas = cropper.value?.getCroppedCanvas();
  if (!canvas) return;
  canvas.toBlob((blob: Blob | null) => {
    if (blob) {
      const file = new File([blob], 'cropped.png', { type: blob.type });
      emit('cropped', file);
    }
  });
}
</script>

