<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAll } from '@/db/queries/tables'
import { useCustomRoute } from '@/utils/customRouter'
import { VCarousel, VCarouselSlide } from '../UI'
import AppLink from '../AppLink.vue'
import type { ProductRead } from '@/types/tables/products.types'

const route = useCustomRoute('Product')
const categoryId = Number(route.params.categoryId)
const { category } = route.params

const props = defineProps<{
  productPrice: number
  productId: number
}>()

const similarProducts = ref<ProductRead[]>([])

const loadSimilarProducts = async () => {
  const { data } = await getAll('products', {
    match: { categoryId },
    between: [
      {
        column: 'price',
        begin: props.productPrice - 5000,
        end: props.productPrice + 5000
      }
    ],
    limit: 5,
    neq: ['id', props.productId]
  })
  if (data) {
    similarProducts.value = data
  }
}

loadSimilarProducts()

watch(() => props.productId, loadSimilarProducts)
</script>

<template>
  <div
    v-if="similarProducts.length"
    class="wrapper grid"
  >
    <div>Похожие товары</div>
    <v-carousel
      draggable
      show-arrows="hover"
      :slides-per-view="4"
      :breakpoints="{
        1280: {
          slidesPerView: 3
        },
        1024: {
          slidesPerView: 2
        },
        486: {
          slidesPerView: 1
        }
      }"
    >
      <v-carousel-slide
        v-for="similarProduct in similarProducts"
        :key="similarProduct.id"
      >
        <app-link
          :to="{
            name: 'Product',
            params: {
              category,
              categoryId,
              productId: similarProduct.id
            }
          }"
          class="similar"
        >
          <img
            :src="similarProduct.img[0]"
            alt=""
          />
          <span> {{ similarProduct.title }}</span>
        </app-link>
      </v-carousel-slide>
    </v-carousel>
  </div>
</template>

<style scoped lang="sass">
.similar
  min-height: 230px
  display: grid
  grid-template-rows: 200px 1fr
  justify-items: center
  &:hover
    span
      color: var(--main-semi-light)
  img
    max-width: 160px
    max-height: 150px
  span
    transition: .2s
    font-size: 18px
</style>
