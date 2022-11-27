<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Admin/AdminSidebar.vue'
import Specifications from './AdminSpecifications.vue'
import Home from './AdminHome.vue'
import Categories from './AdminCategory.vue'
import CreateProduct from './AdminCreateProduct.vue'

const route = useRoute()
const currentComponent = computed(() => {
  const link = route.params.link
  if (route.path === '/admin') return Home
  if (link === 'categories') return Categories
  if (link === 'specifications') return Specifications
  if (route.path.includes('product')) return CreateProduct
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
