<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { supabase } from '@/supabase'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import VButtonVue from '../UI/VButton.vue'
import SkeletonFiltersVue from './SkeletonFilters.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'

type SpecificationsValues = {
  id: number
  minValue: number
  maxValue: number
  type: boolean
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
    specifications.value = data
    specificationsValues.value = data.map((e) => {
      return {
        id: e.id,
        minValue: Number(e.min),
        maxValue: Number(e.max),
        type: e.type
      }
    })
  }
})

type inputdefineExpose = {
  apply: () => void
  resetValue: () => void
}

const inputRef = ref<inputdefineExpose[]>([])

const filter = async () => {
  for (let input of inputRef.value) {
    input.apply()
  }
  loader.value = 'loading'
  const arrayPoructId: number[][] = []

  for (let spec of specificationsValues.value) {
    if (spec.type) {
      let query = supabase
        .from('specifications')
        .select('categorySpecificationsId, productId!inner(id, categoryId)')
        .order('id')
        .match({
          'productId.categoryId': categoryId,
          categorySpecificationsId: spec.id
        })
      arrayPoructId.push([])
      {
        query = query.gte('valueNumber', spec.minValue)
      }
      {
        query = query.lte('valueNumber', spec.maxValue)
      }
      {
        query = query.eq('categorySpecificationsId', spec.id)
      }

      const { data } = await query
      for (const d of data!) {
        arrayPoructId[arrayPoructId.length - 1].push(d.productId.id)
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
    if (spec.type) {
      console.log(specificationsValues.value[i].minValue)
      specificationsValues.value[i].minValue = spec.min
      specificationsValues.value[i].maxValue = spec.max
    }
  })
  for (let input of inputRef.value) {
    input.resetValue()
  }
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

      <template v-for="(spec, i) in specifications" :key="spec.ids">
        <template v-if="spec.type">
          <InputFilter
            ref="inputRef"
            v-model:min-value="specificationsValues[i].minValue"
            v-model:max-value="specificationsValues[i].maxValue"
            :max="Number(spec.max)"
            :min="Number(spec.min)"
            :step="Number(spec.step)"
            :title="spec.title"
            class="mb-6"
          />
        </template>
      </template>
      <div>
        <v-button-vue class="mx-auto mb-2 w-full" @click="filter">
          применить
        </v-button-vue>
        <v-button-vue class="mx-auto w-full" @click="cancel">
          сбросить
        </v-button-vue>
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
