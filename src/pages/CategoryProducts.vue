<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useFilterStore } from '@/stores/filterStore'
import { useCustomRouter, useCustomRoute } from '@/utils/customRouter'
import { VPagination, VButton } from '@/components/UI'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import Search from '@/components/CategoryProducts/Search.vue'
import Sort from '@/components/CategoryProducts/Sort.vue'
import Filters from '@/components/CategoryProducts/Filters.vue'
import ProductBlockSkeleton from '@/components/CategoryProducts/ProductBlockSkeleton.vue'
import FiltersMobile from '@/components/CategoryProducts/Filters.mobile.vue'
import { getValuesFromQuery } from '@/components/CategoryProducts/useFeatureStaticFilter'
import type { Loading } from '@/types'

type SortType = keyof typeof sortAscents
function isSortType(key: string): key is SortType {
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
  sortColumn
} = storeToRefs(useFilterStore())
const {
  warranty,
  productsPrice,
  manufacturer,
  setFilteredProducts,
  sortAscents
} = useFilterStore()

const router = useCustomRouter()

const styles = ref('card__disable')

onUnmounted(() => {
  warranty.clear()
  productsPrice.clear()
  manufacturer.clear()
  productCount.value = 0
  specificationsValues.value = []
  loading.value = 'loading'
})

watch(
  () => products.value.length,
  async (cur) => {
    await nextTick()
    if (cur) {
      styles.value = 'card__active'
    } else {
      styles.value = 'card__disable'
    }
  }
)

const loadingProperties = ref<Loading>('loading')
const { getCategorySpecifications } = useCategoriesStore()
const manufacturers = ref<
  { manufacturerId: number; manufacturerTitle: string }[]
>([])
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
  manufacturers.value = manufacturersData
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

const route = useCustomRoute('CategoryProducts')
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
  const querySort =
    typeof query.sort === 'string' ? query.sort.split('_') : null
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
  manufacturer.setValues(
    route.query.manufacturer,
    manufacturers.value.map((e) => ({
      id: e.manufacturerId,
      title: e.manufacturerTitle
    }))
  )
  for (const value of specificationsValues.value) {
    const field = query[value.enTitle]
    const queryValues = getValuesFromQuery(field, value.type === 'number')
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
            <v-button @click="isFiltersMobileOpen = true"> фильтры </v-button>
          </div>
        </div>
        <template v-if="loading === 'success'">
          <div class="product__list">
            <product-block
              v-for="product in products"
              :key="product.id"
              :item="product"
              :class="styles"
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
            <product-block-skeleton />
          </template>
        </div>
        <template v-else>
          <div class="font-bold text-center text-2xl mt-8">
            К сожалению, по вашему запросу ничего не найдено.
          </div>
        </template>
        <v-pagination
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

.card__active
  transform: scale(1)
  opacity: 1
  transition: .3s

.card__disable
  transform: scale(0.6)
  opacity: 0
  transition: .3s
</style>
