<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    @click.self="emit('close')"
  >
    <form
      class="bg-white rounded-lg p-4 w-96 shadow flex flex-col gap-3"
      @submit.prevent="handleSubmit"
    >
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold">
          Contact
        </h2>
        <button
          type="button"
          class="text-gray-500"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>
      <div>
        <label class="block text-sm mb-1">Your Email</label>
        <input
          v-model="from"
          type="email"
          class="w-full px-3 py-2 border rounded"
          required
        >
      </div>
      <div>
        <label class="block text-sm mb-1">Subject</label>
        <input
          v-model="subject"
          type="text"
          class="w-full px-3 py-2 border rounded"
          required
        >
      </div>
      <div>
        <label class="block text-sm mb-1">Message</label>
        <textarea
          v-model="message"
          rows="4"
          class="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <button
        class="flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-md shadow hover:opacity-90 active:scale-95 transition w-full disabled:opacity-50"
        :disabled="sending"
      >
        <svg
          v-if="sending"
          class="animate-spin h-4 w-4 mr-2 text-white"
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
        <span>{{ sending ? 'Sending...' : 'Send' }}</span>
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

