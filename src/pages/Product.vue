<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { useLocalStorage } from '@/utils/localStorage'
import Header from '@/components/Product/Header.vue'
import ProductSpecifications from '@/components/Product/ProductSpecifications.vue'
import SimilarProducts from '@/components/Product/SimilarProducts.vue'
import Reviews from '@/components/Product/Reviews.vue'
import { VLoader } from '@/components/UI'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

export type UpdateProductRating = {
  rating: number
}

const route = useRoute()
const product = ref<ProductWithSpecifications>()
const loading = ref<Loading>('loading')

const loadData = async () => {
  window.scroll(0, 0)
  const productId = Number(route.params.productId)
  loading.value = 'loading'
  const { data, error } = await getOneById(
    'products',
    productId,
    '*, categories(id, enTitle), manufacturers(id, title), specifications(*, category_specifications!inner(id, title, units, visible, type))',
    {
      order: ['categorySpecificationsId', { foreignTable: 'specifications' }]
    }
  )
  if (error) {
    loading.value = 'error'
    return
  }
  data.specifications = data.specifications.map((e) => {
    const title = e.category_specifications.title
    e.category_specifications.title =
      title.charAt(0).toUpperCase() + title.slice(1)
    return e
  })
  product.value = data
  loading.value = 'success'
  updateOneById('products', product.value.id, {
    popularity: product.value.popularity + 1
  })
}

watch(() => route.params.productId, loadData, {
  immediate: true,
  flush: 'post'
})

const updateProductRating = (newData: UpdateProductRating) => {
  if (product.value) {
    product.value = {
      ...product.value,
      rating: newData.rating
    }
  }
}
const recentlyProductsStorage = useLocalStorage<number[]>('recentlyProducts')
onBeforeMount(() => {
  let recentlyProducts = recentlyProductsStorage.get() ?? []
  const productId = Number(route.params.productId)
  if (recentlyProducts.includes(productId)) {
    recentlyProducts = recentlyProducts.filter((p) => p !== productId)
  }
  recentlyProducts.unshift(productId)
  if (recentlyProducts.length > 12) {
    recentlyProducts.pop()
  }
  recentlyProductsStorage.set(recentlyProducts)
})
</script>

<template>
  <div class="container">
    <div v-if="product && loading === 'success'">
      <Header :product="product" />
      <div class="wrapper grid">
        <div>Описание</div>
        <div class="description">
          {{ product.description }}
        </div>
      </div>
      <product-specifications :product="product" />
      <similar-products
        :product-price="product.price"
        :product-id="product.id"
      />
      <Reviews
        :product-id="product.id"
        @update-product-rating="updateProductRating"
      />
    </div>
    <v-loader
      v-else
      class="h-[50vh]"
    />
  </div>
</template>

<style scoped lang="sass">

:deep(.wrapper)
  background: #fff
  border-radius: 8px
  border: 1px solid #d9d9d9
  padding: 30px
  margin-bottom: 20px
  @media(width < 768px)
    padding: 10px
  &.grid
    display: grid
    grid-template-columns: 250px 1fr
    gap: 10px
    & > div:first-child
      font-size: 30px
      @media (768px <= width < 1024px )
        font-size: 22px
    & > div:last-child
      @media (width < 768px)
        padding: 0
    @media (width < 1024px)
      grid-template-columns: 180px 1fr
    @media (width < 768px)
      grid-template-columns: 1fr
      grid-template-rows: auto 1fr


.description
  text-align: justify
  font-size: 20px
  line-height: 36px
  @media (width < 768px)
    font-size: 16px
    line-height: 30px
</style>
