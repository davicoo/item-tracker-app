<template>
  <input
    ref="inputRef"
    type="text"
    :placeholder="placeholder"
    class="w-full px-3 py-2 border border-gray-300 rounded"
  >
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Calendar } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/layout.css';
import 'vanilla-calendar-pro/styles/themes/light.css';
import 'vanilla-calendar-pro/styles/themes/dark.css';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [string] }>();

const inputRef = ref<HTMLInputElement | null>(null);
let calendar: Calendar | null = null;

onMounted(() => {
  if (inputRef.value) {
    calendar = new Calendar(inputRef.value, { inputMode: true });
    calendar.init();
    inputRef.value.addEventListener('change', (e: Event) => {
      emit('update:modelValue', (e.target as HTMLInputElement).value);
    });
    if (props.modelValue) {
      inputRef.value.value = props.modelValue;
    }
  }
});

onBeforeUnmount(() => {
  calendar?.destroy();
});

watch(
  () => props.modelValue,
  (val) => {
    if (inputRef.value && inputRef.value.value !== val) {
      inputRef.value.value = val;
    }
  }
);
</script>
