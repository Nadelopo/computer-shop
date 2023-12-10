<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { createMany, getAll } from '@/db/queries/tables'
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

const initialFormValue: CategorySpecificationForm = {
  categoryId: null,
  title: '',
  enTitle: '',
  type: 'number',
  visible: false,
  units: '',
  step: 1,
  min: 0,
  max: 64,
  variantsValues: null,
  condition: 'greater'
}

const form = ref<CategorySpecificationForm>({ ...initialFormValue })

const specifications = ref<CategorySpecificationRead[]>([])
const loading = ref<Loading>('success')
const create = async (setValue: boolean) => {
  if (typeof form.value.categoryId !== 'number') return
  loading.value = 'loading'
  const { data, error } = await createCategorySpecifications(
    form.value as CategorySpecificationCreate
  )
  if (error) {
    loading.value = 'error'
    return
  }
  specifications.value.push(data)
  form.value = { ...initialFormValue }
  loading.value = 'success'

  const { data: products, error: errorProducts } = await getAll('products', {
    match: { categoryId: data.categoryId }
  })
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

    const { error: errorSpecifications } = await createMany(
      'specifications',
      initialSpecificationsValue
    )
    if (errorSpecifications) {
      loading.value = 'error'
      return
    }
  }
}
</script>

<template>
  <div>
    <admin-specifications-form
      v-model="form"
      type="create"
      :loading="loading === 'loading'"
      use-set-initial-value
      @submit="create"
    />
    <specifications-list v-model="specifications" />
  </div>
</template>
