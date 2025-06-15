<script setup lang="ts">
import { ref } from 'vue'
import {
  useCategoriesStore,
  CategoryEditor,
  type CategoryCreate
} from '@/modules/categories'
import CategoriesList from './components/CategoriesList.vue'
import type { InputFileActions } from '@/shared/components/UI/VInputFile/types'
import type { Loading } from '@/shared/types'

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
  <CategoryEditor
    type="create"
    :loading="loadingCreate === 'loading'"
    @submit="create"
  />
  <CategoriesList />
</template>
