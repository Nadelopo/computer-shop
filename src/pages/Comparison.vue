<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/db/queries/tables'
import ComparisonList from '@/components/Comparison/ComparisonList.vue'
import ActionsWithList from '@/components/Comparison/ActionsWithList.vue'
import { VTabs, VLoader } from '@/components/UI'
import type {
  Category,
  CategorySpecifications,
  ComparisonProduct
} from '@/components/Comparison/types'
import type { Loading } from '@/types'

const { userLists, setUserListsValue, deleteItemFromUserList } = useUserStore()
const categories = ref<Category[]>([])
const currentCategoryId = ref<number | null>(null)

const currentCategorySpecifications = computed((): CategorySpecifications[] => {
  const specifications = categories.value.find(
    (e) => e.id === currentCategoryId.value
  )?.specifications
  return specifications || []
})

const products = ref<ComparisonProduct[]>([])
const showDifferences = ref(false)
const loading = ref<Loading>('loading')
const route = useRoute()
onBeforeMount(async () => {
  await setUserListsValue()
  const queryIds = route.query.ids ? String(route.query.ids) : null
  const ids = queryIds?.split(' ').map(Number) ?? userLists.comparison
  if (ids.length === 0 || (!ids && userLists.comparison.length === 0)) {
    loading.value = 'empty'
    return
  }
  const [
    { data: productData, error: errorData },
    { data: specificationsData, error: errorSpecifications }
  ] = await Promise.all([
    getAll('products', {
      select: '*, categories(id, title), manufacturers(id, title)',
      in: { id: ids }
    }),
    getAll('specifications', {
      in: { productId: ids },
      order: ['categorySpecificationsId']
    })
  ])
  if (errorData || errorSpecifications) {
    loading.value = 'error'
    return
  }

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

    const categoryId = Number(route.query.category_id)
    if (categories.value.some((e) => e.id === categoryId)) {
      currentCategoryId.value = categoryId
    } else {
      currentCategoryId.value = categories.value[0].id
    }

    products.value = modifiedProducts
    const { data: categoriesSpecifications, error } = await getAll(
      'category_specifications',
      {
        in: {
          categoryId: [...new Set(products.value.map((e) => e.categoryId))]
        },
        select: 'condition, title, units, id, categories(id, enTitle)'
      }
    )
    if (error) {
      loading.value = 'error'
      return
    }

    for (const category of categories.value) {
      const categorySpecifications = categoriesSpecifications.filter(
        (e) => e.categories.id === category.id
      )
      if (categorySpecifications) {
        category.specifications = categorySpecifications.map((e) => {
          e.title = e.title[0].toUpperCase() + e.title.slice(1)
          return e
        })
      }
    }
  }

  loading.value = 'success'
})

// нужно следить за route т.к. пользователь может перемещаться по истории, без кликов на нужную категорию
watch(
  () => route.query.category_id,
  (categoryId) => {
    if (categoryId) {
      currentCategoryId.value = Number(categoryId)
    }
  }
)

const deleteItem = async (item: ComparisonProduct) => {
  const { error } = await deleteItemFromUserList('comparison', item.id)
  if (error) return
  products.value = products.value.filter((e) => e.id !== item.id)
  categories.value = categories.value
    .map((e) => (e.id === item.categoryId ? { ...e, count: e.count - 1 } : e))
    .filter((e) => e.count > 0)
  if (categories.value.length === 0) {
    loading.value = 'empty'
    currentCategoryId.value = null
    return
  }
  currentCategoryId.value = categories.value[0].id
}
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
      <actions-with-list
        v-model="showDifferences"
        v-model:products="products"
        v-model:current-category-id="currentCategoryId"
        v-model:categories="categories"
        @update-loading="loading = $event"
      />

      <comparison-list
        :current-category-id="currentCategoryId"
        :current-category-specifications="currentCategorySpecifications"
        :products="products"
        :show-differences="showDifferences"
        @delete-item="deleteItem"
      />
    </template>
    <div v-else-if="loading === 'loading'">
      <v-loader />
    </div>
    <div
      v-else
      class="font-bold text-2xl text-center"
    >
      Нет товаров для сравнения
    </div>
  </div>
</template>
