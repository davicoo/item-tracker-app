<template>
  <div class="relative min-h-screen bg-white text-center flex flex-col items-center justify-center px-6">
    <header class="absolute top-0 left-0 w-full flex justify-between items-center p-4">
      <div class="text-2xl font-bold">
        ConsignEasy
      </div>
      <div class="space-x-4">
        <button class="text-sm font-medium text-gray-600">
          Login
        </button>
        <button class="text-sm font-medium border border-purple-500 text-purple-500 px-4 py-1 rounded">
          Sign Up
        </button>
      </div>
    </header>

    <main class="z-20 mt-20">
      <h1 class="text-4xl md:text-6xl font-extrabold mb-4">
        Track, Sell,<br>and Succeed.
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-6">
        Manage your consignment items all in one place.
      </p>
      <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg">
        Get Started
      </button>
      <p class="mt-2 text-sm text-gray-400">
        Free to try. No credit card required.
      </p>
    </main>

    <AnimatedBlob />
  </div>
</template>

<script setup>
import AnimatedBlob from '@/components/AnimatedBlob.vue'
</script>
