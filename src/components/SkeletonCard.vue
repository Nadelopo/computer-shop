<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <content-loader
    class="skeleton"
    :speed="1"
    primary-color="#e8e8e8"
    secondary-color="#e8e8e882"
    viewBox="0 0 280 400"
    height="400px"
  >
    <rect x="45" y="50" rx="8" width="180" height="190" />
    <rect x="20" y="260" rx="8" width="230" height="20" />
    <rect x="20" y="320" rx="8" width="60" height="24" />
    <rect x="20" y="364" rx="8" width="90" height="28" />
    <rect x="150" y="360" rx="8" width="100" height="36" />
  </content-loader>
</template>

<style scoped>
.skeleton {
  width: 100%;
  max-width: 280px;
  min-width: 240px;
}
</style>
