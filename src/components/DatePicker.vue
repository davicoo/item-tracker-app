<template>
  <input
    ref="inputRef"
    type="text"
    :placeholder="placeholder"
    class="hs-datepicker w-full px-3 py-2 border border-gray-300 rounded"
    data-hs-datepicker
  >
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import '@/assets/datepicker.css'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function updateValue(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.addEventListener('change', updateValue)
    inputRef.value.addEventListener('input', updateValue)
    if (props.modelValue) {
      inputRef.value.value = props.modelValue
    }
  }
})

onBeforeUnmount(() => {
  if (inputRef.value) {
    inputRef.value.removeEventListener('change', updateValue)
    inputRef.value.removeEventListener('input', updateValue)
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (inputRef.value && inputRef.value.value !== val) {
      inputRef.value.value = val
    }
  }
)
</script>

