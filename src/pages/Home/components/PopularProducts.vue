<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/shared/api'
import {
  getProductQuantity,
  ProductListCarousel,
  type ProductCardData
} from '@/modules/products'
import type { Loading } from '@/types'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, title, price, priceWithoutDiscount,  img, discount, rating, categories(id, enTitle), product_quantity_in_stores(quantity)'
    )
    .order('popularity', { ascending: false })
    .limit(12)
  if (error) {
    loading.value = 'error'
    return
  }
  products.value = data.map((p) => {
    return { ...p, quantity: getProductQuantity(p.product_quantity_in_stores) }
  })
  loading.value = 'success'
})
</script>

<template>
  <ProductListCarousel
    title="Популярные товары"
    :loading="loading"
    :products="products"
  />
</template>
