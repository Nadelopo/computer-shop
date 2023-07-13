<script setup lang="ts">
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import Sidebar from '@/components/Admin/AdminSidebar.vue'
import { loadingKey, productsKey, setProductsKey } from './types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import { useManufacturersStore } from '@/stores/manufacturersStore'

const route = useRoute()

const { getProducts } = useProductsStore()
const { setManufacturers } = useManufacturersStore()
setManufacturers()

const products = ref<ProductWithSpecifications[]>([])
const loading = ref<Loading>('loading')
const setProducts = async () => {
  const categoryId = Number(route.params.id)
  if (categoryId) {
    loading.value = 'loading'
    products.value = await getProducts(categoryId)
    if (products.value.length === 0) {
      loading.value = 'empty'
    } else {
      loading.value = 'success'
    }
  }
}

provide(productsKey, products)
provide(setProductsKey, setProducts)
provide(loadingKey, loading)
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
  & div:last-child
    background: #fff
</style>
