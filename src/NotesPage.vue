<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="max-w-screen-lg mx-auto p-4 flex flex-col gap-6">
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

      <div
        v-if="showForm"
        class="bg-white rounded shadow p-4"
      >
        <form @submit.prevent="saveNote">
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
          <div class="flex gap-2">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {{ editingNoteId ? 'Save Note' : 'Add Note' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded border hover:bg-gray-100"
              @click="cancelForm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div
        v-else
        class="bg-white rounded shadow p-4 text-center"
      >
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          @click="startNewNote"
        >
          New Note
        </button>
      </div>

      <div
        v-if="isLoading && !notes.length"
        class="bg-white rounded shadow p-4 text-center text-gray-500"
      >
        Loading notes...
      </div>

      <div
        v-if="notes.length"
        class="bg-white rounded shadow p-4"
      >
        <div class="flex items-center gap-2 mb-4">
          <h2 class="text-xl font-semibold">
            Saved Notes
          </h2>
          <div
            v-if="isLoading"
            class="flex items-center gap-1 text-sm text-gray-500"
            aria-live="polite"
          >
            <svg
              class="w-4 h-4 animate-spin text-gray-400"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Syncing…</span>
          </div>
        </div>
        <div
          v-for="note in sortedNotes"
          :key="note.id"
          class="border-b last:border-b-0 pb-4 mb-4"
        >
          <div class="mb-2 text-sm text-gray-500">
            {{ formatDate(note.createdAt) }}
          </div>
          <p class="mb-2">
            {{ note.text }}
          </p>
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

          <div class="flex gap-4 text-sm mt-2">
            <button
              class="text-blue-600 hover:underline"
              @click="startEdit(note)"
            >
              Edit
            </button>
            <button
              class="text-red-600 hover:underline"
              @click="deleteNote(note.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { supabase } from './supabaseClient'
import { mapRecordToNote, type Note, type NoteRecord } from './types/note'

const form = ref({
  text: '',
  image: null as File | null,
  date: ''
})

const notes = ref<Note[]>([])

const isAuthenticated = ref(false)
const showForm = ref(false)
const editingNoteId = ref<string | null>(null)
const isLoading = ref(true)
const currentUserId = ref<string | null>(null)

const NOTES_STORAGE_KEY = 'notes'
const LAST_USER_STORAGE_KEY = 'notes:last-user'
const GUEST_MARKER = 'guest'

onMounted(() => {
  hydrateNotesFromCache()
  loadNotes().then(() => {
    checkReminders()
  })
})

function hydrateNotesFromCache() {
  try {
    const cachedUserId = resolveStoredUserId(localStorage.getItem(LAST_USER_STORAGE_KEY))
    currentUserId.value = cachedUserId
    isAuthenticated.value = !!cachedUserId
    notes.value = loadNotesFromCache(cachedUserId)
  } catch (error) {
    console.warn('Failed to hydrate cached notes:', error)
    currentUserId.value = null
    isAuthenticated.value = false
    notes.value = []
  }
}

function resolveStoredUserId(raw: string | null): string | null {
  if (!raw || raw === GUEST_MARKER) {
    return null
  }
  return raw
}

function cacheKeyForUser(userId: string | null) {
  return userId ? `${NOTES_STORAGE_KEY}:${userId}` : NOTES_STORAGE_KEY
}

function normalizeCachedNote(candidate: unknown): Note | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }
  const record = candidate as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.text !== 'string' || typeof record.createdAt !== 'string') {
    return null
  }
  const note: Note = {
    id: record.id,
    text: record.text,
    createdAt: record.createdAt,
  }
  if (typeof record.imageUrl === 'string') {
    note.imageUrl = record.imageUrl
  }
  if (typeof record.date === 'string') {
    note.date = record.date
  }
  return note
}

function loadNotesFromCache(userId: string | null) {
  try {
    const raw = localStorage.getItem(cacheKeyForUser(userId))
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .map(normalizeCachedNote)
      .filter((note): note is Note => note !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.warn('Failed to read cached notes:', error)
    return []
  }
}

function persistNotesToCache(userId: string | null, noteList: Note[]) {
  const key = cacheKeyForUser(userId)
  try {
    localStorage.setItem(key, JSON.stringify(noteList))
  } catch (error) {
    console.error(`Failed to save notes to ${key}:`, error)
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(key)
        localStorage.setItem(key, JSON.stringify(noteList))
      } catch (retryError) {
        console.error(`Retry after clearing storage key ${key} failed:`, retryError)
        alert('Browser storage limit exceeded. Notes were not saved locally.')
      }
    }
  }
}

