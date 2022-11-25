<script setup lang="ts">
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Admin/AdminSidebar.vue'
import specifications from './AdminSpecifications.vue'
import Home from './AdminHome.vue'
import categories from './AdminCategory.vue'
import { computed } from 'vue'

const route = useRoute()
console.log(route.params.link)
const currentComponent = computed(() => {
  const link = route.params.link
  if (route.path === '/admin') return Home
  if (link === 'categories') return categories
  if (link === 'specifications') return specifications
  else return 'notFound'
})
</script>

<template>
  <div class="roottt">
    <Sidebar />
    <div class="p-4">
      <Component :is="currentComponent" />
    </div>
  </div>
</template>

<style scoped lang="sass">
.roottt
  display: grid
  grid-template-columns: 300px auto
  background: #fff
</style>
