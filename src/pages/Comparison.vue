<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { useLocalStorage } from '@/utils/localStorage'
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
const loading = ref<Loading>('success')
const route = useRoute()
const router = useRouter()
const loadData = async () => {
  if (loading.value === 'loading') return
  loading.value = 'loading'
  await setUserListsValue()
  const queryIds = route.query.ids ? String(route.query.ids) : null
  const ids = queryIds?.split(' ').map(Number) ?? userLists.comparison
  if (ids.length === 0 || (!ids && userLists.comparison.length === 0)) {
    loading.value = 'empty'
    return
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      '*, categories(id, title), manufacturers(id, title), specifications(*)'
    )
    .in('id', ids)
    .order('categorySpecificationsId', { referencedTable: 'specifications' })

  if (error) {
    loading.value = 'error'
    return
  }
  products.value = data
  categories.value = []

  for (const product of data.sort((a, b) => b.categoryId - a.categoryId)) {
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
    router.replace({ query: { category_id: currentCategoryId.value } })
  }

  const { data: categoriesSpecifications, error: errorSpecifications } =
    await supabase
      .from('category_specifications')
      .select('condition, title, units, id, categories(id, enTitle)')
      .in(
        'category_id',
        categories.value.map((c) => c.id)
      )
  if (errorSpecifications) {
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

  loading.value = 'success'
}
onBeforeMount(loadData)
useLocalStorage('compareList', { onChange: loadData })

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
