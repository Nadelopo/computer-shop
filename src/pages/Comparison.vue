<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import VTabs from '@/components/UI/VTabs.vue'
import ComparisonList from '@/components/Comparison/ComparisonList.vue'
import VLoader from '@/components/UI/VLoader.vue'
import type { ProductRead } from '@/types/tables/products.types'
import type {
  Category,
  CategorySpecifications,
  ComparisonProduct,
  CurrentCategory
} from '@/components/Comparison/types'
import { localStorageGet } from '@/utils/localStorage'

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

const route = useRoute()

const { user } = storeToRefs(useUserStore())

const categories = ref<Category[]>([])

const currentCategoryId = ref<number | null>(null)
const currentCategory = computed((): CurrentCategory => {
  const specifications =
    categories.value.find((e) => e.id === currentCategoryId.value)
      ?.specifications || []
  return { id: currentCategoryId.value, specifications }
})

const products = ref<ComparisonProduct[]>([])

const loading = ref<'loading' | 'empty' | 'success'>('loading')

const watcher = watch(
  () => user.value?.comparison.length,
  async () => {
    const storageProductIds = localStorageGet<number[]>('compareList') || []
    const productIds = user.value ? user.value.comparison : storageProductIds
    if (productIds.length === 0) {
      loading.value = 'empty'
      return
    }
    loading.value = 'loading'

    const productData = await getAll<Product>('products', {
      select: '*, categories(id, enTitle, title), manufacturers(id, title)',
      in: ['id', productIds]
    })

    const specificationsData = await getAll('specifications', {
      in: ['productId', productIds],
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
      console.log(productIds)

      const categoryId = route.query.category_id
      if (categoryId) {
        currentCategoryId.value = Number(categoryId)
      } else {
        currentCategoryId.value = categories.value[0].id
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
  },
  {
    immediate: true
  }
)

watch(
  () => route.query.category_id,
  (categoryId) => {
    if (categoryId) {
      currentCategoryId.value = Number(categoryId)
    }
  }
)
</script>

<template>
  <div class="container">
    <template v-if="loading === 'success'">
      <v-tabs
        v-model="currentCategoryId"
        :options="
          categories.map((e) => ({
            title: e.title,
            value: e.id,
            count: e.count
          }))
        "
        query-param-name="category_id"
      />
      <ComparisonList
        :current-category="currentCategory"
        :products="products"
        :categories="categories"
      />
    </template>
    <div v-else-if="loading === 'loading'">
      <v-loader />
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
