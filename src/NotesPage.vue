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
            v-if="isSyncing"
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
            :alt="`Note image created on ${formatDate(note.createdAt)}`"
            loading="lazy"
            class="w-full max-w-xl mb-2 rounded"
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
import { type Note, mapRecordToNote } from './types/note'

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
const isSyncing = ref(false)
const currentUserId = ref<string | null>(null)

const NOTES_STORAGE_KEY = 'notes'
const LAST_USER_STORAGE_KEY = 'notes:last-user'
const GUEST_MARKER = 'guest'

const MAX_IMAGE_WIDTH = 960
const MIN_IMAGE_WIDTH = 320
const MAX_DATA_URL_LENGTH = 180_000
const JPEG_QUALITY_STEPS = [0.72, 0.64, 0.56]
const WIDTH_REDUCTION_RATIO = 0.85

type SaveAction =
  | { type: 'upsert'; note: Note }
  | { type: 'delete'; noteId: string }

onMounted(() => {
  hydrateNotesFromCache()
  void optimizeCachedNotes()
  loadNotes().then(() => {
    checkReminders()
  })
})

function hydrateNotesFromCache() {
  try {
    const cachedUserId = resolveStoredUserId(localStorage.getItem(LAST_USER_STORAGE_KEY))
    currentUserId.value = cachedUserId
    isAuthenticated.value = false
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

function generateNumericNoteId() {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * NOTE_ID_RANDOM_MAX)
    .toString()
    .padStart(6, '0')
  return `${timestamp}${random}`
}

function ensureNumericNoteId(note: Note, usedIds: Set<string>) {
  let candidate = note.id
  let idChanged = false

  if (!candidate || !NUMERIC_ID_PATTERN.test(candidate) || usedIds.has(candidate)) {
    idChanged = true
    do {
      candidate = generateNumericNoteId()
    } while (usedIds.has(candidate))
  }

  usedIds.add(candidate)

  if (!idChanged) {
    return { note, idChanged: false }
  }

  return {
    note: {
      ...note,
      id: candidate,
    },
    idChanged: true,
  }
}

function toStoredNote(note: Note): Note {
  const stored: Note = {
    id: note.id,
    text: note.text,
    createdAt: note.createdAt,
  }
  if (note.imageUrl) {
    stored.imageUrl = note.imageUrl
  }
  if (note.date) {
    stored.date = note.date
  }
  return stored
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
  const serialized = noteList.map(toStoredNote)
  try {
    localStorage.setItem(key, JSON.stringify(serialized))
  } catch (error) {
    console.error(`Failed to save notes to ${key}:`, error)
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(key)
        localStorage.setItem(key, JSON.stringify(serialized))
      } catch (retryError) {
        console.error(`Retry after clearing storage key ${key} failed:`, retryError)
        alert('Browser storage limit exceeded. Notes were not saved locally.')
      }
    }
  }
}

function saveNotesToCacheOnly(noteList: Note[] = notes.value) {
  try {
    persistNotesToCache(currentUserId.value, noteList)
  } catch (error) {
    console.error('Failed to persist notes locally:', error)
  }
}

function mapNoteToRecord(note: Note, userId: string) {
w  return {
    id: note.id,
    user_id: userId,
    text: note.text,
    image_url: note.imageUrl ?? null,
    date: note.date ?? null,
    created_at: note.createdAt,
  }
}

async function fetchNotesFromServer(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapRecordToNote)
}

