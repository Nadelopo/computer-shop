<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { getOneById } from '@/db/queries/tables'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { VButton, VLoader } from '@/components/UI'
import CategoriesForm from '@/components/Admin/Categories/CategoriesForm.vue'
import type {
  CategoryCreate,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

//type
const categoryHasId = (
  category: CategoryUpdate | undefined
): category is Omit<CategoryUpdate, 'id'> & { id: number } => {
  if (category?.id) {
    return true
  }
  return false
}

const route = useRoute()
const router = useCustomRouter()

const { categories } = storeToRefs(useCategoriesStore())
const { updateCategory } = useCategoriesStore()
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
  const { data, error } = await getOneById('categories', categoryId)
  if (error) {
    loading.value = 'error'
    return
  }
  form.value = data
  loading.value = 'success'
})

const loadingSave = ref<Loading>('success')
const save = async (fileActions: InputFileActions | undefined) => {
  loadingSave.value = 'loading'
  if (categoryHasId(form.value)) {
    const data = await fileActions?.onSave()
    if (!data) return
    if (data.error) {
      loadingSave.value = 'error'
      return
    }
    form.value.img = data.url
    await updateCategory(form.value)
    await router.customPush({
      name: 'AdminCategories'
    })
    loadingSave.value = 'success'
  }
}

const back = async () => {
  await router.customPush({ name: 'AdminCategories' })
}
</script>

<template>
  <div class="container">
    <categories-form
      v-if="loading === 'success' && form"
      v-model="form"
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
