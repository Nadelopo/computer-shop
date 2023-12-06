<script setup lang="ts">
import { nextTick, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useFilterStore } from '@/stores/filterStore'
import { VButton } from '@/components/UI'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import CheckboxFilter from './CheckboxFilter.vue'
import FilterListSkeleton from './FiltersSkeleton.vue'
import { getValuesFromQuery } from './useFeatureStaticFilter'
import type { Loading } from '@/types'

type SortType = keyof typeof sortAscents
function isSortType(key: string): key is SortType {
  if (key in sortAscents) {
    return true
  }
  return false
}

const { getCategorySpecifications } = useCategoriesStore()
const {
  setQueryParams,
  setFilteredProducts,
  sortAscents,
  productsPrice,
  warranty,
  manufacturer
} = useFilterStore()
const { specificationsValues, search, currentPage, sortColumn, loading } =
  storeToRefs(useFilterStore())

const route = useRoute()
const categoryId = Number(route.params.id)
const loadingProperties = ref<Loading>('loading')
const manufacturers = ref<
  { manufacturerId: number; manufacturerTitle: string }[]
>([])
onBeforeMount(async () => {
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
  specificationsValues.value = data
    .map((e) => {
      const { id, enTitle, visible } = e
      if (e.type) {
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
      } else {
        return {
          id,
          enTitle,
          title: e.title[0].toUpperCase() + e.title.slice(1),
          type: e.type,
          variantsValues: e.variantsValues,
          values: [],
          visible
        }
      }
    })
    .sort((a, b) => Number(b.type) - Number(a.type))
  await setFilterProperties()
  setFilteredProducts(categoryId)
})

const setFilterProperties = async () => {
  const query = route.query
  currentPage.value = query.page ? Number(query.page) - 1 : 0
  search.value = query.q ? String(query.q) : ''
  const querySort =
    typeof query.sort === 'string' ? query.sort.split('_') : null

  if (querySort) {
    const querySortTitle = querySort[0]
    const querySortValue: boolean = !(querySort[1] == 'false')
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
    const values = getValuesFromQuery(field, value.type)
    if (!values) continue
    if (value.type) {
      if ('min' in values) {
        value.minValue = values.min
        value.maxValue = values.max
      }
    } else if ('values' in values) {
      value.values = values.values
    }
  }
  loadingProperties.value = 'success'
}

const router = useRouter()
const apply = () => {
  setQueryParams(router, route)
  currentPage.value = 0
}

const cancel = () => {
  specificationsValues.value.forEach((spec) => {
    if (spec.type) {
      spec.minValue = spec.min
      spec.maxValue = spec.max
    }
    if (!spec.type && !spec.type) {
      spec.values = []
    }
  })
  productsPrice.clear()
  warranty.clear()
  manufacturer.clear()
  search.value = ''
  currentPage.value = 0
  router.push({ query: {} })
}

watch(
  () => route.params,
  async () => {
    loading.value = 'loading'
    await setFilterProperties()
    setFilteredProducts(categoryId)
  },
  {
    flush: 'post'
  }
)

const visibilityFilters = ref<boolean[]>([])
const watcher = watch(
  () => specificationsValues.value.length,
  async () => {
    if (!specificationsValues.value.length) return
    visibilityFilters.value = Array(specificationsValues.value.length)
      .fill(null)
      .map((_, i) => (specificationsValues.value[i].visible ? true : false))
    await nextTick()
    watcher()
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <form
      v-if="loadingProperties === 'success'"
      class="filters"
      @submit.prevent="apply"
    >
      <input-filter
        v-model:min-value="productsPrice.min"
        v-model:max-value="productsPrice.max"
        v-model:visibility="productsPrice.visibility"
        :max="productsPrice.maxStatic"
        :step="500"
        title="Цена"
      />

      <template
        v-for="(value, i) in specificationsValues"
        :key="value.id"
      >
        <template v-if="value.type">
          <input-filter
            v-model:min-value="value.minValue"
            v-model:max-value="value.maxValue"
            v-model:visibility="visibilityFilters[i]"
            :max="value.max"
            :min="value.min"
            :step="value.step"
            :title="value.title"
          />
        </template>
        <checkbox-filter
          v-else
          v-model="visibilityFilters[i]"
          v-model:values="value.values"
          :variants-values="value.variantsValues"
          :title="value.title"
        />
      </template>
      <checkbox-filter
        v-model="manufacturer.visibility"
        v-model:values="manufacturer.values"
        :variants-values="manufacturer.variantsValues"
        title="Производитель"
      />
      <input-filter
        v-model:min-value="warranty.min"
        v-model:max-value="warranty.max"
        v-model:visibility="warranty.visibility"
        :max="warranty.maxStatic"
        :step="1"
        title="Гарантия"
      />
      <div class="py-2 px-4">
        <v-button
          class="mb-4"
          width="100%"
        >
          применить
        </v-button>
        <v-button
          type="button"
          width="100%"
          @click="cancel"
        >
          сбросить
        </v-button>
      </div>
    </form>
    <div v-else-if="loadingProperties === 'loading'">
      <filter-list-skeleton />
    </div>
    <div v-else-if="loadingProperties === 'error'">ошибка</div>
  </div>
</template>

<style scoped lang="sass">
.filters
  background-color: #fff
  transition: .4s
  overflow: hidden
  border-radius: 12px
  :deep(.filter__head)
    @apply flex justify-between font-medium cursor-pointer select-none
    padding: 8px 16px
    transition: .2s
    border-radius: 4px
    &:hover, &.active
      color: var(--color-text)
      svg
        fill: var(--color-text)
    &:hover
      background: var(--light)
  :deep(.filter__content)
    padding: 0 16px
    > div
      margin: 12px 0
</style>
