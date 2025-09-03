<template>
  <LoginForm
    :start-signup="true"
    :allow-signup="true"
    role="store"
  />
</template>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
</script>
