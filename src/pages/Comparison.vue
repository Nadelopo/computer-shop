<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import Categories from '@/components/Comparison/Categories.vue'
import ComparisonList from '@/components/Comparison/ComparisonList.vue'
import Vloader from '@/components/UI/Vloader.vue'
import type { ProductRead } from '@/types/tables/products.types'
import type {
  Category,
  CategorySpecifications,
  ComparisonProduct,
  CurrentCategory
} from '@/components/Comparison/types'

type Product = ProductRead & {
  categories: {
    id: number
    enTitle: string
    title: string
  }
  manufacturers: {
    id: number
    title: string
  }
}

const { user } = storeToRefs(useUserStore())

const categories = ref<Category[]>([])
const currentCategory = computed((): CurrentCategory => {
  const idFromQuery = useRoute().query.category_id
  const id = idFromQuery ? Number(idFromQuery) : products.value[0]?.categoryId
  const specifications =
    categories.value.find((e) => e.id === id)?.specifications || []
  return { id, specifications }
})

const products = ref<ComparisonProduct[]>([])

const loading = ref<'loading' | 'empty' | 'success'>('loading')

const watcher = watch(
  () => user.value?.comparison.length,
  async () => {
    if (user.value) {
      loading.value = 'loading'

      const productData = await getAll<Product>('products', {
        select: '*, categories(id, enTitle, title), manufacturers(id, title)',
        in: ['id', user.value.comparison]
      })

      const specificationsData = await getAll('specifications', {
        in: ['productId', user.value.comparison],
        order: {
          value: 'categorySpecificationsId'
        }
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

          if (!categories.value.some((e) => e.id === product.categoryId)) {
            categories.value.push({
              id: product.categoryId,
              title: product.categories.title,
              count: 1,
              specifications: []
            })
          } else {
            categories.value = categories.value.map((e) =>
              e.id === product.categoryId ? { ...e, count: e.count + 1 } : e
            )
          }
        }

        products.value = modifiedProducts
        const categoriesSpecifications = await getAll<CategorySpecifications>(
          'category_specifications',
          {
            in: [
              'categoryId',
              [...new Set(products.value.map((e) => e.categoryId))]
            ],
            select: 'categoryId, title, units'
          }
        )
        for (const category of categories.value) {
          const categorySpecifications = categoriesSpecifications?.filter(
            (e) => e.categoryId === category.id
          )
          if (categorySpecifications) {
            category.specifications = categorySpecifications.map((e) => {
              e.title = e.title[0].toUpperCase() + e.title.slice(1)
              return e
            })
          }
        }
      }

      loading.value = products.value.length ? 'success' : 'empty'

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
    <template v-if="loading === 'success' && currentCategory !== undefined">
      <Categories
        :current-category="currentCategory"
        :categories="categories"
      />
      <ComparisonList
        :current-category="currentCategory"
        :products="products"
        :categories="categories"
      />
    </template>
    <div v-else-if="loading === 'loading'">
      <Vloader />
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
