<script setup lang="ts">
import Sidebar from '@/components/Admin/Sidebar.vue'
</script>

<template>
  <div class="roottt">
    <Sidebar />
    <div class="p-4">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="sass">
.roottt
  display: grid
  grid-template-columns: 12% auto
  background: #fff
</style>
