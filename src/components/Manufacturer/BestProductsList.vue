<script setup lang="ts">
import { VCarousel, VCarouselSlide } from '../UI'
import ProductCard from '../ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton.vue'
import type { CarouselBreakpoints } from '../UI/VCarousel/useFeatureBreakpoints'
import type { Loading } from '@/types'
import type { ProductCardData } from '../ProductCard/types'

defineProps<{
  products: ProductCardData[]
  loading: Loading
}>()

const carouselBreakpoints: CarouselBreakpoints = {
  1280: { slidesPerView: 3 },
  768: { slidesPerView: 2 },
  640: { slidesPerView: 1 }
}
</script>

<template>
  <div v-if="loading === 'success' && products.length">
    <div class="text-3xl font-medium mb-6 text-center sm:text-start">
      Лучшие предложения
    </div>
    <v-carousel
      :slides-per-view="4"
      :space-between="20"
      :breakpoints="carouselBreakpoints"
      draggable
      show-arrows="hover"
      class="py-6"
    >
      <v-carousel-slide
        v-for="product in products"
        :key="product.id"
      >
        <product-card :item="product" />
      </v-carousel-slide>
    </v-carousel>
  </div>
  <div
    v-else-if="loading === 'loading'"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 justify-items-center gap-5"
  >
    <product-card-skeleton
      v-for="_ in 12"
      :key="_"
    />
  </div>
</template>
