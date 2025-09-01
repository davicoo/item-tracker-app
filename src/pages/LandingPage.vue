<template>
  <div class="relative min-h-screen flex flex-col items-start justify-center px-10 md:px-24">
    <header class="absolute top-0 left-0 w-full flex justify-between items-center py-4 px-6 md:px-24">
      <div class="flex items-center space-x-2 text-2xl font-bold leading-tight">
        <img
          src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//uglysmall.png"
          alt="logo"
          class="h-[3.5rem] w-auto object-contain"
          @error="(e) => (e.target as HTMLImageElement).src = '/ugly_192px.png'"
        >
        <div>
          ConsignTracker
          <span class="block text-sm font-normal">by UglyStuff.ca</span>
        </div>
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

    <main class="z-20 mt-20 text-left max-w-lg">
      <h1 class="text-[2.475rem] md:text-[4.125rem] font-extrabold mb-4">
        Track, Sell,<br>and Succeed.
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-6">
        Manage your consignment items all in one place.
      </p>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg flex items-center"
        @click="handleGetStarted"
      >
        <span>Get Started</span>
        <svg
          class="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
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
