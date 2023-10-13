<script setup lang="ts">
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { removeFromStorage } from '@/utils/queries/storage'
import { getImgName } from '@/utils/getImgName'
import { VButton, VLoader, VInputText, VInputFile } from '@/components/UI'
import type {
  CategoryRead,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type { Loading } from '@/types'

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
let oldImg: string | undefined = undefined
const newCategory = ref<CategoryUpdate | null>(null)

const setNewCategory = () => {
  const currentCategory: CategoryRead | undefined = categories.value.find(
    (e) => e.id === categoryId
  )
  if (currentCategory) {
    newCategory.value = {
      id: currentCategory.id,
      enTitle: currentCategory.enTitle,
      img: currentCategory.img,
      title: currentCategory.title
    }
  }
}

onBeforeMount(() => {
  if (categories.value.length) {
    setNewCategory()
  }
})

watch(categories, (cur) => {
  if (cur.length) {
    setNewCategory()
  }
})

watch(
  () => newCategory.value,
  (cur) => {
    if (!oldImg && cur?.title && cur?.img) {
      oldImg = getImgName(cur.img)
    }
    if (cur?.title) {
      loading.value = 'success'
    }
  }
)

const save = async () => {
  if (categoryHasId(newCategory.value)) {
    await updateCategory(newCategory.value)
    newCategory.value = {
      id: 0,
      enTitle: '',
      img: '',
      title: ''
    }
    setTimeout(() => (loading.value = 'loading'))
    if (oldImg) {
      const { error } = await removeFromStorage('categories', oldImg)
      if (error) {
        loading.value = 'error'
        return
      }
      router.push({
        name: 'AdminCategories'
      })
    }
  }
}
</script>

<template>
  <div class="container">
    <form
      v-if="loading && newCategory"
      class="list__form mt-16"
      @submit.prevent="save"
    >
      <div>
        <label>наименование на русском</label>
        <v-input-text v-model="newCategory.title" />
      </div>
      <div>
        <label>наименование на английском</label>
        <v-input-text v-model="newCategory.enTitle" />
      </div>
      <div>
        <label>изображение</label>
        <v-input-file
          v-model="newCategory.img"
          folder="categories"
          :required="false"
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
      @click="$router.push({ name: 'AdminCategories' })"
    >
      назад
    </v-button>
  </div>
</template>
