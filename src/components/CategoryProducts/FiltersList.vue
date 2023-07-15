<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useFilterStore } from '@/stores/filterStore'
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import CheckboxFilter from '@/components/CategoryProducts/CheckboxFilter.vue'
import VButton from '../UI/VButton.vue'
import SkeletonFiltersVue from './SkeletonFilters.vue'

const { getCategorySpecifications } = useCategoriesStore()

const { setFilteredProducts } = useFilterStore()
const { specificationsValues, productsPrice, search } = storeToRefs(
  useFilterStore()
)

const route = useRoute()

const categoryId = Number(route.params.id)

onBeforeMount(async () => {
  const data = await getCategorySpecifications(categoryId)
  if (data) {
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
  }
  const query = route.query
  const price = route.query.price
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
})

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
  setFilteredProducts(categoryId)
}
</script>

<template>
  <div>
    <div v-if="specificationsValues.length" class="filters">
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
              <checkbox-filter
                :id="value.id"
                v-model="value.values"
                :title="variant"
                :en-title="value.enTitle"
              />
            </div>
          </div>
        </template>
      </template>
      <div>
        <v-button
          class="my-4"
          width="100%"
          @click="setFilteredProducts(categoryId)"
        >
          применить
        </v-button>
        <v-button width="100%" @click="cancel"> сбросить </v-button>
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
