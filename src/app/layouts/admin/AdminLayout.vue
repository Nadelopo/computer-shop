<script setup lang="ts">
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
</script>

<template>
  <div class="roottt">
    <admin-sidebar />
    <div class="p-4">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="sass">

.roottt
  display: grid
  grid-template-columns: auto 1fr
  // background: #fff
</style>
