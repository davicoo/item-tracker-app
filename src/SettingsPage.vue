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
          Settings
        </h1>
        <span />
      </div>

      <div class="bg-white rounded shadow p-4">
        <template v-if="!editingInfo">
          <p class="mb-2">
            <strong>Name:</strong> {{ profile.name }}
          </p>
          <p class="mb-2">
            <strong>Email:</strong> {{ profile.email }}
          </p>
          <p class="mb-2">
            <strong>Bio:</strong> {{ profile.bio || '—' }}
          </p>
          <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            @click="startEditInfo"
          >
            Edit Info
          </button>
        </template>
        <template v-else>
          <div class="mb-2">
            <label
              class="block text-sm mb-1"
              for="name"
            >Name</label>
            <input
              id="name"
              v-model="form.name"
              class="w-full px-3 py-2 border rounded"
              type="text"
            >
          </div>
          <div class="mb-2">
            <label
              class="block text-sm mb-1"
              for="bio"
            >Bio</label>
            <textarea
              id="bio"
              v-model="form.bio"
              class="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
            :disabled="saving"
            @click="saveInfo"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </template>
      </div>

      <div class="bg-white rounded shadow p-4">
        <template v-if="!editingCatalog">
          <div class="mb-2">
            <strong>Stores:</strong>
            <span v-if="catalog.stores.length">{{ catalog.stores.join(', ') }}</span>
            <span v-else>—</span>
          </div>
          <div class="mb-2">
            <strong>SKUs:</strong>
            <span v-if="catalog.skus.length">{{ catalog.skus.join(', ') }}</span>
            <span v-else>—</span>
          </div>
          <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            @click="startEditCatalog"
          >
            Edit Catalog
          </button>
        </template>
        <template v-else>
          <div class="mb-2">
            <label class="block text-sm mb-1">Stores</label>
            <div class="flex flex-wrap mb-2">
              <span
                v-for="(store, idx) in tempStores"
                :key="store"
                class="bg-gray-200 rounded-full px-2 py-1 text-sm mr-2 mb-2 flex items-center"
              >
                {{ store }}
                <button
                  class="ml-1 text-red-500"
                  @click="removeStore(idx)"
                >✕</button>
              </span>
            </div>
            <input
              v-model="newStore"
              type="text"
              class="w-full px-3 py-2 border rounded mb-2"
              placeholder="Add store and press Enter"
              @keyup.enter.prevent="addStore"
            >
          </div>
          <div class="mb-2">
            <label class="block text-sm mb-1">SKUs</label>
            <div class="flex flex-wrap mb-2">
              <span
                v-for="(sku, idx) in tempSkus"
                :key="sku"
                class="bg-gray-200 rounded-full px-2 py-1 text-sm mr-2 mb-2 flex items-center"
              >
                {{ sku }}
                <button
                  class="ml-1 text-red-500"
                  @click="removeSku(idx)"
                >✕</button>
              </span>
            </div>
            <input
              v-model="newSku"
              type="text"
              class="w-full px-3 py-2 border rounded mb-2"
              placeholder="Add SKU and press Enter"
              @keyup.enter.prevent="addSku"
            >
          </div>
          <div class="flex gap-2">
            <button
              class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
              :disabled="saving"
              @click="saveCatalog"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button
              class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              :disabled="saving"
              @click="editingCatalog = false"
            >
              Cancel
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from './supabaseClient'

interface Profile {
  id?: string
  name: string
  email: string
  bio: string | null
  store_types: string[] | null
  sku_options: string[] | null
}

const profile = ref<Profile>({
  name: '',
  email: '',
  bio: null,
  store_types: [],
  sku_options: []
})
const form = ref({ name: '', bio: '' })
const editingInfo = ref(false)
const saving = ref(false)
const catalog = ref({ stores: [] as string[], skus: [] as string[] })
const editingCatalog = ref(false)
const tempStores = ref<string[]>([])
const tempSkus = ref<string[]>([])
const newStore = ref('')
const newSku = ref('')

async function fetchProfile() {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) {
    console.error('Error fetching profile:', error)
    return
  }
  let profileData = data as Profile | null
  if (!profileData) {
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email })
      .select()
      .single()
    if (insertError) {
      console.error('Error creating profile:', insertError)
      return
    }
    profileData = inserted as Profile
  }
  profile.value = profileData
  form.value.name = profileData.name ?? ''
  form.value.bio = profileData.bio ?? ''
  catalog.value.stores = (profileData.store_types as string[] | null) || []
  catalog.value.skus = (profileData.sku_options as string[] | null) || []
}

onMounted(fetchProfile)

function startEditInfo() {
  editingInfo.value = true
}

async function saveInfo() {
  saving.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const updates = { name: form.value.name, bio: form.value.bio }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (error) throw error
    profile.value = { ...profile.value, ...updates }
    editingInfo.value = false
  } catch (err) {
    console.error('Error saving profile:', err)
  } finally {
    saving.value = false
  }

}

function startEditCatalog() {
  editingCatalog.value = true
  tempStores.value = [...catalog.value.stores]
  tempSkus.value = [...catalog.value.skus]
}

function addStore() {
  const val = newStore.value.trim()
  if (val && !tempStores.value.includes(val)) {
    tempStores.value.push(val)
  }
  newStore.value = ''
}

function removeStore(idx: number) {
  tempStores.value.splice(idx, 1)
}

function addSku() {
  const val = newSku.value.trim()
  if (val && !tempSkus.value.includes(val)) {
    tempSkus.value.push(val)
  }
  newSku.value = ''
}

function removeSku(idx: number) {
  tempSkus.value.splice(idx, 1)
}

async function saveCatalog() {
  saving.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const updates = {
      store_types: tempStores.value,
      sku_options: tempSkus.value
    }
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

    if (error) throw error
    catalog.value.stores = [...tempStores.value]
    catalog.value.skus = [...tempSkus.value]
    editingCatalog.value = false
  } catch (err) {
    console.error('Error saving catalog:', err)
  } finally {
    saving.value = false
  }
}

</script>

<style scoped>
</style>
