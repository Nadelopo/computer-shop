<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { supabase } from '@/db/supabase'
import AdminSpecificationsForm from '@/components/Admin/Specifications/SpecificationsForm.vue'
import SpecificationsList from '@/components/Admin/Specifications/SpecificationsList.vue'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'
import type { Loading } from '@/types'
import type { CategorySpecificationForm } from '@/components/Admin/Specifications/types'

const { createCategorySpecifications } = useCategoriesStore()

const specifications = ref<CategorySpecificationRead[]>([])
const loading = ref<Loading>('success')
const create = async (
  values: CategorySpecificationForm,
  setValue: boolean,
  resetForm: () => void
) => {
  if (typeof values.categoryId !== 'number') return
  loading.value = 'loading'
  const { data, error } = await createCategorySpecifications(
    values as CategorySpecificationCreate
  )
  if (error) {
    loading.value = 'error'
    return
  }
  specifications.value.push(data)
  resetForm()
  loading.value = 'success'

  const { data: products, error: errorProducts } = await supabase
    .from('products')
    .select('id')
    .eq('categoryId', data.categoryId)
  if (errorProducts) {
    loading.value = 'error'
    return
  }

  if (setValue) {
    const initialSpecificationsValue: SpecificationCreate[] = []
    for (const product of products || []) {
      initialSpecificationsValue.push({
        productId: product.id,
        categorySpecificationsId: data.id,
        valueNumber: data.type === 'number' ? data.min : null,
        valueString: data.type === 'number' ? null : [data.variantsValues[0]]
      })
    }

    const { error: errorSpecifications } = await supabase
      .from('specifications')
      .insert(initialSpecificationsValue)
    if (errorSpecifications) {
      loading.value = 'error'
    }
  }
}
</script>

<template>
  <admin-specifications-form
    type="create"
    :loading="loading === 'loading'"
    use-set-initial-value
    @submit="create"
  />
  <specifications-list v-model="specifications" />
</template>
