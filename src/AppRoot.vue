<template>
  <div>
    <router-view v-if="loggedIn" />
    <LoginForm v-else-if="!showLanding" />
    <div
      v-if="showLanding"
      class="fixed inset-0 flex items-center justify-center bg-black z-50"
      style="position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background-color:#000; z-index:50;"
    >
      <video autoplay playsinline muted
        src="/appintrovid.mp4"
        class="w-full h-auto max-w-[640px] max-h-[854px] object-contain" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from './supabaseClient';
import LoginForm from './components/LoginForm.vue';

const showLanding = ref(true);
const loggedIn = ref(false);

onMounted(async () => {
  setTimeout(() => {
    showLanding.value = false;
    document.body.style.backgroundColor = '#f3f4f6';
  }, 5000);
  const { data } = await supabase.auth.getSession();
  loggedIn.value = !!data.session;
});

supabase.auth.onAuthStateChange((_event, session) => {
  loggedIn.value = !!session;
});
</script>
