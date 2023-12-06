<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import type { ProductCardData } from '../ProductCard/types'
import { localStorageGet } from '@/utils/localStorage'
import { getAll } from '@/db/queries/tables'
import type { Loading } from '@/types'
import ProductListCarousel from './ProductListCarousel.vue'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const recentlyProducts = localStorageGet<number[]>('recentlyProducts')
  if (!recentlyProducts) {
    loading.value = 'empty'
    return
  }
  const { data, error } = await getAll('products', {
    in: { id: recentlyProducts },
    select:
      'id, name, price, priceWithoutDiscount, img, discount, rating, categories(id, enTitle)'
  })
  if (error) {
    loading.value = 'error'
    return
  }
  products.value = data.toSorted((a, b) => {
    const indexA = recentlyProducts.indexOf(a.id)
    const indexB = recentlyProducts.indexOf(b.id)
    return indexA - indexB
  })
  loading.value = 'success'
})
</script>

<template>
  <product-list-carousel
    v-if="loading !== 'error' && loading !== 'empty'"
    title="Недавно просмотренные товары"
    :loading="loading"
    :products="products"
  />
</template>
