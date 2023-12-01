<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VCarousel, VCarouselSlide } from '../UI'
import type { CarouselBreakpoints } from '../UI/VCarousel/useFeatureBreakpoints'

const { manufacturers } = storeToRefs(useManufacturersStore())

const carouselBreakpoints: CarouselBreakpoints = {
  1536: { slidesPerView: 6 },
  1280: { slidesPerView: 5 },
  1024: { slidesPerView: 4 },
  768: { slidesPerView: 3 },
  640: { slidesPerView: 2 },
  360: { slidesPerView: 1 }
}
</script>

<template>
  <div
    v-if="manufacturers.length"
    class="mt-8"
  >
    <div class="text-3xl font-medium mb-4">Бренды</div>
    <div
      v-if="manufacturers.length"
      class="manufacturers"
    >
      <v-carousel
        :slides-per-view="8"
        :space-between="20"
        :breakpoints="carouselBreakpoints"
        show-arrows="hover"
        draggable
      >
        <v-carousel-slide
          v-for="manufacturer in manufacturers"
          :key="manufacturer.id"
        >
          <router-link
            :to="{
              name: 'Manufacturer',
              params: {
                id: manufacturer.id,
                title: manufacturer.title.toLowerCase()
              }
            }"
            class="manufacturer__card"
          >
            <img
              :src="manufacturer.img"
              alt=""
            />
          </router-link>
        </v-carousel-slide>
      </v-carousel>
    </div>
  </div>
</template>

<style scoped lang="sass">
.manufacturer__card
  border-radius: 4px
  background: #fff
  padding: 20px
  height: 75px
  width: 150px
  display: flex
  justify-content: center
  align-items: center
  img
    max-height: 100%
  // img
  //   max-height: 60px
</style>
