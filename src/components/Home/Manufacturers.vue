<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VCarousel, VCarouselSlide } from '../UI'
import AppLink from '../AppLink.vue'
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
  <div>
    <div
      v-if="manufacturers.length"
      class="text-3xl font-semibold mb-4"
    >
      Бренды
    </div>
    <div class="manufacturers">
      <v-carousel
        :slides-per-view="8"
        :space-between="20"
        :breakpoints="carouselBreakpoints"
        show-arrows="hover"
        draggable
      >
        <template v-if="manufacturers.length">
          <v-carousel-slide
            v-for="(manufacturer, i) in manufacturers"
            :key="i"
          >
            <app-link
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
            </app-link>
          </v-carousel-slide>
        </template>
        <template v-else>
          <v-carousel-slide
            v-for="i in 8"
            :key="i"
            class="manufacturer__card"
          />
        </template>
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
