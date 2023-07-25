<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <content-loader
    class="skeleton"
    viewBox="0 0 1128 259"
    :speed="2"
    primary-color="#e8e8e8"
    secondary-color="#ecebeb"
  >
    <rect x="0" y="20" rx="8" ry="8" width="200" height="220" />
    <rect x="260" y="50" rx="8" ry="8" width="350" height="18" />
    <rect x="260" y="100" rx="8" ry="8" width="200" height="14" />
    <rect x="260" y="130" rx="8" ry="8" width="250" height="14" />
    <rect x="260" y="160" rx="8" ry="8" width="150" height="14" />
    <rect x="260" y="190" rx="8" ry="8" width="190" height="14" />
    <rect x="1030" y="50" rx="8" ry="8" width="80" height="18" />
    <rect x="1010" y="160" rx="8" ry="8" width="120" height="36" />
  </content-loader>
</template>

<style scoped lang="sass">
.skeleton
  height: 250px
  padding: 0 40px
  display: flex
  // background: #fff
  // box-shadow: 0px 0px 6px 4px rgba(0,0,0, 0.1 )
  // border-radius: 8px
</style>
