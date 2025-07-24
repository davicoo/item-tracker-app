<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <LoginForm :start-signup="true" />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
</script>
