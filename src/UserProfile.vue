<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div class="max-w-screen-md mx-auto p-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <router-link
          to="/"
          class="text-blue-600 hover:underline"
        >
          &larr; Back
        </router-link>
        <h1 class="text-2xl font-bold">
          Profile
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
        <template v-if="!editingShop">
          <p class="mb-2">
            <strong>Shop Title:</strong> {{ profile.shop_title || '—' }}
          </p>
          <div class="mb-2">
            <strong>Shop Logo:</strong>
            <img
              v-if="profile.shop_logo_url"
              :src="profile.shop_logo_url"
              alt="Shop Logo"
              class="h-16 mt-1"
            >
          </div>
          <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            @click="startEditShop"
          >
            Change Shop Info
          </button>
        </template>
        <template v-else>
          <div class="mb-2">
            <label
              class="block text-sm mb-1"
              for="shop_title"
            >Shop Title</label>
            <input
              id="shop_title"
              v-model="form.shop_title"
              class="w-full px-3 py-2 border rounded"
              type="text"
            >
          </div>
          <div class="mb-2">
            <label class="block text-sm mb-1">Shop Logo</label>
            <input
              type="file"
              @change="onLogoChange"
            >
            <img
              v-if="logoPreview"
              :src="logoPreview"
              alt="Preview"
              class="h-16 mt-2"
            >
          </div>
          <button
            class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
            :disabled="saving"
            @click="saveShop"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
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
  shop_title: string | null
  shop_logo_url: string | null
}

const profile = ref<Profile>({ name: '', email: '', bio: null, shop_title: null, shop_logo_url: null })
const form = ref({ name: '', bio: '', shop_title: '' })
const editingInfo = ref(false)
const editingShop = ref(false)
const saving = ref(false)
const logoFile = ref<File | null>(null)
const logoPreview = ref('')

async function fetchProfile() {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (error || !data) {
    console.error('Error fetching profile:', error)
    return
  }
  profile.value = data as Profile
  form.value.name = data.name ?? ''
  form.value.bio = data.bio ?? ''
  form.value.shop_title = data.shop_title ?? ''
  logoPreview.value = data.shop_logo_url ?? ''
}

onMounted(fetchProfile)

function startEditInfo() {
  editingInfo.value = true
}

function startEditShop() {
  editingShop.value = true
}

async function saveInfo() {
  saving.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const updates = { name: form.value.name, bio: form.value.bio }
    const { error } = await supabase.from('users').update(updates).eq('id', user.id)
    if (error) throw error
    profile.value = { ...profile.value, ...updates }
    editingInfo.value = false
  } catch (err) {
    console.error('Error saving profile:', err)
  } finally {
    saving.value = false
  }
}

function onLogoChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files[0]) {
    logoFile.value = files[0]
    logoPreview.value = URL.createObjectURL(files[0])
  }
}

async function saveShop() {
  saving.value = true
  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return

    let logoUrl = profile.value.shop_logo_url ?? ''
    if (logoFile.value) {
      const ext = logoFile.value.name.split('.').pop()
      const path = `${user.id}/shop-logo.${ext}`
      const { error } = await supabase.storage.from('images').upload(path, logoFile.value, { upsert: true })
      if (error) throw error
      logoUrl = supabase.storage.from('images').getPublicUrl(path).data.publicUrl
    }

    const updates = { shop_title: form.value.shop_title, shop_logo_url: logoUrl }
    const { error } = await supabase.from('users').update(updates).eq('id', user.id)
    if (error) throw error
    profile.value = { ...profile.value, ...updates }
    editingShop.value = false
  } catch (err) {
    console.error('Error saving shop info:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
</style>
