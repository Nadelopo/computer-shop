<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getOneById, updateOneById } from '@/utils/queries/db'
import { useProductsStore } from '@/stores/productsStore'
import ProductHeader from '@/components/Product/ProductHeader.vue'
import ProductSpecifications from '@/components/Product/ProductSpecifications.vue'
import SimilarProducts from '@/components/Product/SimilarProducts.vue'
import ProductReviews from '@/components/Product/ProductReviews.vue'
import ProductCard from '@/components/ProductCard.vue'
import { VLoader, VCarousel, VCarouselSlide } from '@/components/UI'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { ProductCardData } from './Favourites/types'

export type UpdateProductRating = {
  countReviews: number
  rating: number
}

const { getProduct } = useProductsStore()

const route = useRoute()

const product = ref<ProductWithSpecifications>()
const loading = ref<Loading>('loading')

const loadData = async () => {
  window.scroll(0, 0)
  const productId = Number(route.params.productId)
  loading.value = 'loading'
  const data = await getProduct(productId)
  if (data.value) {
    data.value.specifications = data.value.specifications.map((e) => {
      const title = e.category_specifications.title
      e.category_specifications.title =
        title.charAt(0).toUpperCase() + title.slice(1)
      return e
    })
    product.value = data.value
    loading.value = 'success'
    updateOneById('products', product.value.id, {
      popularity: product.value.popularity + 1
    })
  }
}

watch(() => route.params.productId, loadData, {
  immediate: true,
  flush: 'post'
})

const updateProductRating = (newData: UpdateProductRating) => {
  if (product.value) {
    product.value = {
      ...product.value,
      rating: newData.rating,
      countReviews: newData.countReviews
    }
  }
}

const test = ref<ProductCardData | null>(null)
onMounted(async () => {
  test.value = await getOneById('products', 6, '*, categories(id, enTitle)')
})

// const t = ref(500)
// setTimeout(() => {
//   t.value = 1000
// }, 2000)
// setTimeout(() => {
//   t.value = 1500
// }, 4100)
// setTimeout(() => {
//   t.value = 2000
// }, 7100)
</script>

<template>
  <div class="container">
    <v-carousel
      v-if="test"
      class="mb-4 py-6 bg-blue-600"
      :slides-per-view="4"
      :space-between="10"
      :count-swipe-slides="2"
      draggable
      show-arrows
      show-dots
      direction="horizontal"
    >
      <v-carousel-slide v-for="i in 10" :key="i" class="flex justify-center">
        <span>{{ i }}</span>
        <ProductCard :item="test" />
      </v-carousel-slide>
    </v-carousel>

    <div v-if="product && loading === 'success'">
      <ProductHeader :product="product" />
      <div class="wrapper grid">
        <div>Описание</div>
        <div class="text-xl text-justify leading-9">
          {{ product.description }}
        </div>
      </div>
      <ProductSpecifications :product="product" />
      <SimilarProducts
        :product-price="product.price"
        :product-id="product.id"
      />
      <ProductReviews
        :product-id="product.id"
        :count-reviews="product.countReviews"
        :product-rating="product.rating"
        @update-product-rating="updateProductRating"
      />
    </div>
    <v-loader v-else class="h-[75vh]" />
  </div>
</template>

<style scoped lang="sass">

:deep(.wrapper)
  background: #fff
  border-radius: 8px
  border: 1px solid #d9d9d9
  padding: 30px
  margin-bottom: 20px
  &.grid
    display: grid
    grid-template-columns: 250px 1fr
    gap: 10px
    & > div:first-child
      font-size: 30px
    & > div:last-child
      padding: 0 10px 0 10px

.description
  text-align: justify
  font-size: 20px
  line-height: 36px
</style>