async function upsertNoteToServer(note: Note, userId: string | null = currentUserId.value) {
  if (!userId) return

  const payload = mapNoteToRecord(note, userId)
  const { error } = await supabase
    .from('notes')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

async function deleteNoteFromServer(noteId: string, userId: string | null = currentUserId.value) {
  if (!userId) return

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('user_id', userId)
    .eq('id', noteId)

  if (error) {
    throw error
  }
}

async function saveNotes(action: SaveAction) {
  saveNotesToCacheOnly()

  if (!isAuthenticated.value || !currentUserId.value) {
    return
  }

  try {
    isSyncing.value = true
    if (action.type === 'upsert') {
      await upsertNoteToServer(action.note)
    } else {
      await deleteNoteFromServer(action.noteId)
    }
  } catch (error) {
    console.error('Failed to sync notes to the server:', error)
    alert('We could not sync your notes to the server. They will stay saved on this device until the connection is restored.')
  } finally {
    isSyncing.value = false
  }

  return { note: normalized, previousId: idChanged ? previousId : undefined }
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

    const remoteNotes = await fetchNotesFromServer(user.id)
    const { notes: optimizedRemoteNotes } = await optimizeNotesForStorage(remoteNotes, {
      syncToServer: true,
      userId: user.id,
    })
    notes.value = optimizedRemoteNotes
    saveNotesToCacheOnly()
  } catch (error) {
    console.error('Unexpected error while loading notes:', error)
    alert('Could not load notes. Please try again.')
  } finally {
    isLoading.value = false
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
  notes.value = notes.value.filter(n => n.id !== id)
  await saveNotes({ type: 'delete', noteId: id })
}

async function saveNote() {
  const reminderDate = form.value.date || undefined
  let optimizedImage: string | undefined

  if (form.value.image) {
    try {
      optimizedImage = await optimizeImageFile(form.value.image)
    } catch (error) {
      console.error('Failed to optimize uploaded image:', error)
      alert('We could not process that image. Please try a different file.')
      return
    }
  }

  if (editingNoteId.value) {
    const index = notes.value.findIndex(n => n.id === editingNoteId.value)
    if (index === -1) return
    const existing = notes.value[index]
    const otherIds = new Set(notes.value.filter((_, idx) => idx !== index).map(n => n.id))
    const { note: normalizedExisting } = ensureNumericNoteId(existing, otherIds)
    const updatedNote: Note = {
      ...normalizedExisting,
      text: form.value.text,
      date: reminderDate,
    }
    if (optimizedImage !== undefined) {
      updatedNote.imageUrl = optimizedImage
    }
    notes.value.splice(index, 1, updatedNote)
    await saveNotes({ type: 'upsert', note: notes.value[index] })
  } else {
    const createdAt = new Date().toISOString()
    const usedIds = new Set(notes.value.map(n => n.id))
    let id = generateNumericNoteId()
    while (usedIds.has(id)) {
      id = generateNumericNoteId()
    }
    const note: Note = {
      id,
      text: form.value.text,
      createdAt,
    }
    if (optimizedImage) {
      note.imageUrl = optimizedImage
    }
    if (reminderDate) {
      note.date = reminderDate
    }
    notes.value = [note, ...notes.value]
    await saveNotes({ type: 'upsert', note })
  }

  cancelForm()
}

async function optimizeImageFile(file: File): Promise<string> {
  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImageElement(sourceDataUrl)
  const preferLossless = file.type === 'image/png'
  return produceOptimizedDataUrl(image, preferLossless)
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for optimization'))
    img.src = src
  })
}

async function optimizeCachedNotes() {
  if (!notes.value.length) return

  try {
    const { notes: optimizedNotes, changed } = await optimizeNotesForStorage(notes.value)
    if (changed) {
      notes.value = optimizedNotes
      saveNotesToCacheOnly()
    }
  } catch (error) {
    console.warn('Failed to optimize cached notes:', error)
  }
}

