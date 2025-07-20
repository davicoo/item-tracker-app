<template>
  <div class="max-w-sm mx-auto mt-12 p-4 bg-white rounded shadow">
    <div class="flex flex-col items-center mb-4">
      <img
        src="https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//1749825362414.png"
        alt="Artwork Tracker logo"
        class="w-24 h-24 mb-2"
      >
      <h2 class="text-2xl font-bold text-center">
        Artwork Tracker
      </h2>
    </div>
    <h2 class="text-xl font-semibold mb-4 text-center">
      {{ isSignup ? 'Sign Up' : 'Login' }}
    </h2>
    <form
      class="space-y-3"
      @submit.prevent="isSignup ? handleSignup() : handleLogin()"
    >
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
      >
      <div>
        <input
          id="hs-login-password"
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        >
        <div class="flex items-center mt-2">
          <input
            id="hs-login-toggle"
            type="checkbox"
            data-hs-toggle-password="{&quot;target&quot;: &quot;#hs-login-password&quot;}"
            class="shrink-0 mr-2 border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500"
          >
          <label
            for="hs-login-toggle"
            class="text-sm text-gray-500"
          >Show password</label>
        </div>
      </div>
      <vue-hcaptcha
        ref="captcha"
        :sitekey="siteKey"
        @verify="onVerify"
      />
      <div class="flex justify-between items-center">
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {{ isSignup ? 'Sign Up' : 'Login' }}
        </button>
        <button
          type="button"
          class="text-blue-500"
          @click="toggleMode"
        >
          {{ isSignup ? 'Switch to Login' : 'Switch to Sign Up' }}
        </button>
      </div>
      <p class="text-center text-sm text-gray-600">
        <span v-if="isSignup">Enter your email and a desired password, then click <strong>Sign Up</strong> to create an account.</span>
        <span v-else>Enter your email and password to log in.</span>
      </p>
      <div class="text-center">
        <button
          type="button"
          class="text-blue-500 text-sm underline"
          @click="toggleInstall"
        >
          How to Save to Desktop
        </button>
        <div
          v-if="showInstall"
          class="mt-2 text-sm text-gray-600"
        >
          <p>
            You can install this web app to run it like a native application.
            On Chrome, open the browser menu and choose <em>Install Item Tracker</em>.
            On Safari, tap the share icon and select <em>Add to Home Screen</em>.
          </p>
        </div>
      </div>
      <p
        v-if="error"
        class="text-red-500 text-sm"
      >
        {{ error }}
      </p>
      <p
        v-if="message"
        class="text-green-600 text-sm"
      >
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../supabaseClient';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';

const email = ref('');
const password = ref('');
const error = ref('');
const message = ref('');
const showInstall = ref(false);
const isSignup = ref(true);
const captchaToken = ref('');
const captcha = ref<InstanceType<typeof VueHcaptcha> | null>(null);
const siteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY;
if (!siteKey) {
  console.warn('VITE_HCAPTCHA_SITEKEY is not set');
}

onMounted(() => {
  isSignup.value = !document.cookie.includes('returningUser=true');
  // Initialize Preline plugins like toggle password
  (window as any).HSStaticMethods?.autoInit();
});

function setReturningUserCookie() {
  document.cookie = 'returningUser=true; path=/; max-age=31536000';
}

function onVerify(token: string) {
  captchaToken.value = token;
}

async function handleLogin() {
  error.value = '';
  message.value = '';
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
    options: {
      captchaToken: captchaToken.value,
    },
  });
  if (err) {
    error.value = err.message;
  } else {
    setReturningUserCookie();
  }
  captcha.value?.reset();
  captchaToken.value = '';
}

async function handleSignup() {
  error.value = '';
  message.value = '';
  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      captchaToken: captchaToken.value,
    },
  });
  if (err) {
    error.value = err.message;
  } else {
    message.value = 'Check your email to verify your account.';
    setReturningUserCookie();
  }
  captcha.value?.reset();
  captchaToken.value = '';
}

function toggleMode() {
  isSignup.value = !isSignup.value;
  setReturningUserCookie();
}

function toggleInstall() {
  showInstall.value = !showInstall.value;
}
</script>

<style scoped>
/* basic styling */
</style>
