<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import Categories from '@/components/Comparison/Categories.vue'
import ProductsList from '@/components/Comparison/ProductsList.vue'
import Vloader from '@/components/UI/Vloader.vue'
import type { ProductRead } from '@/types/tables/products.types'
import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'
import type { Category, ComparisonProduct } from '@/types'

type Product = ProductRead & {
  categoryId: {
    id: number
    enTitle: string
    title: string
  }
}

const { user } = storeToRefs(useUserStore())

const categories = ref<Category[]>([])
const currentCategoryId = computed(() => {
  const idFromQuery = useRoute().query.category_id
  return idFromQuery ? Number(idFromQuery) : products.value[0]?.categoryId.id
})

const products = ref<ComparisonProduct[]>([])

const loader = ref<'loading' | 'empty' | 'success'>('loading')

const watcher = watch(
  () => user.value?.comparison.length,
  async () => {
    if (user.value) {
      loader.value = 'loading'

      const productData = await getAll<'products', Product>('products', {
        select: '*, categoryId(id, enTitle, title)',
        in: ['id', user.value.comparison]
      })

      const specificationsData = await getAll<
        'specifications',
        SpecificationReadWithDetails
      >('specifications', {
        select: '*, categorySpecificationsId(id, title, visible, units)',
        in: ['productId', user.value.comparison]
      })
      const modifiedProducts: ComparisonProduct[] = []
      if (productData && specificationsData) {
        for (const product of productData) {
          modifiedProducts.push({
            ...product,
            specifications: specificationsData.filter(
              (e) => e.productId === product.id
            )
          })

          if (!categories.value.some((e) => e.id === product.categoryId.id)) {
            categories.value.push({
              id: product.categoryId.id,
              title: product.categoryId.title,
              count: 1
            })
          } else {
            categories.value = categories.value.map((e) =>
              e.id === product.categoryId.id ? { ...e, count: e.count + 1 } : e
            )
          }
        }
        products.value = modifiedProducts
      }

      loader.value = products.value.length ? 'success' : 'empty'

      watcher()
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="container">
    <template v-if="loader === 'success'">
      <Categories
        :current-category-id="currentCategoryId"
        :categories="categories"
      />
      <ProductsList
        :current-category-id="currentCategoryId"
        :products="products"
      />
    </template>
    <div v-else-if="loader === 'loading'">
      <Vloader />
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
