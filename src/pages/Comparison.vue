<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll, updateOneById } from '@/db/queries/tables'
import { localStorageSet } from '@/utils/localStorage'
import ComparisonList from '@/components/Comparison/ComparisonList.vue'
import { VTabs, VCheckbox, VLoader, VButton } from '@/components/UI'
import { TrashSvg } from '@/assets/icons'
import type {
  Category,
  CategorySpecifications,
  ComparisonProduct
} from '@/components/Comparison/types'
import type { Loading } from '@/types'

const route = useRoute()
const router = useRouter()

const { user } = storeToRefs(useUserStore())
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

onBeforeMount(async () => {
  await setUserListsValue()
  if (userLists.comparison.length === 0) {
    loading.value = 'empty'
    return
  }

  const [
    { data: productData, error: errorData },
    { data: specificationsData, error: errorSpecifications }
  ] = await Promise.all([
    getAll('products', {
      select: '*, categories(id, title), manufacturers(id, title)',
      in: ['id', userLists.comparison]
    }),
    getAll('specifications', {
      in: ['productId', userLists.comparison],
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
        in: [
          'categoryId',
          [...new Set(products.value.map((e) => e.categoryId))]
        ],
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

const clearList = async () => {
  const remainProducts = products.value.filter(
    (e) => e.categoryId !== currentCategoryId.value
  )
  const remainProductIds = remainProducts.map((e) => e.id)

  if (user.value) {
    const { data, error } = await updateOneById('users', user.value.id, {
      comparison: remainProductIds
    })
    if (error) {
      loading.value = 'error'
      return
    }
    user.value.comparison = data.comparison
    userLists.comparison = data.comparison
  } else {
    localStorageSet('compareList', remainProductIds)
    userLists.comparison = remainProductIds
  }

  products.value = remainProducts
  categories.value = categories.value.filter(
    (e) => e.id !== currentCategoryId.value
  )
  currentCategoryId.value = remainProducts.length
    ? categories.value[0].id
    : null

  let query = {}
  if (currentCategoryId.value) {
    query = { category_id: String(currentCategoryId.value) }
  }
  router.push({ query })

  loading.value = products.value.length ? 'success' : 'empty'
}

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
      <div class="compare__actions">
        <v-button
          variant="noactive"
          class="button"
          @click="clearList"
        >
          <trash-svg />
          очистить список
        </v-button>
        <v-checkbox
          :id="1"
          v-model="showDifferences"
          title="Показывать только отличия"
        />
      </div>
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

<style scoped lang="sass">
.compare__actions
  display: flex
  gap: 16px
  align-items: center
  margin-bottom: 16px
  @media (width < 500px)
    flex-direction: column-reverse
    align-items: start
</style>
