<template>
  <div>
    <router-view />
    <div
      v-if="showLanding"
      class="fixed inset-0 flex items-center justify-center bg-black z-50"
      style="position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background-color:#000; z-index:50;"
    >
      <img
        src="/Uglygif.gif.GIF"
        alt="Intro animation"
        class="w-full h-auto max-w-[640px] max-h-[854px] object-contain"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showLanding = ref(true);

onMounted(() => {
  setTimeout(() => {
    showLanding.value = false;
  }, 5000);
});
</script>
