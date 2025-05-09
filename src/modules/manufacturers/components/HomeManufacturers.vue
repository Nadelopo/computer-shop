<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/modules/manufacturers'
import { VCarousel, VCarouselSlide } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import type { CarouselBreakpoints } from '@/components/UI/VCarousel/useFeatureBreakpoints'

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
      <VCarousel
        :slides-per-view="8"
        :space-between="20"
        :breakpoints="carouselBreakpoints"
        show-arrows="hover"
        draggable
      >
        <template v-if="manufacturers.length">
          <VCarouselSlide
            v-for="(manufacturer, i) in manufacturers"
            :key="i"
          >
            <AppLink
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
            </AppLink>
          </VCarouselSlide>
        </template>
        <template v-else>
          <VCarouselSlide
            v-for="i in 8"
            :key="i"
            class="manufacturer__card"
          />
        </template>
      </VCarousel>
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
