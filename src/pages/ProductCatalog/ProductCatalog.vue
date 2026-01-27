<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { supabase } from '@/shared/api'
import { useCategoriesStore } from '@/modules/categories'
import { useCustomRouter, useCustomRoute } from '@/shared/composables/customRouter'
import { VPagination, VButton } from '@/shared/components/UI'
import ProductBlock from '@/pages/ProductCatalog/components/ProductBlock.vue'
import Search from '@/pages/ProductCatalog/components/Search.vue'
import Sort from '@/pages/ProductCatalog/components/Sort.vue'
import Filters from '@/pages/ProductCatalog/components/Filters.vue'
import ProductBlockSkeleton from '@/pages/ProductCatalog/components/ProductBlockSkeleton.vue'
import FiltersMobile from '@/pages/ProductCatalog/components/Filters.mobile.vue'
import { getValuesFromQuery } from '@/pages/ProductCatalog/components/useFeatureStaticFilter'
import type { Loading } from '@/shared/types'
import {
  createProductCatalogContext,
  type SortType
} from './composables/useProductCatalogContext'

const isSortType = (key: string): key is SortType => {
  if (key in sortAscents) {
    return true
  }
  return false
}

const {
  products,
  loading,
  productCount,
  currentPage,
  limit,
  specificationsValues,
  search,
  sortColumn,
  productsPrice,
  manufacturer,
  warranty,
  sortAscents,
  setFilteredProducts,
  manufacturersVariants
} = createProductCatalogContext()

const router = useCustomRouter()

const loadingProperties = ref<Loading>('loading')
const { getCategorySpecifications } = useCategoriesStore()

const setSpecificationsValues = async (categoryId: number) => {
  const [{ data }, { data: manufacturersData }] = await Promise.all([
    getCategorySpecifications(categoryId),
    supabase
      .from('distinct_categories')
      .select('manufacturerId, manufacturerTitle')
      .eq('id', categoryId)
      .order('manufacturerId')
  ])
  if (!data || !manufacturersData) {
    loadingProperties.value = 'error'
    return
  }

  manufacturersVariants.value = manufacturersData.map((e) => ({
    id: e.manufacturerId,
    title: e.manufacturerTitle
  }))

  specificationsValues.value = data.map((e) => {
    const { id, enTitle, visible } = e
    if (e.type === 'number') {
      const { min, max, step } = e
      return {
        id,
        enTitle,
        title: e.title[0].toUpperCase() + e.title.slice(1),
        type: e.type,
        min,
        max,
        minValue: min,
        maxValue: max,
        step,
        visible
      }
    }
    return {
      id,
      enTitle,
      title: e.title[0].toUpperCase() + e.title.slice(1),
      type: e.type,
      variantsValues: e.variantsValues,
      values: [],
      visible
    }
  })
  await setFilterProperties()
  setFilteredProducts(categoryId)
}

const route = useCustomRoute('ProductCatalog')
watch(
  () => route.params.id,
  (id) => {
    setSpecificationsValues(Number(id))
  },
  { immediate: true }
)

const setFilterProperties = async () => {
  const { query } = route
  currentPage.value = query.page ? Number(query.page) - 1 : 0
  search.value = query.q ? String(query.q) : ''
  const querySort = typeof query.sort === 'string' ? query.sort.split('_') : null
  if (querySort) {
    const querySortTitle = querySort[0]
    const querySortValue: boolean = !(querySort[1] === 'false')
    if (isSortType(querySortTitle)) {
      sortAscents[querySortTitle] = querySortValue
      sortColumn.value = querySortTitle
    }
  }
  productsPrice.setValues(query.price)
  warranty.setValues(query.warranty)
  manufacturer.setValues(route.query.manufacturer)
  for (const value of specificationsValues.value) {
    const field = query[value.enTitle]
    const queryValues = getValuesFromQuery(
      field,
      value.type === 'number' ? 'number' : 'string'
    )
    if (!queryValues) {
      if (value.type === 'number') {
        value.minValue = value.min
        value.maxValue = value.max
      } else {
        value.values = []
      }
      continue
    }
    if (value.type === 'number') {
      if ('min' in queryValues) {
        value.minValue = queryValues.min
        value.maxValue = queryValues.max
      }
    } else if ('values' in queryValues) {
      value.values = queryValues.values
    }
  }
  loadingProperties.value = 'success'
}

let routeParamCategory = route.params.category
watch(
  () => route.query,
  async () => {
    if (route.params.category !== routeParamCategory) {
      routeParamCategory = route.params.category
      return
    }
    loading.value = 'loading'
    await setFilterProperties()
    setFilteredProducts(Number(route.params.id))
  },
  { flush: 'post' }
)

const clickOnPaginate = () => {
  window.scrollTo(0, 0)
  router.push({ query: { ...route.query, page: currentPage.value + 1 } })
}

const isFiltersMobileOpen = ref(false)
const isSmallScreen = useMediaQuery('(max-width: 1024px)')
</script>

<template>
  <div class="container">
    <div class="grid">
      <Filters
        v-if="!isSmallScreen"
        :loading-properties="loadingProperties"
      />
      <Teleport to="body">
        <Transition name="sidebar">
          <FiltersMobile
            v-if="isFiltersMobileOpen"
            :loading-properties="loadingProperties"
            @close="isFiltersMobileOpen = false"
          />
        </Transition>
      </Teleport>
      <div>
        <Search />
        <div class="flex justify-between items-center gap-10 mt-5">
          <Sort class="w-full" />
          <div class="lg:hidden block">
            <VButton @click="isFiltersMobileOpen = true"> фильтры </VButton>
          </div>
        </div>
        <template v-if="loading === 'success'">
          <div class="product__list">
            <ProductBlock
              v-for="product in products"
              :key="product.id"
              :item="product"
            />
          </div>
        </template>
        <div
          v-else-if="loading === 'loading'"
          class="flex flex-col gap-y-[30px] mb-10 mt-5"
        >
          <template
            v-for="_ in limit"
            :key="_"
          >
            <ProductBlockSkeleton />
          </template>
        </div>
        <template v-else>
          <div class="font-bold text-center text-2xl mt-8">
            К сожалению, по вашему запросу ничего не найдено.
          </div>
        </template>
        <VPagination
          v-model="currentPage"
          :item-count="productCount"
          :page-size="limit"
          class="mb-8"
          @click="clickOnPaginate"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 290px 1fr
  gap: 20px
  @media (width < 1280px)
    grid-template-columns: 26% 1fr
  @media (width < 1024px)
    grid-template-columns: 1fr

.product__list
  margin-top: 20px
  display: flex
  flex-direction: column
  gap: 30px
  position: relative
  margin-bottom: 40px
</style>
