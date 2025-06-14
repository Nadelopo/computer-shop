<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/modules/categories/model/categoriesStore'
import CategoryEditor from '@/modules/categories/components/CategoryEditor.vue'
import CategoriesList from './components/CategoriesList.vue'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { CategoryCreate } from '@/modules/categories/model/categories.types'
import type { Loading } from '@/types'

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
