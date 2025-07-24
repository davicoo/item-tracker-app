<template>
  <div>
    <router-view v-if="loggedIn" />
    <LoginForm v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from './supabaseClient';
import LoginForm from './components/LoginForm.vue';

const loggedIn = ref(false);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  loggedIn.value = !!data.session;
  document.body.style.backgroundColor = loggedIn.value ? '#f3f4f6' : 'rgb(22,23,72)';
});

watch(loggedIn, (isLoggedIn) => {
  document.body.style.backgroundColor = isLoggedIn ? '#f3f4f6' : 'rgb(22,23,72)';
});

supabase.auth.onAuthStateChange((_event, session) => {
  loggedIn.value = !!session;
});
</script>
