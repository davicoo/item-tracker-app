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
    calendar = new Calendar(inputRef.value, {
      inputMode: true,
      onChangeToInput: (_self: Calendar, e: Event) => {
        emit('update:modelValue', (e.target as HTMLInputElement).value);
      },
      onClickDate: (self: Calendar) => {
        const val = self.context.inputElement?.value || '';
        emit('update:modelValue', val);
      }
    });
    calendar.init();
    const updateValue = (e: Event) => {
      emit('update:modelValue', (e.target as HTMLInputElement).value);
    };
    inputRef.value.addEventListener('input', updateValue);
    inputRef.value.addEventListener('change', updateValue);
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
