<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { VButton, VLoader, VInputText, VInputFile } from '@/components/UI'
import { getOneById } from '@/db/queries/tables'
import type { CategoryUpdate } from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

//type
const categoryHasId = (
  category: CategoryUpdate | null
): category is Omit<CategoryUpdate, 'id'> & { id: number } => {
  if (category?.id) {
    return true
  }
  return false
}

const route = useRoute()
const router = useRouter()

const { categories } = storeToRefs(useCategoriesStore())
const { updateCategory } = useCategoriesStore()
const categoryId = Number(route.params.id)

const loading = ref<Loading>('loading')
const category = ref<CategoryUpdate | null>(null)

const setCategoryData = async () => {
  const currentCategory = categories.value.find((c) => c.id === categoryId)
  if (currentCategory) {
    category.value = currentCategory
    loading.value = 'success'
    return
  }
  const { data, error } = await getOneById('categories', categoryId)
  if (error) {
    loading.value = 'error'
    return
  }
  category.value = data
  loading.value = 'success'
}

onBeforeMount(async () => {
  await setCategoryData()
})

const inputFileRef = ref<InputFileActions>()
const save = async () => {
  if (categoryHasId(category.value)) {
    loading.value = 'loading'
    const data = await inputFileRef.value?.onSave()
    if (!data) return
    if (data.error) {
      loading.value = 'error'
      return
    }
    category.value.img = data.url
    await updateCategory(category.value)
    router.push({
      name: 'AdminCategories'
    })
  }
}

const back = async () => {
  await router.push({ name: 'AdminCategories' })
}
</script>

<template>
  <div class="container">
    <form
      v-if="loading === 'success' && category"
      class="list__form mt-16"
      @submit.prevent="save"
    >
      <div>
        <label>наименование на русском</label>
        <v-input-text v-model="category.title" />
      </div>
      <div>
        <label>наименование на английском</label>
        <v-input-text v-model="category.enTitle" />
      </div>
      <div>
        <label>изображение</label>
        <v-input-file
          ref="inputFileRef"
          :file-url="category.img"
          :required="false"
          folder="categories"
        />
      </div>
      <div>
        <v-button>сохранить</v-button>
      </div>
    </form>
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
