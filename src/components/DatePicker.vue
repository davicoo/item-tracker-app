<template>
  <input
    ref="inputRef"
    type="date"
    :placeholder="placeholder"
    class="w-full px-3 py-2 border border-gray-300 rounded"
    @input="onInput"
  >
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
}

onMounted(() => {
  if (inputRef.value && props.modelValue) {
    inputRef.value.value = props.modelValue.slice(0, 10)
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (inputRef.value && inputRef.value !== document.activeElement) {
      inputRef.value.value = val.slice(0, 10)
    }
  }
)
</script>