function updateLastUserCache(userId: string | null) {
  try {
    if (userId) {
      localStorage.setItem(LAST_USER_STORAGE_KEY, userId)
    } else {
      localStorage.setItem(LAST_USER_STORAGE_KEY, GUEST_MARKER)
    }
  } catch (error) {
    console.warn('Failed to persist last user id:', error)
  }
}
async function loadNotes() {
  isLoading.value = true
  const cachedUserId = currentUserId.value

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw sessionError
    }

    const user = sessionData.session?.user ?? null
    currentUserId.value = user?.id ?? null
    isAuthenticated.value = !!user
    updateLastUserCache(currentUserId.value)

    if (currentUserId.value !== cachedUserId) {
      notes.value = loadNotesFromCache(currentUserId.value)
    }

    if (!user) {
      return
    }

    const { data, error } = await supabase
      .from<NoteRecord>('notes')
      .select('id, text, image_url, date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load notes from Supabase:', error)
      alert('Could not load notes from the database.')
      return
    }

    const loadedNotes = (data ?? []).map(mapRecordToNote)
    notes.value = loadedNotes
    saveNotes()
  } catch (error) {
    console.error('Unexpected error while loading notes:', error)
    alert('Could not load notes. Please try again.')
  } finally {
    isLoading.value = false
  }
}

function saveNotes() {
  try {
    persistNotesToCache(currentUserId.value, notes.value)
  } catch (error) {
    console.error('Failed to persist notes locally:', error)
  }
}

function handleImage(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  form.value.image = file || null
}

function resetForm() {
  form.value = {
    text: '',
    image: null,
    date: ''
  }
}

function startNewNote() {
  resetForm()
  editingNoteId.value = null
  showForm.value = true
}

function startEdit(note: Note) {
  editingNoteId.value = note.id
  form.value = {
    text: note.text,
    image: null,
    date: note.date || ''
  }
  showForm.value = true
}

function cancelForm() {
  resetForm()
  editingNoteId.value = null
  showForm.value = false
}

async function deleteNote(id: string) {
  const userId = currentUserId.value

  if (isAuthenticated.value && userId) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) {
      console.error('Failed to delete note in Supabase:', error)
      alert('Failed to delete note from the database.')
      return
    }
  }

  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
}

async function saveNote() {
  const reminderDate = form.value.date || undefined

  if (editingNoteId.value) {
    const index = notes.value.findIndex(n => n.id === editingNoteId.value)
    if (index === -1) return
    const existing = notes.value[index]
    const finalize = async (imageUrl?: string) => {
      const userId = currentUserId.value
      if (isAuthenticated.value && userId) {
        const { error } = await supabase
          .from('notes')
          .update({
            text: form.value.text,
            image_url: imageUrl,
            date: reminderDate ?? null,
          })
          .eq('id', existing.id)
          .eq('user_id', userId)
        if (error) {
          console.error('Failed to update note in Supabase:', error)
          alert('Failed to update note in the database.')
          return
        }
      }

      const updatedNote: Note = {
        ...existing,
        text: form.value.text,
        date: reminderDate,
      }
      if (imageUrl !== undefined) {
        updatedNote.imageUrl = imageUrl
      }
      notes.value.splice(index, 1, updatedNote)
      saveNotes()
      cancelForm()
    }
    if (form.value.image) {
      const reader = new FileReader()
      reader.onload = async () => {
        await finalize(reader.result as string)
      }
      reader.readAsDataURL(form.value.image)
    } else {
      await finalize()
    }
  } else {
    const userId = currentUserId.value

    const finalize = async (imageUrl?: string) => {
      if (isAuthenticated.value && userId) {
        const { data: inserted, error } = await supabase
          .from('notes')
          .insert([
            {

              user_id: userId,
              text: form.value.text,
              image_url: imageUrl,
              date: reminderDate ?? null,
            },
          ])
          .select('id, text, image_url, date, created_at')
          .single()
        if (error) {
          console.error('Failed to save note in Supabase:', error)
          alert('Failed to save note to the database.')
          return
        }
        const newNote = mapRecordToNote(inserted as NoteRecord)
        notes.value = [newNote, ...notes.value]
        saveNotes()
        cancelForm()
        return
      }

      const tempId = crypto.randomUUID()
      const createdAt = new Date().toISOString()
      const note: Note = {
        id: tempId,
        text: form.value.text,
        createdAt,
      }
      if (imageUrl) {
        note.imageUrl = imageUrl
      }
      if (reminderDate) {
        note.date = reminderDate
      }
      notes.value = [note, ...notes.value]
      saveNotes()
      cancelForm()
    }

    if (form.value.image) {
      const reader = new FileReader()
      reader.onload = async () => {
        await finalize(reader.result as string)
      }
      reader.readAsDataURL(form.value.image)
    } else {
      await finalize()
    }

  }
}

const sortedNotes = computed(() =>
  [...notes.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      alert(`Reminder for tomorrow: ${note.text}`)
    }
  }
}
</script>

<style scoped>
</style>
