<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getAll } from '@/db/queries/tables'
import ProductListCarousel from './ProductListCarousel.vue'
import type { ProductCardData } from '../ProductCard/types'
import type { Loading } from '@/types'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getAll('products', {
    order: ['popularity', false],
    select:
      'id, name, price, priceWithoutDiscount, img, discount, rating, categories(id, enTitle)',
    limit: 12
  })
  if (error) {
    loading.value = 'error'
    return
  }
  products.value = data
  loading.value = 'success'
})
</script>

<template>
  <product-list-carousel
    title="Популярные товары"
    :loading="loading"
    :products="products"
  />
</template>
