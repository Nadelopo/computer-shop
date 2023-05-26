<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import Categories from '@/components/Comparison/Categories.vue'
import type {
  ProductWithSpecifications,
  ProductRead
} from '@/types/tables/products.types'
import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'
import type { Category } from '@/types'

type ComparisonProduct = Omit<ProductWithSpecifications, 'manufacturerId'> & {
  manufacturerId: number
}

type Product = ProductRead & {
  categoryId: {
    id: number
    enTitle: string
    title: string
  }
}

const { user } = storeToRefs(useUserStore())

const route = useRoute()

const categories = ref<Category[]>([])
const currentCategoryId = ref<number | null>(null)

const products = ref<ComparisonProduct[]>([])
const categoryProducts = computed((): ComparisonProduct[] => {
  return products.value.filter(
    (e) => e.categoryId.id === currentCategoryId.value
  )
})

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
      currentCategoryId.value = route.query.category_id
        ? Number(route.query.category_id)
        : products.value[0].categoryId.id

      loader.value = products.value.length ? 'success' : 'empty'

      watcher()
    }
  },
  {
    immediate: true
  }
)
watch(
  () => route.query.category_id,
  () => {
    currentCategoryId.value = route.query.category_id
      ? Number(route.query.category_id)
      : null
  }
)
</script>

<template>
  <div class="container">
    <Categories v-model="currentCategoryId" :categories="categories" />
    <div class="comparison">
      <div v-for="product in categoryProducts" :key="product.id" class="cell">
        <div>{{ product.name }}</div>
        <div>{{ product.warranty }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.comparison
  // display: grid
  // grid-template-columns: repeat(auto-fit, 400px)
  // grid-auto-flow: column
  // overflow: hidden
  display: flex
  .cell
    width: 235px
    min-width: 235px
    padding: 10px 35px 10px 0px
</style>
