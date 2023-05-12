<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import ProductHeader from '@/components/Product/ProductHeader.vue'
import ProductSpecifications from '@/components/Product/ProductSpecifications.vue'
import SimilarProducts from '@/components/Product/SimilarProducts.vue'
import ProductReviews from '@/components/Product/ProductReviews.vue'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import { updateOne } from '@/utils/queries/db'

export type UpdateProductRating = {
  countReviews: number
  rating: number
}

const { getProduct } = useProductsStore()

const route = useRoute()

const product = ref<ProductWithSpecifications>()

const loadData = async () => {
  window.scroll(0, 0)
  const productId = Number(route.params.productId)
  const data = await getProduct(productId)
  if (data.value) {
    data.value.specifications = data.value.specifications
      .map((e) => {
        const title = e.categorySpecificationsId.title
        e.categorySpecificationsId.title =
          title.charAt(0).toUpperCase() + title.slice(1)
        return e
      })
      .sort((a, b) =>
        a.categorySpecificationsId.title.localeCompare(
          b.categorySpecificationsId.title
        )
      )
    product.value = data.value
    updateOne('products', product.value.id, {
      popularity: product.value.popularity + 1
    })
  }
}

loadData()

watch(() => route.params.productId, loadData)

const updateProductRating = (newData: UpdateProductRating) => {
  if (product.value) {
    product.value = {
      ...product.value,
      rating: newData.rating,
      countReviews: newData.countReviews
    }
  }
}
</script>

<template>
  <div v-if="product" class="container">
    <ProductHeader :product="product" />
    <div class="wrapper grid">
      <div>Описание</div>
      <div class="text-xl text-justify leading-9">
        {{ product.description }}
      </div>
    </div>
    <ProductSpecifications :product="product" />
    <SimilarProducts :product-price="product.price" :product-id="product.id" />
    <ProductReviews
      :product-id="product.id"
      :count-reviews="product.countReviews"
      :product-rating="product.rating"
      @update-product-rating="updateProductRating"
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