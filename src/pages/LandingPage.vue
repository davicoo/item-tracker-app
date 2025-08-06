<template>
  <div class="relative min-h-screen flex flex-col items-start justify-center px-6">
    <header class="absolute top-0 left-0 w-full flex justify-between items-center p-4">
      <div class="text-2xl font-bold leading-tight">
        ConsignTracker
        <span class="block text-sm font-normal">by UglyStuff.ca</span>
      </div>
      <div class="space-x-4">
        <button
          class="text-sm font-medium text-gray-600"
          @click="goLogin"
        >
          Login
        </button>
        <button
          class="text-sm font-medium border border-purple-500 text-purple-500 px-4 py-1 rounded"
          @click="goSignup"
        >
          Sign Up
        </button>
      </div>
    </header>

    <main class="z-20 mt-20 text-left">
      <h1 class="text-[2.475rem] md:text-[4.125rem] font-extrabold mb-4">
        Track, Sell,<br>and Succeed.
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-6">
        Manage your consignment items all in one place.
      </p>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg"
        @click="handleGetStarted"
      >
        Get Started
      </button>
      <p class="mt-2 text-sm text-gray-400">
        Free to try. No credit card required.
      </p>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goLogin() {
  router.push('/login')
}

function goSignup() {
  router.push('/signup')
}

function handleGetStarted() {
  if (document.cookie.includes('returningUser=true')) {
    router.push('/login')
  } else {
    router.push('/signup')
  }
}
</script>
