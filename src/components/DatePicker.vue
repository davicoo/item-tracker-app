<template>
  <input
    ref="inputRef"
    type="text"
    :placeholder="placeholder"
    class="hs-datepicker w-full px-3 py-2 border border-gray-300 rounded"
    data-hs-datepicker
    data-hs-datepicker-options='{"dateFormat":"YYYY-MM-DD"}'
  >
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function updateValue(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const normalized = raw.replace(/\./g, '-')
  ;(e.target as HTMLInputElement).value = normalized
  emit('update:modelValue', normalized)
}

onMounted(() => {
  if (inputRef.value) {
    // Initialize Preline plugins so HSDatepicker works
    (window as any).HSStaticMethods?.autoInit?.();
    (window as any).HSDatepicker?.autoInit?.();
    inputRef.value.addEventListener('change', updateValue)
    inputRef.value.addEventListener('input', updateValue)
    if (props.modelValue) {
      inputRef.value.value = props.modelValue.replace(/\./g, '-')
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
      inputRef.value.value = val.replace(/\./g, '-')
    }
  }
)
</script>

