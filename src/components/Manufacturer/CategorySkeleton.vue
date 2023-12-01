<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <!-- prettier-ignore -->
  <content-loader
    width="200"
    :speed="1"
    viewBox="0 0 200 170"
    primary-color="#e8e8e8"
    secondary-color="#e8e8e882"
  >
    <rect x="10 " y="8" rx="8" ry="8" width="180" height="130" />
    <rect x="50" y="146" rx="8" ry="8" width="100" height="16" />
  </content-loader>
</template>
