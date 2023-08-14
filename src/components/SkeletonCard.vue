<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <content-loader
    :speed="1"
    primary-color="#e8e8e8"
    secondary-color="#e8e8e882"
    viewBox="0 0 270 420"
    width="270px"
    height="420px"
  >
    <rect x="45" y="60" rx="8" width="180" height="190" />
    <rect x="20" y="264" rx="8" width="230" height="20" />
    <rect x="20" y="320" rx="8" width="60" height="24" />
    <rect x="20" y="360" rx="8" width="90" height="28" />
    <rect x="150" y="360" rx="8" width="100" height="36" />
  </content-loader>
</template>
