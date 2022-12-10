<script setup lang="ts">
import InputFilter from '@/components/CategoryProducts/InputFilter.vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import type { IcategorySpecificationR } from '@/types/tables'
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import SkeletonFiltersVue from './SkeletonFilters.vue'

const { getCategorySpecifications } = useCategoriesStore()

const categoryId = Number(useRoute().params.id)

const specifications = ref<IcategorySpecificationR[] | null>(null)

onBeforeMount(async () => {
  const { data } = await getCategorySpecifications(categoryId)
  specifications.value = data
})
</script>

<template>
  <div>
    <div v-if="specifications" class="filters">
      <template v-for="spec in specifications" :key="spec.ids">
        <template v-if="spec.type">
          <InputFilter
            :min-value="Number(spec.min)"
            :max-value="Number(spec.max)"
            :step="Number(spec.step)"
            :title="spec.title"
            class="mb-6"
          />
        </template>
      </template>
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
