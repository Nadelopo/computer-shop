<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/db/supabase'
import type { ProductRead } from '@/modules/products/model/products.types'
import { useCustomRoute } from '@/shared/composables/customRouter'
import { VCarousel, VCarouselSlide } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'

const route = useCustomRoute('Product')
const categoryId = Number(route.params.categoryId)
const { category } = route.params

const props = defineProps<{
  productPrice: number
  productId: number
}>()

const similarProducts = ref<ProductRead[]>([])

const loadSimilarProducts = async () => {
  const { data } = await supabase
    .from('products')
    .select()
    .eq('categoryId', categoryId)
    .neq('id', props.productId)
    .gte('price', props.productPrice - 5000)
    .lte('price', props.productPrice + 5000)
    .limit(5)
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
    <VCarousel
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
      <VCarouselSlide
        v-for="similarProduct in similarProducts"
        :key="similarProduct.id"
      >
        <AppLink
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
        </AppLink>
      </VCarouselSlide>
    </VCarousel>
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
