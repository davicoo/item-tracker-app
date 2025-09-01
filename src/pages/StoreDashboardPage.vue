<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">
      Store Dashboard
    </h1>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else>
      <h2 class="text-lg font-semibold">
        Stats
      </h2>
      <ul class="mb-4">
        <li>Total Items: {{ stats.total }}</li>
        <li>Outstanding Items: {{ stats.outstanding }}</li>
        <li>Sold Items: {{ stats.sold }}</li>
      </ul>
      <h2 class="text-lg font-semibold">
        Items
      </h2>
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th class="px-2 py-1 text-left">
              Name
            </th>
            <th class="px-2 py-1">
              Status
            </th>
            <th class="px-2 py-1" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
          >
            <td class="px-2 py-1">
              {{ item.name }}
            </td>
            <td class="px-2 py-1">
              {{ item.status }}
            </td>
            <td class="px-2 py-1">
              <button
                v-if="item.status !== 'sold'"
                class="text-blue-600"
                @click="markSold(item)"
              >
                Mark Sold
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

interface Item {
  id: string
  name: string
  status: string
  owner_email: string
}

const items = ref<Item[]>([])
const stats = ref({ total: 0, outstanding: 0, sold: 0 })
const loading = ref(true)

async function fetchItems() {
  const { data } = await supabase.from('items').select('*')
  items.value = (data as Item[]) ?? []
  stats.value = {
    total: items.value.length,
    outstanding: items.value.filter(i => i.status !== 'sold').length,
    sold: items.value.filter(i => i.status === 'sold').length,
  }
}

async function markSold(item: Item) {
  await supabase.from('items').update({ status: 'sold' }).eq('id', item.id)
  await fetch('/.netlify/functions/notifyItemSold', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(import.meta.env.VITE_MAIL_TOKEN ? { 'X-Mail-Token': import.meta.env.VITE_MAIL_TOKEN } : {})
    },
    body: JSON.stringify({ email: item.owner_email, itemName: item.name })
  })
  await fetchItems()
}

onMounted(async () => {
  await fetchItems()
  loading.value = false
})
</script>
