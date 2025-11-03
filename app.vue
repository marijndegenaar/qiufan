<template lang="pug">
div
  NuxtLayout
    NuxtPage
</template>

<script setup>
// Global error handler
if (process.client) {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}
</script>

