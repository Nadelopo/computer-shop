<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import CategoriesList from '@/components/Admin/Categories/CategoriesList.vue'
import CategoriesForm from '@/components/Admin/Categories/CategoriesForm.vue'
import type { CategoryCreate } from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const { createCategory } = useCategoriesStore()

const loadingCreate = ref<Loading>('success')
const create = async (
  values: CategoryCreate,
  fileActions: InputFileActions | undefined,
  resetForm: () => void
) => {
  loadingCreate.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loadingCreate.value = 'error'
    return
  }
  const img = url ?? ''
  const { error } = await createCategory({ ...values, img })
  if (error) {
    loadingCreate.value = 'error'
    return
  }
  resetForm()
  fileActions?.clear()
  loadingCreate.value = 'success'
}
</script>

<template>
  <categories-form
    type="create"
    :loading="loadingCreate === 'loading'"
    @submit="create"
  />
  <categories-list />
</template>
