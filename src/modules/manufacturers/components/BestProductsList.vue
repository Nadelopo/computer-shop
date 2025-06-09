<script setup lang="ts">
import { VCarousel, VCarouselSlide } from '@/components/UI'
import ProductCard from '@/modules/products/components/ProductCard.vue'
import ProductCardSkeleton from '@/modules/products/components/ProductCardSkeleton.vue'
import type { CarouselBreakpoints } from '@/components/UI/VCarousel/useFeatureBreakpoints'
import type { Loading } from '@/types'
import type { ProductCardData } from '@/modules/products/model/products.types'

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
  <div v-if="loading === 'loading' || (loading === 'success' && products.length)">
    <div
      v-if="loading === 'success'"
      class="text-3xl font-medium mb-6 text-center sm:text-start"
    >
      Лучшие предложения
    </div>
    <VCarousel
      :slides-per-view="4"
      :space-between="20"
      :breakpoints="carouselBreakpoints"
      draggable
      show-arrows="hover"
      class="py-6"
    >
      <template v-if="loading === 'success'">
        <VCarouselSlide
          v-for="product in products"
          :key="product.id"
        >
          <ProductCard :item="product" />
        </VCarouselSlide>
      </template>
      <template v-else>
        <VCarouselSlide
          v-for="i in 12"
          :key="i"
        >
          <ProductCardSkeleton />
        </VCarouselSlide>
      </template>
    </VCarousel>
  </div>
</template>
