<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <content-loader
    :speed="1"
    class="skeleton"
    viewBox="0 0 290 600"
    primary-color="#e8e8e8"
    secondary-color="#e8e8e882"
  >
    <rect x="70" y="20" rx="8" ry="8" width="150" height="24" />
    <rect x="0" y="60" rx="8" ry="8" width="104" height="42" />
    <rect x="186" y="60" rx="8" ry="8" width="104" height="42" />

    <rect x="95" y="136" rx="8" ry="8" width="100" height="24" />
    <rect x="0" y="176" rx="8" ry="8" width="104" height="42" />
    <rect x="186" y="176" rx="8" ry="8" width="104" height="42" />

    <rect x="80" y="252" rx="8" ry="8" width="130" height="24" />
    <rect x="0" y="292" rx="8" ry="8" width="104" height="42" />
    <rect x="186" y="292" rx="8" ry="8" width="104" height="42" />

    <rect x="70" y="368" rx="8" ry="8" width="150" height="24" />

    <rect x="40" y="410" rx="8" ry="8" width="70" height="18" />
    <rect x="0" y="408" rx="2" ry="2" width="24" height="24" />

    <rect x="40" y="440" rx="8" ry="8" width="150" height="18" />
    <rect x="0" y="438" rx="2" ry="2" width="24" height="24" />

    <rect x="40" y="470" rx="8" ry="8" width="100" height="18" />
    <rect x="0" y="468" rx="2" ry="2" width="24" height="24" />

    <rect x="40" y="500" rx="8" ry="8" width="130" height="18" />
    <rect x="0" y="498" rx="2" ry="2" width="24" height="24" />
  </content-loader>
</template>

<style scoped lang="sass">

.skeleton
  padding: 20px
</style>