async function optimizeNotesForStorage(
  noteList: Note[],
  options: { syncToServer?: boolean; userId?: string } = {},
): Promise<{ notes: Note[]; changed: boolean }> {
  const optimizedNotes: Note[] = []
  const notesToSync = new Map<string, Note>()
  const usedIds = new Set<string>()
  let changed = false

  for (const originalNote of noteList) {
    const { note, idChanged } = ensureNumericNoteId(originalNote, usedIds)
    if (idChanged && options.syncToServer && options.userId) {
      notesToSync.set(note.id, note)
    }
    if (idChanged) {
      changed = true
    }

  const notesToSync: Note[] = []
  let changed = false

  for (const note of noteList) {
    if (!note.imageUrl || !note.imageUrl.startsWith('data:image')) {
      optimizedNotes.push(note)
      continue
    }

    try {
      const { dataUrl, changed: imageChanged } = await optimizeStoredImage(note.imageUrl)
      if (imageChanged) {
        const updatedNote: Note = {
          ...note,
          imageUrl: dataUrl,
        }
        optimizedNotes.push(updatedNote)
        changed = true
        if (options.syncToServer && options.userId) {
          notesToSync.push(updatedNote)
        }
      } else {
        optimizedNotes.push(note)
      }
    } catch (error) {
      console.warn('Failed to optimize note image:', error)
      optimizedNotes.push(note)
    }
  }

  if (options.syncToServer && options.userId && notesToSync.length) {
    try {
      await Promise.all(notesToSync.map(note => upsertNoteToServer(note, options.userId)))
    } catch (error) {
      console.warn('Failed to sync optimized note images to server:', error)
    }
  }

  return {
    notes: optimizedNotes,
    changed,
  }
}

async function optimizeStoredImage(imageUrl: string) {
  const image = await loadImageElement(imageUrl)
  const mimeType = parseDataUrlMimeType(imageUrl)
  const originalWidth = image.naturalWidth || image.width
  const shouldResize = originalWidth > MAX_IMAGE_WIDTH
  const shouldShrink = imageUrl.length > MAX_DATA_URL_LENGTH

  if (!shouldResize && !shouldShrink) {
    return { dataUrl: imageUrl, changed: false }
  }

  const optimizedUrl = await produceOptimizedDataUrl(image, mimeType === 'image/png')
  return {
    dataUrl: optimizedUrl,
    changed: optimizedUrl !== imageUrl,
  }
}

function parseDataUrlMimeType(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);/)
  return match ? match[1] : null
}

async function produceOptimizedDataUrl(image: HTMLImageElement, preferLossless: boolean) {
  const originalWidth = Math.max(image.naturalWidth || image.width || MAX_IMAGE_WIDTH, 1)
  let targetWidth = Math.min(originalWidth, MAX_IMAGE_WIDTH)
  const minWidth = Math.min(MIN_IMAGE_WIDTH, targetWidth)
  let bestCandidate: string | null = null
  let losslessAttempted = false

  while (targetWidth >= minWidth) {
    if (preferLossless && !losslessAttempted) {
      const losslessCandidate = renderImageToDataUrl(image, targetWidth, 'image/png')
      losslessAttempted = true
      bestCandidate = losslessCandidate
      if (losslessCandidate.length <= MAX_DATA_URL_LENGTH) {
        return losslessCandidate
      }
    }

    for (const quality of JPEG_QUALITY_STEPS) {
      const lossyCandidate = renderImageToDataUrl(image, targetWidth, 'image/jpeg', quality)
      bestCandidate = lossyCandidate
      if (lossyCandidate.length <= MAX_DATA_URL_LENGTH || targetWidth === minWidth) {
        return lossyCandidate
      }
    }

    if (targetWidth === minWidth) {
      break
    }

    const nextWidth = Math.max(Math.round(targetWidth * WIDTH_REDUCTION_RATIO), minWidth)
    if (nextWidth === targetWidth) {
      break
    }
    targetWidth = nextWidth
    preferLossless = false
  }

  if (bestCandidate) {
    return bestCandidate
  }

  return renderImageToDataUrl(image, targetWidth, 'image/jpeg', JPEG_QUALITY_STEPS[JPEG_QUALITY_STEPS.length - 1])
}

function renderImageToDataUrl(
  image: HTMLImageElement,
  width: number,
  mimeType: 'image/png' | 'image/jpeg',
  quality?: number,
) {
  const originalWidth = image.naturalWidth || image.width
  const originalHeight = image.naturalHeight || image.height
  const scale = originalWidth ? width / originalWidth : 1
  const targetHeight = Math.max(Math.round(originalHeight * scale), 1)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(Math.round(width), 1)
  canvas.height = targetHeight
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas rendering is not supported in this browser')
  }

  if (mimeType === 'image/jpeg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? quality : undefined)
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
