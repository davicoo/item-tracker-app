<template>
  <div class="flex items-center justify-center h-screen bg-gray-800">
    <img
      src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//1749825362414.png"
      alt="Landing"
      class="w-48 h-48 animate-ping"
      @load="startTimer"
    >
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

function startTimer() {
  setTimeout(() => {
    router.push('/app');
  }, 3000);
}

onMounted(() => {
  // In case image cached and load event already fired
  startTimer();
});
</script>

<style scoped>
</style>
