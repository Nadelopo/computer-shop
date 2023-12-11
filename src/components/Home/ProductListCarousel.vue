<script setup lang="ts">
import { VCarousel, VCarouselSlide } from '../UI'
import ProductCard from '../ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton.vue'
import type { Loading } from '@/types'
import type { ProductCardData } from '../ProductCard/types'
import type { CarouselBreakpoints } from '../UI/VCarousel/useFeatureBreakpoints'

defineProps<{
  title: string
  loading: Loading
  products: ProductCardData[]
}>()

const breakpoints: CarouselBreakpoints = {
  '1280': { slidesPerView: 3 },
  '1024': { slidesPerView: 2 },
  '640': { slidesPerView: 1 }
}
</script>

<template>
  <div>
    <div
      v-if="loading === 'success'"
      class="text-3xl font-semibold"
    >
      {{ title }}
    </div>
    <div>
      <v-carousel
        :slides-per-view="4"
        :breakpoints="breakpoints"
        :show-dots="loading === 'success'"
        :show-arrows="loading === 'success' && 'hover'"
        draggable
        class="pt-6 pb-10"
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
            v-for="i in 4"
            :key="i"
          >
            <product-card-skeleton />
          </v-carousel-slide>
        </template>
      </v-carousel>
    </div>
  </div>
</template>
