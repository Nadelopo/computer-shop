<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { supabase } from '@/supabase'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import CheckboxFilter from '@/components/CategoryProducts/CheckboxFilter.vue'
import VButton from '../UI/VButton.vue'
import SkeletonFiltersVue from './SkeletonFilters.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { PostgrestResponse } from '@supabase/supabase-js'

type SpecificationsValues =
  | {
      id: number
      minValue: number
      maxValue: number
      type: true
    }
  | {
      id: number
      variantsValues: string[]
      type: false
    }

type QueryData = {
  categorySpecificationsId: {
    id: number
    enTitle: string
  }
  productId: {
    categoryId: number
    id: number
  }
}

type VariantsValues = {
  id: number
  variants: string[]
}

const { getCategorySpecifications } = useCategoriesStore()

const { getProduct } = useProductsStore()
const { products, loader } = storeToRefs(useProductsStore())

const categoryId = Number(useRoute().params.id)

const specifications = ref<CategorySpecificationRead[]>([])
const specificationsValues = ref<SpecificationsValues[]>([])

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
            type: e.type
          }
        } else {
          return {
            id: e.id,
            variantsValues: e.variantsValues,
            type: e.type
          }
        }
      })
      .sort((a, b) => Number(b.type) - Number(a.type))
  }
})

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

const inputRef = ref<inputDefineExpose[]>([])
const checkboxRef = ref<checkboxDefineExpose[]>([])

const filter = async () => {
  for (let input of inputRef.value) {
    input.apply()
  }
  const data = []
  for (let checkbox of checkboxRef.value) {
    const checkboxResult = checkbox.apply()
    if (checkboxResult) {
      data.push(checkboxResult)
    }
  }
  let variantsValues: VariantsValues[] = []
  for (const el of data) {
    const variantExists = variantsValues.find((e) => e.id === el.id)
    if (variantExists) {
      variantsValues = variantsValues.map((e) =>
        e.id === el.id ? { ...e, variants: [...e.variants, el.title] } : e
      )
    } else {
      variantsValues.push({ id: el.id, variants: [el.title] })
    }
  }

  loader.value = 'loading'
  const arrayPoructId: number[][] = []

  for (let spec of specificationsValues.value) {
    let query = supabase
      .from('specifications')
      .select(
        'categorySpecificationsId!inner(id, enTitle), productId!inner(id, categoryId)'
      )
      .order('id')
      .match({
        'productId.categoryId': categoryId,
        'categorySpecificationsId.id': spec.id
      })
    arrayPoructId.push([])
    if (spec.type) {
      {
        query = query.gte('valueNumber', spec.minValue)
        query = query.lte('valueNumber', spec.maxValue)
      }
    } else {
      for (const variant of variantsValues) {
        if (spec.id == variant.id) {
          {
            query = query.in('valueString', variant.variants)
          }
        }
      }
    }
    const { data }: PostgrestResponse<QueryData> = await query
    if (data) {
      for (const el of data) {
        arrayPoructId[arrayPoructId.length - 1].push(el.productId.id)
      }
    }
  }

  const filteredProductsId = arrayPoructId[0].filter((value) => {
    return arrayPoructId.every((arr) => arr.includes(value))
  })

  const filteredProducts: ProductWithSpecifications[] = []
  for (const id of filteredProductsId) {
    const data = await getProduct(id)
    if (data.value) {
      filteredProducts.push(data.value)
    }
  }

  products.value = filteredProducts
  loader.value = 'success'
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
    <div v-if="specifications && specificationsValues" class="filters">
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
          <div>{{ specifications[i].title }}</div>
          <div
            v-for="variant in specifications[i].variantsValues"
            :key="variant"
          >
            <div>
              <checkbox-filter
                :id="specifications[i].id"
                ref="checkboxRef"
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
