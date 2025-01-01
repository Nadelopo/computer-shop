<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import ProductListCarousel from './ProductListCarousel.vue'
import type { ProductCardData } from '../ProductCard/types'
import type { Loading } from '@/types'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, title, price, priceWithoutDiscount, quantity, img, discount, rating, categories(id, enTitle)'
    )
    .order('popularity', { ascending: false })
    .limit(12)
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
