<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useLocalStorage } from '@/utils/localStorage'
import { getProductQuantity } from '@/utils/getProductQuantity'
import ProductListCarousel from './ProductListCarousel.vue'
import type { ProductCardData } from '../ProductCard/types'
import type { Loading } from '@/types'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const recentlyProducts = useLocalStorage<number[]>('recentlyProducts').get()
  if (!recentlyProducts) {
    loading.value = 'empty'
    return
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, title, price, priceWithoutDiscount, img, discount, rating,  categories(id, enTitle), product_quantity_in_stores(quantity)'
    )
    .in('id', recentlyProducts)
  if (error) {
    loading.value = 'error'
    return
  }
  products.value = data
    .map((p) => ({
      ...p,
      quantity: getProductQuantity(p.product_quantity_in_stores)
    }))
    .toSorted((a, b) => {
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
