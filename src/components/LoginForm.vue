<template>
  <div class="max-w-sm mx-auto mt-12 p-4 bg-white rounded shadow">
    <h2 class="text-2xl font-bold mb-4 text-center">
      Login
    </h2>
    <form
      class="space-y-3"
      @submit.prevent="handleLogin"
    >
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="border w-full px-3 py-2 rounded"
      >
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="border w-full px-3 py-2 rounded"
      >
      <div class="flex justify-between items-center">
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
        <button
          type="button"
          class="text-blue-500"
          @click="handleSignup"
        >
          Sign Up
        </button>
      </div>
      <p
        v-if="error"
        class="text-red-500 text-sm"
      >
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../supabaseClient';

const email = ref('');
const password = ref('');
const error = ref('');

async function handleLogin() {
  error.value = '';
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (err) error.value = err.message;
}

async function handleSignup() {
  error.value = '';
  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  if (err) error.value = err.message;
}
</script>

<style scoped>
/* basic styling */
</style>
