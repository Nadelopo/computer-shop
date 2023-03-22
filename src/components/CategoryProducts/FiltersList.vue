<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categoriesStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import VButtonVue from '../UI/VButton.vue'
import SkeletonFiltersVue from './SkeletonFilters.vue'
import { supabase } from '@/supabase'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
// import { getAllByColumn } from '@/utils/dbQueries'
// import type { IproductWithSpecifications } from '@/types'
// import { supabase } from '@/supabase'

type SpecificationsValues = {
  id: number
  minValue: number
  maxValue: number
}

const { getCategorySpecifications } = useCategoriesStore()

const categoryId = Number(useRoute().params.id)

const specifications = ref<CategorySpecificationRead[] | null>(null)
const specificationsValues = ref<SpecificationsValues[]>([])

onBeforeMount(async () => {
  const data = await getCategorySpecifications(categoryId)
  specifications.value = data
  if (data) {
    specificationsValues.value = data.map((e) => {
      return {
        id: e.id,
        minValue: Number(e.min),
        maxValue: Number(e.max)
      }
    })
  }
})

const inputRef = ref<{ apply: () => void }[]>([])

const filter = async () => {
  for (let input of inputRef.value) {
    input.apply()
  }

  // const query =  getAllByColumn<IproductWithSpecifications>('specifications','categoryId', categoryId,'*','id')
  // let query = await supabase
  //   .from('specifications')
  //   .select(
  //     '*, categorySpecificationsId!inner(id, categoryId), productId!inner(price)'
  //   )
  //   .gt('productId.price', 23000)
  // console.log(query)

  let query = supabase
    .from('specifications')
    .select('*')
    .order('id')
    .eq('categorySpecificationsId', 2)

  for (let spec of specificationsValues.value) {
    if (spec.id === 2) {
      console.log(spec)
      {
        query = query.gte('value', spec.minValue)
      }
      {
        query = query.lte('value', spec.maxValue)
      }
    }
    console.log(spec.id)
    // {query = query.gte('population', filterPopLow)}
    // {query = query.lt('population', filterPopLow)}
  }
  const { data } = await query
  console.log(data)
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
      <v-button-vue class="mx-auto" @click="filter">применить</v-button-vue>
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
