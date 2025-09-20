<template>
  <div
    class="fixed inset-0 z-[420] overflow-y-auto bg-[--overlay-bg] px-4 py-8 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <form
      class="relative mx-auto flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-white/98 via-primary-50/85 to-white/98 px-6 py-6 shadow-2xl shadow-primary-900/20 backdrop-blur-xl sm:px-8"
      @submit.prevent="handleSubmit"
    >
      <span class="pointer-events-none absolute -left-20 top-12 h-48 w-48 rounded-full bg-secondary-200/25 blur-[120px]" />
      <button
        type="button"

        class="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-primary-600 shadow-sm shadow-primary-900/10 backdrop-blur transition hover:bg-primary-50/80 hover:text-primary-700"

        @click="emit('close')"
      >
        <span class="sr-only">Close</span>
        &times;
      </button>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
          Get in Touch
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-title text-primary-900">
          Contact Support
        </h2>
        <p class="mt-2 text-sm text-primary-600">
          We typically reply within one business day. Let us know how we can help.
        </p>
      </div>
      <label class="relative flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Your Email</span>
        <input
          v-model="from"
          type="email"          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          required
        >
      </label>
      <label class="relative flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Subject</span>
        <input
          v-model="subject"
          type="text"
          class="rounded-btn border border-primary-100 bg-white/90 px-4 py-2 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"

          required
        >
      </label>
      <label class="relative flex flex-col gap-2 text-sm text-primary-600">
        <span class="font-medium text-primary-800">Message</span>
        <textarea
          v-model="message"
          rows="4"
          class="min-h-32 rounded-2xl border border-primary-100 bg-white/90 px-4 py-3 text-sm text-[--body-text-color] shadow-inner shadow-primary-900/10 focus:border-primary-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          required
        />
      </label>
      <button
        class="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-indigo-500 to-secondary-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-950/30 drop-shadow-[0_12px_32px_rgba(76,81,255,0.45)] transition hover:translate-y-0.5 hover:shadow-2xl disabled:opacity-60"

        :disabled="sending"
      >
        <svg
          v-if="sending"
          class="size-4 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>{{ sending ? 'Sending…' : 'Send Message' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ defaultSubject: string }>()
const emit = defineEmits<{ close: [] }>()

const from = ref('')
const subject = ref(props.defaultSubject)
const message = ref('')
const sending = ref(false)

watch(
  () => props.defaultSubject,
  (s) => {
    subject.value = s
  }
)

async function handleSubmit() {
  sending.value = true
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    await fetch('/.netlify/functions/sendEmail', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject: subject.value,
        html: message.value.replace(/\n/g, '<br>'),
        text: message.value,
        replyTo: from.value
      })
    })
    emit('close')
  } catch (err) {
    console.error('Error sending email:', err)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
</style>

