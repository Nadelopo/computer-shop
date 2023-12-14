<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import CategoriesList from '@/components/Admin/Categories/CategoriesList.vue'
import CategoriesForm from '@/components/Admin/Categories/CategoriesForm.vue'
import type { CategoryCreate } from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const { createCategory } = useCategoriesStore()

let form = ref<CategoryCreate>({
  img: '',
  title: '',
  enTitle: ''
})

const loadingCreate = ref<Loading>('success')
const create = async (fileActions: InputFileActions | undefined) => {
  loadingCreate.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loadingCreate.value = 'error'
    return
  }
  if (url) {
    form.value.img = url
  }
  const { error } = await createCategory(form.value)
  if (error) {
    loadingCreate.value = 'error'
    return
  }
  form.value = {
    img: '',
    title: '',
    enTitle: ''
  }
  fileActions?.clear()
  loadingCreate.value = 'success'
}
</script>

<template>
  <categories-form
    v-model="form"
    type="create"
    :loading="loadingCreate === 'loading'"
    @submit="create"
  />
  <categories-list />
</template>
