<template>
  <div
    class="fixed inset-0 z-[1600] flex items-center justify-center bg-black bg-opacity-75"
    @click.self="emit('close')"
  >
    <div class="relative">
      <button
        class="absolute top-0 right-0 m-2 text-white text-2xl"
        @click="emit('close')"
      >
        &times;
      </button>
      <img
        :src="src"
        alt="Full Image"
        class="max-h-screen max-w-screen object-contain"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ src: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<style scoped>
/* Add any viewer-specific styles if needed */
</style>
