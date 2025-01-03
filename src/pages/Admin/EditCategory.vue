<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useCustomRouter, useCustomRoute } from '@/utils/customRouter'
import { VButton, VLoader } from '@/components/UI'
import CategoriesForm from '@/components/Admin/Categories/CategoriesForm.vue'
import type {
  CategoryCreate,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

// type
const categoryHasId = (
  category: CategoryUpdate | undefined
): category is Omit<CategoryUpdate, 'id'> & { id: number } => {
  if (category?.id) {
    return true
  }
  return false
}

const { categories } = storeToRefs(useCategoriesStore())
const { updateCategory } = useCategoriesStore()

const route = useCustomRoute('EditCategory')
const categoryId = Number(route.params.id)

const loading = ref<Loading>('loading')
const form = ref<CategoryCreate>()

onBeforeMount(async () => {
  const currentCategory = categories.value.find((c) => c.id === categoryId)
  if (currentCategory) {
    form.value = currentCategory
    loading.value = 'success'
    return
  }

  const { data, error } = await supabase
    .from('categories')
    .select()
    .eq('id', categoryId)
    .single()
  if (error) {
    loading.value = 'error'
    return
  }

  form.value = data
  loading.value = 'success'
})

const router = useCustomRouter()
const loadingSave = ref<Loading>('success')
const save = async (
  values: CategoryCreate,
  fileActions: InputFileActions | undefined
) => {
  loadingSave.value = 'loading'
  if (categoryHasId(values)) {
    const data = await fileActions?.onSave()
    if (!data) return
    if (data.error) {
      loadingSave.value = 'error'
      return
    }
    await updateCategory({ ...values, img: data.url })
    await router.push({
      name: 'AdminCategories'
    })
    loadingSave.value = 'success'
  }
}

const back = async () => {
  await router.push({ name: 'AdminCategories' })
}
</script>

<template>
  <div class="container">
    <categories-form
      v-if="loading === 'success' && form"
      :form-data="form"
      type="update"
      :loading="loadingSave === 'loading'"
      class="pt-16"
      @submit="save"
    />
    <div
      v-else
      class="min-h-screen flex justify-center items-center"
    >
      <v-loader />
    </div>
    <v-button
      class="mt-6"
      @click="back"
    >
      назад
    </v-button>
  </div>
</template>
