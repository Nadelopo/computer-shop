<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll, updateOne } from '@/utils/queries/db'
import { localStorageGet, localStorageSet } from '@/utils/localStorage'
import { useUserStore } from '@/stores/userStore'
import ComparisonList from '@/components/Comparison/ComparisonList.vue'
import VTabs from '@/components/UI/VTabs.vue'
import Checkbox from '@/components/UI/Checkbox.vue'
import VLoader from '@/components/UI/VLoader.vue'
import VButton from '@/components/UI/VButton.vue'
import TrashSVG from '@/assets/icons/trash.svg?component'
import type { ProductReadWithDetails } from '@/types/tables/products.types'
import type {
  Category,
  CategorySpecifications,
  ComparisonProduct
} from '@/components/Comparison/types'
import type { Loading } from '@/types'
import { supabase } from '@/supabase'

type Product = Omit<ProductReadWithDetails, 'categories'> & {
  categories: {
    id: number
    title: string
  }
}

const route = useRoute()
const router = useRouter()

const { user } = storeToRefs(useUserStore())

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

const watcher = watch(
  () => user.value?.comparison.length,
  async () => {
    const isUser = supabase.auth.user()
    let productIds: number[] = []
    if (isUser) {
      productIds = user.value?.comparison || []
    } else {
      const storageProductIds = localStorageGet<number[]>('compareList') || []
      productIds = storageProductIds
    }

    if (productIds.length === 0) {
      loading.value = 'empty'
      return
    }
    loading.value = 'loading'

    const productData = await getAll<Product>('products', {
      select: '*, categories(id, title), manufacturers(id, title)',
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

      const categoryId = Number(route.query.category_id)
      if (categories.value.some((e) => e.id === categoryId)) {
        currentCategoryId.value = categoryId
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
    if (!isUser) {
      watcher()
    } else {
      if ((user.value?.comparison.length ?? 0) > 0) {
        watcher()
      }
    }
  },
  { immediate: true }
)

const clear = async () => {
  loading.value = 'loading'

  const remainProducts = products.value.filter(
    (e) => e.categoryId !== currentCategoryId.value
  )

  if (user.value) {
    const data = await updateOne('users', user.value.id, {
      comparison: remainProducts.map((e) => e.id)
    })
    if (data) {
      user.value.comparison = data.comparison
    }
  } else {
    localStorageSet(
      'compareList',
      remainProducts.map((e) => e.id)
    )
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
      <div class="comparre__actions">
        <v-button variant="noactive" class="button" @click="clear">
          <TrashSVG />
          очистить список
        </v-button>
        <Checkbox
          :id="1"
          v-model="showDifferences"
          title="Показывать только отличия"
        />
      </div>
      <ComparisonList
        :current-category-id="currentCategoryId"
        :current-category-specifications="currentCategorySpecifications"
        :products="products"
        :show-differences="showDifferences"
      />
    </template>
    <div v-else-if="loading === 'loading'">
      <v-loader />
    </div>
    <div v-else class="font-bold text-2xl text-center">
      Нет товаров для сравнения
    </div>
  </div>
</template>

<style scoped lang="sass">
.comparre__actions
  display: flex
  gap: 16px
  align-items: center
  margin-bottom: 16px
  @media (width < 500px)
    flex-direction: column-reverse
    align-items: start
</style>
