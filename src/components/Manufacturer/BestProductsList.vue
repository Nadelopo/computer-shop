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
  <div
    v-if="loading === 'loading' || (loading === 'success' && products.length)"
  >
    <div
      v-if="loading === 'success'"
      class="text-3xl font-medium mb-6 text-center sm:text-start"
    >
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
