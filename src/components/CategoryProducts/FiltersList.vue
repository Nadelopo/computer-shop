<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useFilterStore } from '@/stores/filterStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import { VCheckbox, VButton } from '@/components/UI'
import SkeletonFiltersVue from './SkeletonFilters.vue'
import type { Loading } from '@/types'

type SortType = keyof typeof sortAscents
function isSortType(key: string): key is SortType {
  if (key in sortAscents) {
    return true
  }
  return false
}

const { getCategorySpecifications } = useCategoriesStore()

const { setQueryParams, setFilteredProducts, sortAscents } = useFilterStore()
const { specificationsValues, productsPrice, search, currentPage, sortColumn } =
  storeToRefs(useFilterStore())

const route = useRoute()
const router = useRouter()

const categoryId = Number(route.params.id)
const loading = ref<Loading>('loading')
const setFilterProperties = async () => {
  const { data, error } = await getCategorySpecifications(categoryId)
  if (error) {
    loading.value = 'error'
    return
  }
  specificationsValues.value = data
    .map((e) => {
      const { id, enTitle, title } = e
      if (e.type) {
        const { min, max, step } = e
        return {
          id,
          enTitle,
          title,
          type: e.type,
          min,
          max,
          minValue: min,
          maxValue: max,
          step
        }
      } else {
        return {
          id,
          enTitle,
          title,
          type: e.type,
          variantsValues: e.variantsValues,
          values: []
        }
      }
    })
    .sort((a, b) => Number(b.type) - Number(a.type))

  const query = route.query
  const price = query.price
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

  if (typeof price === 'string') {
    const [min, max] = price.split('_').map(Number)
    productsPrice.value = {
      min,
      max
    }
  }
  for (const value of specificationsValues.value) {
    const field = query[value.enTitle]
    if (field && value.type && typeof field === 'string') {
      const [min, max] = field.split('_').map(Number)
      value.minValue = min
      value.maxValue = max
    }
    if (field && !value.type) {
      value.values = [...(Array.isArray(field) ? field : [field])].map(String)
    }
  }
  loading.value = 'success'
}

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
  productsPrice.value = {
    min: 0,
    max: 300000
  }
  search.value = ''
  currentPage.value = 0
  router.push({ query: {} })
}

watch(
  () => route.params,
  async () => {
    await setFilterProperties()
    setFilteredProducts(categoryId)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div>
    <div v-if="loading === 'success'" class="filters">
      <input-filter
        v-model:min-value="productsPrice.min"
        v-model:max-value="productsPrice.max"
        :max="300000"
        :step="500"
        title="цена"
        class="mb-6"
      />

      <template v-for="value in specificationsValues" :key="value.id">
        <template v-if="value.type">
          <input-filter
            v-model:min-value="value.minValue"
            v-model:max-value="value.maxValue"
            :max="value.max"
            :min="value.min"
            :step="value.step"
            :title="value.title"
            class="mb-6"
          />
        </template>
        <template v-else>
          <div class="text-center">{{ value.title }}</div>
          <div v-for="variant in value.variantsValues" :key="variant">
            <div>
              <v-checkbox
                :id="value.id"
                v-model="value.values"
                :title="variant"
              />
            </div>
          </div>
        </template>
      </template>
      <div>
        <v-button class="my-4" width="100%" @click="apply">
          применить
        </v-button>
        <v-button width="100%" @click="cancel"> сбросить </v-button>
      </div>
    </div>
    <div v-else-if="loading === 'loading'">
      <SkeletonFiltersVue />
    </div>
    <div v-else-if="loading === 'error'">ошибка</div>
  </div>
</template>

<style scoped lang="sass">

.filters
  background-color: #fff
  transition: .4s
  padding: 20px
  border-radius: 12px
</style>
