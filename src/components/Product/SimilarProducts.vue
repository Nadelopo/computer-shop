<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAll } from '@/utils/queries/db'
import type { ProductRead } from '@/types/tables/products.types'

const route = useRoute()

const categoryId = Number(route.params.categoryId)
const category = route.params.category

const props = defineProps<{
  productPrice: number
  productId: number
}>()

const similarProducts = ref<ProductRead[]>([])

const loadSimilarProducts = async () => {
  const { data } = await getAll('products', {
    eq: [['categoryId', categoryId]],
    between: {
      column: 'price',
      begin: props.productPrice - 5000,
      end: props.productPrice + 5000
    },
    limit: 4,
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
  <div v-if="similarProducts.length" class="wrapper grid">
    <div>Похожие товары</div>
    <div class="similar__products">
      <div
        v-for="similarProduct in similarProducts"
        :key="similarProduct.id"
        class="similar"
      >
        <img :src="similarProduct.img" alt="" />
        <router-link
          :to="{
            name: 'Product',
            params: {
              category,
              categoryId,
              productId: similarProduct.id
            }
          }"
        >
          {{ similarProduct.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.similar__products
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 20px
  .similar
    height: 230px
    display: grid
    grid-template-rows: 80% 1fr
    justify-items: center
    img
      max-width: 160px
      max-height: 150px
    a
      transition: .2s
      font-size: 18px
      &:hover
        color: var(--color-text)
</style>
