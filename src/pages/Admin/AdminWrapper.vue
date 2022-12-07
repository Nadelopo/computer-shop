<script setup lang="ts">
import Sidebar from '@/components/Admin/AdminSidebar.vue'
</script>

<template>
  <div class="roottt">
    <Sidebar />
    <div class="p-4">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="sass">
.roottt
  display: grid
  grid-template-columns: 300px auto
</style>
