<template>
  <div>
    <router-view />
    <div
      v-if="showLanding"
      class="fixed inset-0 flex items-center justify-center bg-black z-50"
    >
      <img
        src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//1749825362414.png"
        alt="Landing"
        class="w-48 h-48 animate-ping"
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
  }, 3000);
});
</script>
