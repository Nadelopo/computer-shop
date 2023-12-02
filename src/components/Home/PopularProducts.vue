<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getAll } from '@/db/queries/tables'
import { VCarousel, VCarouselSlide } from '../UI'
import ProductCard from '../ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton.vue'
import type { CarouselBreakpoints } from '../UI/VCarousel/useFeatureBreakpoints'
import type { ProductCardData } from '../ProductCard/types'
import type { Loading } from '@/types'

const products = ref<ProductCardData[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getAll('products', {
    order: ['popularity', false],
    select:
      'id, name, price, priceWithoutDiscount, img, discount, categories(id, enTitle)',
    limit: 12
  })
  if (error) {
    loading.value = 'error'
    return
  }
  console.log(data)
  products.value = data
  loading.value = 'success'
})

const carouselBreakpoints: CarouselBreakpoints = {
  '1280': { slidesPerView: 3 },
  '1024': { slidesPerView: 2 },
  '640': { slidesPerView: 1 }
}
</script>

<template>
  <div
    v-if="loading === 'success'"
    class="mt-8 text-3xl font-medium"
  >
    Популярные товары
  </div>
  <div>
    <v-carousel
      :slides-per-view="4"
      :breakpoints="carouselBreakpoints"
      show-arrows="hover"
      draggable
      class="py-6"
    >
      <template v-if="loading === 'success'">
        <v-carousel-slide
          v-for="product in products"
          :key="product.id"
        >
          <product-card :item="product" />
        </v-carousel-slide>
      </template>
      <template v-else>
        <v-carousel-slide
          v-for="i in 12"
          :key="i"
        >
          <product-card-skeleton />
        </v-carousel-slide>
      </template>
    </v-carousel>
  </div>
</template>
