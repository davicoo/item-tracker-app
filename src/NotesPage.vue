<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="max-w-screen-md mx-auto p-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <router-link
          to="/app"
          class="text-blue-600 hover:underline"
        >
          &larr; Back
        </router-link>
        <h1 class="text-2xl font-bold">
          Notes
        </h1>
        <span />
      </div>

      <div class="bg-white rounded shadow p-4">
        <form @submit.prevent="addNote">
          <div class="mb-4">
            <label
              for="title"
              class="block text-sm mb-1"
            >Title</label>
            <input
              id="title"
              v-model="form.title"
              class="w-full px-3 py-2 border rounded"
              type="text"
              required
            >
          </div>
          <div class="mb-4">
            <label
              for="itemType"
              class="block text-sm mb-1"
            >Item</label>
            <select
              id="itemType"
              v-model="form.itemType"
              class="w-full px-3 py-2 border rounded"
            >
              <option value="">
                --Select Item--
              </option>
              <option
                v-for="opt in itemOptions"
                :key="opt"
                :value="opt"
              >
                {{ opt }}
              </option>
            </select>
          </div>
          <div class="mb-4">
            <label
              for="sku"
              class="block text-sm mb-1"
            >SKU</label>
            <select
              id="sku"
              v-model="form.sku"
              class="w-full px-3 py-2 border rounded"
            >
              <option value="">
                --Select SKU--
              </option>
              <option
                v-for="sku in skuOptions"
                :key="sku"
                :value="sku"
              >
                {{ sku }}
              </option>
            </select>
          </div>
          <div class="mb-4">
            <label
              for="store"
              class="block text-sm mb-1"
            >Store</label>
            <select
              id="store"
              v-model="form.store"
              class="w-full px-3 py-2 border rounded"
            >
              <option value="">
                --Select Store--
              </option>
              <option
                v-for="store in storeOptions"
                :key="store"
                :value="store"
              >
                {{ store }}
              </option>
            </select>
          </div>
          <div class="mb-4">
            <label
              for="date"
              class="block text-sm mb-1"
            >Reminder Date</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 border rounded"
            >
          </div>
          <div class="mb-4">
            <label
              for="image"
              class="block text-sm mb-1"
            >Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              @change="handleImage"
            >
          </div>
          <div class="mb-4">
            <label
              for="text"
              class="block text-sm mb-1"
            >Note</label>
            <textarea
              id="text"
              v-model="form.text"
              class="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Note
          </button>
        </form>
      </div>

      <div
        v-if="notes.length"
        class="bg-white rounded shadow p-4"
      >
        <h2 class="text-xl font-semibold mb-4">
          Saved Notes
        </h2>
        <div
          v-for="note in sortedNotes"
          :key="note.id"
          class="border-b last:border-b-0 pb-4 mb-4"
        >
          <div class="flex justify-between mb-2">
            <h3 class="font-bold">
              {{ note.title }}
            </h3>
            <span class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</span>
          </div>
          <p class="mb-2">
            {{ note.text }}
          </p>
          <div class="text-sm text-gray-600 mb-2">
            <span v-if="note.itemType">Item: {{ note.itemType }} </span>
            <span v-if="note.sku">| SKU: {{ note.sku }} </span>
            <span v-if="note.store">| Store: {{ note.store }}</span>
          </div>
          <img
            v-if="note.imageUrl"
            :src="note.imageUrl"
            class="max-h-40 mb-2"
          >
          <div
            v-if="note.date"
            class="text-sm text-gray-500"
          >
            Reminder: {{ formatDate(note.date) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { supabase } from './supabaseClient'
import type { Item } from './types/item'
import type { Note } from './types/note'

const form = ref({
  title: '',
  itemType: '',
  sku: '',
  store: '',
  text: '',
  image: null as File | null,
  date: ''
})

const notes = ref<Note[]>([])
const itemOptions = ref<string[]>([])
const skuOptions = ref<string[]>([])
const storeOptions = ref<string[]>([])

onMounted(async () => {
  loadNotes()
  await fetchOptions()
  checkReminders()
})

function loadNotes() {
  const raw = localStorage.getItem('notes')
  notes.value = raw ? JSON.parse(raw) : []
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes.value))
}

async function fetchOptions() {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return

  const { data: items } = await supabase
    .from<Item>('items')
    .select('name')
    .eq('user_id', user.id)

  if (items) {
    const names = new Set(items.map(i => i.name))
    itemOptions.value = Array.from(names)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_types, sku_options')
    .eq('id', user.id)
    .single()

  if (profile) {
    storeOptions.value = (profile.store_types as string[]) || []
    skuOptions.value = (profile.sku_options as string[]) || []
  }
}

function handleImage(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  form.value.image = file || null
}

function resetForm() {
  form.value = { title: '', itemType: '', sku: '', store: '', text: '', image: null, date: '' }
}

function addNote() {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  const finalize = (imageUrl?: string) => {
    const note: Note = {
      id,
      title: form.value.title,
      itemType: form.value.itemType,
      sku: form.value.sku,
      store: form.value.store,
      text: form.value.text,
      imageUrl,
      date: form.value.date,
      createdAt
    }
    notes.value.push(note)
    saveNotes()
    resetForm()
  }

  if (form.value.image) {
    const reader = new FileReader()
    reader.onload = () => finalize(reader.result as string)
    reader.readAsDataURL(form.value.image)
  } else {
    finalize()
  }
}

const sortedNotes = computed(() =>
  [...notes.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

function checkReminders() {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    .toISOString()
    .split('T')[0]
  for (const note of notes.value) {
    if (note.date === tomorrow) {
      alert(`Reminder for tomorrow: ${note.title}`)
    }
  }
}
</script>

<style scoped>
</style>
