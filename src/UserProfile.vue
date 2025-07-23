<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="max-w-screen-xl mx-auto p-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <router-link
          to="/"
          class="text-blue-600 hover:underline"
        >
          &larr; Back
        </router-link>
        <h1 class="text-2xl font-bold">
          User Profile
        </h1>
        <span />
      </div>

      <div class="bg-white rounded shadow p-4">
        <p class="text-gray-600">
          User information will appear here in the future.
        </p>
      </div>

      <div class="mt-auto text-right">
        <button
          class="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 active:scale-95 transition"
          @click="signOut"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signOut } from './utils/auth'
</script>

<style scoped>
</style>
