<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useFilterStore } from '@/stores/filterStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import CheckboxFilter from '@/components/CategoryProducts/CheckboxFilter.vue'
import VButton from '../UI/VButton.vue'
import SkeletonFiltersVue from './SkeletonFilters.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

type inputDefineExpose = {
  apply: () => void
  resetValue: () => void
}

type checkboxDefineExpose = {
  apply: () =>
    | {
        id: number
        title: string
      }
    | undefined
  resetValue: () => void
}

const { getCategorySpecifications } = useCategoriesStore()

const { setFilteredProducts } = useFilterStore()
const { specificationsValues } = storeToRefs(useFilterStore())

const route = useRoute()
const router = useRouter()

const categoryId = Number(route.params.id)

const specifications = ref<CategorySpecificationRead[]>([])

onBeforeMount(async () => {
  const data = await getCategorySpecifications(categoryId)
  if (data) {
    specifications.value = data.sort((a, b) => Number(b.type) - Number(a.type))
    specificationsValues.value = data
      .map((e) => {
        if (e.type) {
          return {
            id: e.id,
            minValue: Number(e.min),
            maxValue: Number(e.max),
            type: e.type,
            enTitle: e.enTitle
          }
        } else {
          return {
            id: e.id,
            variantsValues: [],
            type: e.type,
            enTitle: e.enTitle
          }
        }
      })
      .sort((a, b) => Number(b.type) - Number(a.type))
  }
})

const inputRef = ref<inputDefineExpose[]>([])
const checkboxRef = ref<checkboxDefineExpose[]>([])

const filter = async () => {
  inputRef.value.forEach((e) => e.apply())
  checkboxRef.value.forEach((e) => e.apply())
  setTimeout(() => {
    let query: any = {}
    for (const value of specificationsValues.value) {
      if (!value.type) {
        query[value.enTitle] = value.variantsValues
        console.log(query)
      } else {
        query[value.enTitle] = `${value.minValue}_${value.maxValue}`
      }
    }
    router.push({
      query: {
        ...route.query,
        ...query
      }
    })
  })

  setFilteredProducts(categoryId)
}

const cancel = () => {
  specifications.value.forEach((spec, i) => {
    const specificationValue = specificationsValues.value[i]
    if (spec.type && specificationValue.type) {
      specificationValue.minValue = spec.min
      specificationValue.maxValue = spec.max
    }
  })

  inputRef.value.forEach((e) => e.resetValue())
  checkboxRef.value.forEach((e) => e.resetValue())

  filter()
}
</script>

<template>
  <div>
    <div
      v-if="specifications.length && specificationsValues.length"
      class="filters"
    >
      <InputFilter
        ref="inputRef"
        :max="300000"
        :step="500"
        title="цена"
        class="mb-6"
      />

      <template v-for="(value, i) in specificationsValues" :key="value.id">
        <template v-if="value.type">
          <InputFilter
            ref="inputRef"
            v-model:min-value="value.minValue"
            v-model:max-value="value.maxValue"
            :max="Number(specifications[i].max)"
            :min="Number(specifications[i].min)"
            :step="Number(specifications[i].step)"
            :title="specifications[i].title"
            class="mb-6"
          />
        </template>
        <template v-else>
          <div class="text-center">{{ specifications[i].title }}</div>
          <div
            v-for="variant in specifications[i].variantsValues"
            :key="variant"
          >
            <div>
              <checkbox-filter
                :id="specifications[i].id"
                ref="checkboxRef"
                v-model="value.variantsValues"
                :title="variant"
                :en-title="specifications[i].enTitle"
              />
            </div>
          </div>
        </template>
      </template>
      <div>
        <v-button class="mx-auto my-4 w-full" @click="filter">
          применить
        </v-button>
        <v-button class="mx-auto w-full" @click="cancel"> сбросить </v-button>
      </div>
    </div>
    <div v-else>
      <SkeletonFiltersVue />
    </div>
  </div>
</template>

<style scoped lang="sass">

.filters
  background-color: #fff
  transition: .4s
  padding: 20px
  border-radius: 12px
</style>
