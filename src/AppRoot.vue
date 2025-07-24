<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { supabase } from './supabaseClient';

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  document.body.style.backgroundColor = data.session ? '#f3f4f6' : 'rgb(22,23,72)';
});

supabase.auth.onAuthStateChange((_event, session) => {
  document.body.style.backgroundColor = session ? '#f3f4f6' : 'rgb(22,23,72)';
});
</script>
